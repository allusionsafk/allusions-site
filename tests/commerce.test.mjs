import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, createHash, randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCommerceLab } from '../commerce/lab.mjs';

const instant = Date.parse('2026-10-24T12:00:00Z');
const key = '00000000-0000-4000-8000-000000000001';
const identity = { storeId: '11', productId: '22', variantId: '33' };
const bytes = Buffer.from('Original ALLUSIONS commerce laboratory text. No software download.\n');
const artifact = { id: 'quire-lab-text-v1', size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
function fixture(t, options = {}) {
  const signingSecret = randomBytes(20).toString('hex');
  const grantSecret = randomBytes(32);
  const config = { enabled: true, mode: 'mock', database: ':memory:', signingSecret, grantSecret,
    identity, artifact, now: () => instant, timeoutMs: 40,
    verifyLicense: async value => ({ valid: value === key, license_key: { key: value, status: 'active', expires_at: null },
      meta: { store_id: 11, product_id: 22, variant_id: 33, order_id: 101 } }),
    loadArtifact: async () => bytes, ...options };
  const lab = createCommerceLab(config);
  t.after(() => lab.close());
  const event = (name = 'order_created', overrides = {}) => ({ meta: { event_name: name, test_mode: true }, data: {
    type: 'orders', id: '101', attributes: { store_id: 11, test_mode: true, status: name === 'order_created' ? 'paid' : 'refunded',
      total: 1500, currency: 'USD', refunded: name !== 'order_created', refunded_amount: name === 'order_created' ? 0 : 1500,
      updated_at: new Date(instant).toISOString(), first_order_item: { order_id: 101, product_id: 22, variant_id: 33, test_mode: true }, ...overrides } } });
  const webhook = (value, change = {}) => {
    const body = typeof value === 'string' ? value : JSON.stringify(value);
    return lab.handle(new Request('https://mock.invalid/webhooks/lemon', { method: 'POST', body,
      headers: { 'content-type': 'application/json', 'x-signature': createHmac('sha256', signingSecret).update(body).digest('hex'), ...change } }));
  };
  const post = (path, body, token) => lab.handle(new Request('https://mock.invalid' + path, { method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body) }));
  return { lab, event, webhook, post, config };
}
test('commerce is off by default, and live/sandbox adapters cannot be enabled', async () => {
  const off = createCommerceLab();
  assert.equal((await off.handle(new Request('https://mock.invalid/webhooks/lemon', { method: 'POST', body: 'x' }))).status, 503);
  off.close();
  assert.throws(() => createCommerceLab({ enabled: true, mode: 'live' }), /mock/);
  assert.throws(() => createCommerceLab({ enabled: true, mode: 'sandbox' }), /mock/);
});
test('signed mock payment grants one exact text download; replay cannot reuse it', async t => {
  const { lab, event, webhook, post } = fixture(t);
  assert.equal((await webhook(event())).status, 200);
  const grant = await post('/grant', { licenseKey: key });
  assert.equal(grant.status, 200);
  const { token, environment } = await grant.json();
  assert.equal(environment, 'mock');
  const result = await post('/redeem', { licenseKey: key }, token);
  assert.equal(result.status, 200);
  assert.deepEqual(Buffer.from(await result.arrayBuffer()), bytes);
  assert.equal((await post('/redeem', { licenseKey: key }, token)).status, 403);
  assert.equal(lab.report().environment, 'mock');
  assert.equal(lab.report().providerConfirmedOrders, 0);
  assert.equal(lab.report().currencies[0].netProceeds, null);
});
for (const variant of ['forged', 'changed', 'missing', 'short']) test('raw HMAC rejects ' + variant, async t => {
  const { event, webhook, lab, config } = fixture(t);
  const input = event();
  const headers = { 'x-signature': variant === 'short' ? 'aa' : variant === 'missing' ? '' : '0'.repeat(64) };
  if (variant === 'changed') {
    headers['x-signature'] = createHmac('sha256', config.signingSecret).update(JSON.stringify(input)).digest('hex');
    input.data.attributes.total = 1600;
  }
  const result = await webhook(input, headers);
  assert.equal(result.status, 401);
  assert.equal(lab.report().mockPaidOrders, 0);
});
for (const [name, mutate] of [
  ['store', e => { e.data.attributes.store_id = 12; }],
  ['variant', e => { e.data.attributes.first_order_item.variant_id = 34; }],
  ['product', e => { e.data.attributes.first_order_item.product_id = 23; }],
  ['item order', e => { e.data.attributes.first_order_item.order_id = 102; }],
  ['live mode', e => { e.meta.test_mode = false; }],
  ['unpaid', e => { e.data.attributes.status = 'pending'; }],
  ['stale creation', e => { e.data.attributes.updated_at = '2025-01-01T00:00:00Z'; }],
  ['future', e => { e.data.attributes.updated_at = '2030-01-01T00:00:00Z'; }],
  ['boolean total', e => { e.data.attributes.total = true; }],
]) test('signed invalid ' + name + ' cannot grant access', async t => {
  const { event, webhook, post } = fixture(t);
  const input = event(); mutate(input);
  assert.equal((await webhook(input)).status, 422);
  assert.equal((await post('/grant', { licenseKey: key })).status, 403);
});
test('malformed and oversized signed payloads fail closed', async t => {
  const { webhook } = fixture(t);
  assert.equal((await webhook('{')).status, 400);
  assert.equal((await webhook(' '.repeat(65537))).status, 413);
});
test('duplicates and changed JSON serialization never double count', async t => {
  const { event, webhook, lab } = fixture(t);
  const input = event();
  assert.equal((await webhook(input)).status, 200);
  assert.equal((await (await webhook(input)).json()).status, 'duplicate');
  assert.equal((await webhook(JSON.stringify(input, null, 2))).status, 200);
  assert.equal(lab.report().mockPaidOrders, 1);
  assert.equal(lab.report().currencies[0].gross, 1500);
});
for (const reverse of [false, true]) test('refund cannot be undone by creation, reverse=' + reverse, async t => {
  const { event, webhook, post, lab } = fixture(t);
  for (const name of reverse ? ['order_refunded', 'order_created'] : ['order_created', 'order_refunded', 'order_created'])
    assert.equal((await webhook(event(name))).status, 200);
  assert.equal((await post('/grant', { licenseKey: key })).status, 403);
  assert.equal(lab.report().revokedOrders, 1);
});
test('refund after token issuance blocks redemption; partial refunds quarantine too', async t => {
  const { event, webhook, post } = fixture(t);
  await webhook(event());
  const { token } = await (await post('/grant', { licenseKey: key })).json();
  await webhook(event('order_refunded', { status: 'partial_refund', refunded: false, refunded_amount: 1 }));
  assert.equal((await post('/redeem', { licenseKey: key }, token)).status, 403);
});
test('expired, corrupted and unrelated licence grants fail closed', async t => {
  let time = instant;
  const { event, webhook, post } = fixture(t, { now: () => time });
  await webhook(event());
  const { token } = await (await post('/grant', { licenseKey: key })).json();
  assert.equal((await post('/redeem', { licenseKey: key }, token.slice(0, -2) + 'xx')).status, 403);
  assert.equal((await post('/redeem', { licenseKey: key.replace(/1$/, '2') }, token)).status, 403);
  time += 121000;
  assert.equal((await post('/redeem', { licenseKey: key }, token)).status, 403);
});
test('concurrent redemption has one winner', async t => {
  const { event, webhook, post } = fixture(t);
  await webhook(event());
  const { token } = await (await post('/grant', { licenseKey: key })).json();
  const results = await Promise.all([post('/redeem', { licenseKey: key }, token), post('/redeem', { licenseKey: key }, token)]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 403]);
});
for (const problem of ['network', 'timeout', 'wrong-product', 'disabled']) test('licence ' + problem + ' never authorizes', async t => {
  const verifyLicense = async () => {
    if (problem === 'network') throw new Error('private provider details');
    if (problem === 'timeout') return new Promise(() => {});
    return { valid: true, license_key: { key, status: problem === 'disabled' ? 'disabled' : 'active', expires_at: null },
      meta: { store_id: 11, product_id: problem === 'wrong-product' ? 999 : 22, variant_id: 33, order_id: 101 } };
  };
  const { event, webhook, post } = fixture(t, { verifyLicense });
  await webhook(event());
  const response = await post('/grant', { licenseKey: key });
  assert.equal(response.status, ['network', 'timeout'].includes(problem) ? 503 : 403);
  assert.doesNotMatch(await response.text(), /private|provider details/);
});
test('corrupt fixture fails before consuming the grant; correct retry succeeds', async t => {
  let corrupt = true;
  const { event, webhook, post } = fixture(t, { loadArtifact: async () => corrupt ? Buffer.from('corrupt') : bytes });
  await webhook(event());
  const { token } = await (await post('/grant', { licenseKey: key })).json();
  assert.equal((await post('/redeem', { licenseKey: key }, token)).status, 503);
  corrupt = false;
  assert.equal((await post('/redeem', { licenseKey: key }, token)).status, 200);
});
test('interrupted transaction rolls back event and entitlement together', async t => {
  let fail = true;
  const { event, webhook, post } = fixture(t, { afterEventInsert: () => { if (fail) throw new Error('injected'); } });
  assert.equal((await webhook(event())).status, 503);
  assert.equal((await post('/grant', { licenseKey: key })).status, 403);
  fail = false;
  assert.equal((await webhook(event())).status, 200);
  assert.equal((await post('/grant', { licenseKey: key })).status, 200);
});
test('durable duplicate and refund state survives restart without raw payload or key', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'allusions-commerce-test-'));
  const first = fixture(t, { database: join(folder, 'mock.sqlite') });
  await first.webhook(first.event()); await first.webhook(first.event('order_refunded'));
  first.lab.close();
  const second = createCommerceLab(first.config);
  t.after(() => second.close());
  // Registered after both close callbacks: Windows holds open SQLite files.
  t.after(() => rm(folder, { recursive: true, force: true }));
  assert.equal(second.report().revokedOrders, 1);
  const raw = JSON.stringify(second.report());
  assert.doesNotMatch(raw, /licenseKey|user_email|00000000|token|customer/);
  const body = JSON.stringify(first.event());
  const response = await second.handle(new Request('https://mock.invalid/webhooks/lemon', { method: 'POST', body,
    headers: { 'content-type': 'application/json', 'x-signature': createHmac('sha256', first.config.signingSecret).update(body).digest('hex') } }));
  assert.equal((await response.json()).status, 'duplicate');
  assert.throws(() => createCommerceLab({ ...first.config, identity: { ...identity, productId: '999' } }), /identity mismatch/);
});
for (const type of ['text/plain', 'application/json; charset=latin1', 'application/json; other=1'])
  test('unsupported request media type ' + type, async t => {
    const { event, webhook } = fixture(t);
    assert.equal((await webhook(event(), { 'content-type': type })).status, 415);
  });
test('stalled bodies and cancelled requests are bounded without starting provider work', async t => {
  let calls = 0;
  const { lab } = fixture(t, { verifyLicense: async () => { calls++; throw new Error('must not start'); } });
  const response = await lab.handle(new Request('https://mock.invalid/grant', { method: 'POST',
    headers: { 'content-type': 'application/json' }, body: new ReadableStream({}), duplex: 'half' }));
  assert.equal(response.status, 503);
  const abort = new AbortController(); abort.abort();
  assert.equal((await lab.handle(new Request('https://mock.invalid/grant', { method: 'POST',
    signal: abort.signal, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ licenseKey: key }) }))).status, 503);
  assert.equal(calls, 0);
});
test('closed storage fails with sanitized response, never an entitlement', async t => {
  const { lab, event, webhook } = fixture(t); lab.close();
  const response = await webhook(event());
  assert.equal(response.status, 503); assert.equal(await response.text(), '{"error":"commerce_unavailable"}');
});
