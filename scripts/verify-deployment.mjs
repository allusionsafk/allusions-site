import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const pages = [ ['/', 'index.html'], ['/demimedia/', 'demimedia/index.html'], ['/valclips/', 'valclips/index.html'], ['/quire/', 'quire/index.html'] ];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

function defaultDeny(policy) {
  if (typeof policy !== 'string' || /[^\x09\x20-\x7e]/.test(policy)) return false;
  const defaults = (policy || '').split(';').map(part => part.trim().split(/\s+/)).filter(tokens => tokens[0].toLowerCase() === 'default-src');
  return defaults.length === 1 && defaults[0].length === 2 && defaults[0][1] === "'none'";
}

async function boundedBody(response, limit) {
  if (Number(response.headers.get('content-length')) > limit) {
    await response.body?.cancel();
    throw new Error('Response exceeds byte limit');
  }
  const chunks = [];
  let length = 0;
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return Buffer.concat(chunks, length);
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new Error('Response exceeds byte limit'); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
}

export async function verifyDeployment({ origin = 'https://allusions.pages.dev', fetchImpl = fetch, maxBytes = 2 * 1024 * 1024 } = {}) {
  const base = new URL(origin);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.pathname !== '/' || base.search || base.hash) {
    throw new Error('Expected a plain HTTP(S) deployment origin without credentials or a path');
  }
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 16 * 1024 * 1024) throw new Error('Invalid response byte limit');
  const results = await Promise.all(pages.map(async ([route, file]) => {
    const expected = await readFile(new URL(`../${file}`, import.meta.url));
    const result = { route, sourceFile: file, expectedSha256: digest(expected), actualSha256: null, status: null, ok: false, problems: [] };
    try {
      const response = await fetchImpl(new URL(route, base), { redirect: 'manual', credentials: 'omit', signal: AbortSignal.timeout(10000) });
      result.status = response.status;
      if (response.status !== 200) {
        await response.body?.cancel();
        result.problems.push(`Expected HTTP 200, received ${response.status}`);
        return result;
      }
      const actual = await boundedBody(response, maxBytes);
      result.actualSha256 = digest(actual);
      if (result.actualSha256 !== result.expectedSha256) result.problems.push('Deployed content differs from source bytes');
      if (!defaultDeny(response.headers.get('content-security-policy')) || response.headers.get('x-content-type-options') !== 'nosniff') {
        result.problems.push('Expected static-page security headers are missing');
      }
      result.ok = result.problems.length === 0;
    } catch (error) { result.problems.push(error.message); }
    return result;
  }));
  return { origin: base.origin, checkedAt: new Date().toISOString(), ok: results.every(page => page.ok), pages: results };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const report = await verifyDeployment({ origin: process.argv[2] || 'https://allusions.pages.dev' });
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.ok ? 0 : 1;
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
