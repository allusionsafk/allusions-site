import { randomBytes, createHash, createHmac } from 'node:crypto';
import assert from 'node:assert/strict';
import { createCommerceLab } from './lab.mjs';
import { feeScenario } from './economics.mjs';

// No server, network, merchant account, database file or software release.
const now = Date.now();
const signingSecret = randomBytes(20).toString('hex');
const key = randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
const bytes = Buffer.from('Original ALLUSIONS mock fulfilment fixture. This is not Quire software.\n');
const lab = createCommerceLab({ enabled: true, mode: 'mock', signingSecret, grantSecret: randomBytes(32),
  identity: { storeId: '11', productId: '22', variantId: '33' },
  artifact: { id: 'quire-lab-text-v1', size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') },
  verifyLicense: async input => ({ valid: input === key, license_key: { key: input, status: 'active', expires_at: null },
    meta: { store_id: 11, product_id: 22, variant_id: 33, order_id: 101 } }), loadArtifact: async () => bytes });
try {
  const body = JSON.stringify({ meta: { event_name: 'order_created', test_mode: true }, data: { type: 'orders', id: '101',
    attributes: { store_id: 11, test_mode: true, status: 'paid', total: 1500, refunded: false, refunded_amount: 0,
      currency: 'USD', updated_at: new Date(now).toISOString(),
      first_order_item: { order_id: 101, product_id: 22, variant_id: 33, test_mode: true } } } });
  const event = await lab.handle(new Request('https://mock.invalid/webhooks/lemon', { method: 'POST', body,
    headers: { 'content-type': 'application/json', 'x-signature': createHmac('sha256', signingSecret).update(body).digest('hex') } }));
  assert.equal(event.status, 200);
  const grant = await lab.handle(new Request('https://mock.invalid/grant', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ licenseKey: key }) }));
  assert.equal(grant.status, 200);
  const { token } = await grant.json();
  const download = await lab.handle(new Request('https://mock.invalid/redeem', { method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ licenseKey: key }) }));
  assert.equal(download.status, 200);
  const received = await download.arrayBuffer();
  assert.deepEqual(Buffer.from(received), bytes);
  console.log(JSON.stringify({ classification: 'local-mock-only', eventStatus: event.status, downloadStatus: download.status,
    receivedBytes: received.byteLength, report: lab.report(),
    unapprovedPriceScenarios: [2900, 3900, 4900].map(totalCents => feeScenario({ totalCents })) }, null, 2));
} finally { lab.close(); }
