import { randomBytes } from 'node:crypto';
import { MockLedger } from './ledger.mjs';
import { Rejected, authentic, boundedCall, id, licenceOrder, mac, orderEvent, parse, readBody, reject, sha256, unpackGrant } from './contracts.mjs';

const headers = { 'content-type': 'application/json', 'cache-control': 'no-store',
  'content-security-policy': "default-src 'none'", 'x-content-type-options': 'nosniff' };
const json = (status, value) => new Response(JSON.stringify(value), { status, headers });

// There is deliberately no public server, Cloudflare Function, checkout creation
// or live provider adapter. This module is a mock-only contract laboratory.
export function createCommerceLab(options = {}) {
  if (options.enabled !== true) return { handle: async () => json(503, { error: 'commerce_disabled' }), close() {} };
  if (options.mode !== 'mock') throw new Error('Only mock commerce is implemented');
  const { signingSecret, grantSecret, verifyLicense, loadArtifact } = options;
  const identity = Object.freeze({ ...options.identity });
  const artifact = Object.freeze({ ...options.artifact });
  if (typeof signingSecret !== 'string' || signingSecret.length < 32 || signingSecret.length > 40 ||
      !(grantSecret instanceof Uint8Array) || grantSecret.length < 32 ||
      !identity || Object.keys(identity).length !== 3 ||
      !['storeId', 'productId', 'variantId'].every(k => typeof identity[k] === 'string' && id(identity[k]) === identity[k]) ||
      artifact?.id !== 'quire-lab-text-v1' || !Number.isSafeInteger(artifact.size) || artifact.size < 1 || artifact.size > 262144 ||
      !/^[a-f0-9]{64}$/.test(artifact.sha256) || typeof verifyLicense !== 'function' || typeof loadArtifact !== 'function')
    throw new Error('Invalid mock configuration');
  const now = options.now ?? Date.now;
  const timeout = options.timeoutMs ?? 5000;
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > 5000) throw new Error('Invalid mock deadline');
  const ledger = new MockLedger(options.database ?? ':memory:', sha256(JSON.stringify({ mode: 'mock', identity, artifact })));
  const fingerprint = key => mac(grantSecret, 'licence-v1:' + key);
  async function customer(request) {
    const data = parse(await readBody(request, 1024, timeout));
    if (typeof data?.licenseKey !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(data.licenseKey)) reject(400);
    const value = await boundedCall(signal => verifyLicense(data.licenseKey, { signal }), timeout, request.signal);
    const orderId = licenceOrder(value, data.licenseKey, identity, now());
    if (!ledger.active(orderId)) reject(403);
    return { orderId, fingerprint: fingerprint(data.licenseKey) };
  }
  return {
    close: () => ledger.close(),
    report: () => ledger.report(),
    async handle(request) {
      try {
        const url = new URL(request.url);
        if (url.search) reject(400); // never accept bearer credentials in URLs
        if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
        if (['/webhooks/lemon', '/grant', '/redeem'].includes(url.pathname) &&
            !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type') ?? '')) reject(415);
        if (url.pathname === '/webhooks/lemon') {
          const raw = await readBody(request, 65536, timeout);
          if (!authentic(signingSecret, raw, request.headers.get('x-signature'))) reject(401);
          const event = orderEvent(parse(raw), identity, now());
          return json(200, { environment: 'mock', status: ledger.record(sha256(raw), event, options.afterEventInsert) });
        }
        if (url.pathname === '/grant') {
          const verified = await customer(request);
          const issued = now();
          const value = { version: 1, orderId: verified.orderId, artifactId: artifact.id, sha256: artifact.sha256,
            bytes: artifact.size, issuedAt: issued, expiresAt: issued + 120000,
            nonce: randomBytes(16).toString('hex'), licenceFingerprint: verified.fingerprint };
          ledger.issue(value);
          const encoded = Buffer.from(JSON.stringify(value)).toString('base64url');
          return json(200, { environment: 'mock', token: encoded + '.' + mac(grantSecret, encoded), expiresAt: value.expiresAt });
        }
        if (url.pathname === '/redeem') {
          const match = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(request.headers.get('authorization') ?? '');
          const value = unpackGrant(match?.[1], grantSecret, artifact, now());
          const verified = await customer(request); // recheck vendor revocation, not merely token age
          if (verified.orderId !== value.orderId || verified.fingerprint !== value.licenceFingerprint) reject(403);
          const bytes = await boundedCall(signal => loadArtifact({ signal }), timeout, request.signal);
          if (!(bytes instanceof Uint8Array) || bytes.byteLength !== artifact.size || sha256(bytes) !== artifact.sha256) reject(503);
          ledger.consume(value, now()); // atomically recheck refund, expiry and one-use after I/O
          return new Response(bytes, { headers: { ...headers, 'content-type': 'text/plain; charset=utf-8',
            'content-length': String(bytes.byteLength), 'content-disposition': 'attachment; filename="quire-commerce-mock.txt"' } });
        }
        return json(404, { error: 'not_found' });
      } catch (error) {
        const status = error instanceof Rejected ? error.status : 503;
        return json(status, { error: status === 503 ? 'commerce_unavailable' : 'request_rejected' });
      }
    },
  };
}
