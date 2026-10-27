import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export class Rejected extends Error {
  constructor(status) { super('Request rejected'); this.status = status; }
}
export const reject = status => { throw new Rejected(status); };
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const mac = (secret, bytes) => createHmac('sha256', secret).update(bytes).digest('hex');
export function authentic(secret, bytes, supplied) {
  return typeof supplied === 'string' && /^[a-f0-9]{64}$/i.test(supplied) &&
    timingSafeEqual(Buffer.from(mac(secret, bytes), 'hex'), Buffer.from(supplied, 'hex'));
}
export function id(value) {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return String(value);
  if (typeof value === 'string' && /^[1-9][0-9]{0,14}$/.test(value)) return value;
  reject(422);
}
export function identityMatches(value, expected) {
  return id(value.store_id) === expected.storeId && id(value.product_id) === expected.productId &&
    id(value.variant_id) === expected.variantId;
}
export async function boundedCall(operation, ms, parentSignal) {
  if (parentSignal?.aborted) reject(503);
  const controller = new AbortController();
  let timer;
  let abort;
  const stop = new Promise((_, rejectPromise) => {
    abort = () => { controller.abort(); rejectPromise(new Rejected(503)); };
    if (parentSignal?.aborted) { abort(); return; }
    parentSignal?.addEventListener('abort', abort, { once: true });
    timer = setTimeout(abort, ms);
  });
  try { return await Promise.race([stop, Promise.resolve().then(() => {
    if (controller.signal.aborted) reject(503);
    return operation(controller.signal);
  })]); }
  finally { clearTimeout(timer); parentSignal?.removeEventListener('abort', abort); }
}
export async function readBody(request, maximum, ms) {
  const reader = request.body?.getReader();
  if (!reader) reject(400);
  let complete = false;
  try {
    return await boundedCall(async signal => {
      // Cancellation releases a stalled native stream. Do not await an
      // arbitrary stream's cancellation promise on the deadline path.
      const cancel = () => { reader.cancel().catch(() => {}); };
      signal.addEventListener('abort', cancel, { once: true });
      try {
        const chunks = []; let size = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (signal.aborted) reject(503);
          if (done) { complete = true; break; }
          if (!(value instanceof Uint8Array) || value.byteLength > maximum - size) reject(413);
          chunks.push(value); size += value.byteLength;
        }
        return Buffer.concat(chunks, size);
      } finally { signal.removeEventListener('abort', cancel); }
    }, ms, request.signal);
  } finally {
    if (!complete) reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
export function parse(bytes) {
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { reject(400); }
}
export function orderEvent(payload, expected, now) {
  const event = payload?.meta?.event_name;
  const data = payload?.data; const a = data?.attributes; const item = a?.first_order_item;
  if (!['order_created', 'order_refunded'].includes(event) || data?.type !== 'orders' ||
      payload.meta.test_mode !== true || a?.test_mode !== true || item?.test_mode !== true ||
      id(a.store_id) !== expected.storeId || !identityMatches({ ...item, store_id: a.store_id }, expected) ||
      id(item.order_id) !== id(data.id)) reject(422);
  if (!Number.isSafeInteger(a.total) || a.total < 1 || typeof a.currency !== 'string' || !/^[A-Z]{3}$/.test(a.currency) ||
      !Number.isSafeInteger(a.refunded_amount) || a.refunded_amount < 0 || a.refunded_amount > a.total ||
      typeof a.updated_at !== 'string' || !/^\d{4}-\d\d-\d\dT.*Z$/.test(a.updated_at)) reject(422);
  const updated = Date.parse(a.updated_at);
  if (!Number.isFinite(updated) || updated > now + 30000) reject(422);
  const revoked = event === 'order_refunded';
  if (revoked ? (!['refunded', 'partial_refund'].includes(a.status) || a.refunded_amount < 1) :
      (a.status !== 'paid' || a.refunded !== false || a.refunded_amount !== 0 || now - updated > 86400000)) reject(422);
  return { orderId: id(data.id), event, updated, total: a.total, currency: a.currency,
    paid: !revoked, revoked, refunded: a.refunded_amount };
}
export function licenceOrder(value, key, expected, now) {
  const expiry = value?.license_key?.expires_at;
  if (value?.valid !== true || value?.license_key?.key !== key || value.license_key.status !== 'active' ||
      !identityMatches(value.meta ?? {}, expected) ||
      (expiry !== null && (typeof expiry !== 'string' || !Number.isFinite(Date.parse(expiry)) || Date.parse(expiry) <= now))) reject(403);
  return id(value.meta.order_id);
}
export function unpackGrant(token, secret, artifact, now) {
  if (typeof token !== 'string' || token.length > 2048) reject(403);
  const parts = token.split('.');
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !authentic(secret, parts[0], parts[1])) reject(403);
  const bytes = Buffer.from(parts[0], 'base64url');
  if (bytes.toString('base64url') !== parts[0]) reject(403);
  let value;
  try { value = parse(bytes); } catch { reject(403); }
  const keys = ['version', 'orderId', 'artifactId', 'sha256', 'bytes', 'issuedAt', 'expiresAt', 'nonce', 'licenceFingerprint'];
  if (!value || Object.keys(value).sort().join(',') !== keys.sort().join(',') || value.version !== 1 ||
      value.artifactId !== artifact.id || value.sha256 !== artifact.sha256 || value.bytes !== artifact.size ||
      !Number.isSafeInteger(value.issuedAt) || !Number.isSafeInteger(value.expiresAt) ||
      value.issuedAt > now || value.expiresAt <= now || value.expiresAt - value.issuedAt !== 120000 ||
      !/^[a-f0-9]{32}$/.test(value.nonce) || !/^[a-f0-9]{64}$/.test(value.licenceFingerprint)) reject(403);
  try { id(value.orderId); } catch { reject(403); }
  return value;
}
