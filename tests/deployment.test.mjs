import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { verifyDeployment } from '../scripts/verify-deployment.mjs';

const pages = [ ['/', 'index.html'], ['/demimedia/', 'demimedia/index.html'], ['/valclips/', 'valclips/index.html'], ['/quire/', 'quire/index.html'] ];
const bodies = new Map(await Promise.all(pages.map(async ([route, path]) => [route, await readFile(new URL(`../${path}`, import.meta.url))])));
const headers = { 'content-type': 'text/html', 'content-security-policy': "default-src 'none'", 'x-content-type-options': 'nosniff' };
function sourceFetch(change = () => null) {
  return async (url, init) => {
    assert.equal(init.redirect, 'manual');
    assert.equal(init.credentials, 'omit');
    return change(new URL(url).pathname) ?? new Response(bodies.get(new URL(url).pathname), { headers });
  };
}
test('all four deployed page bytes and security headers must match source', async () => {
  const result = await verifyDeployment({ fetchImpl: sourceFetch() });
  assert.equal(result.ok, true);
  assert.equal(result.pages.length, 4);
});
test('stale DemiMedia page fails independently while other source pages match', async () => {
  const result = await verifyDeployment({ fetchImpl: sourceFetch(path => path === '/demimedia/' ? new Response('old page', { headers }) : null) });
  assert.equal(result.ok, false);
  assert.deepEqual(result.pages.filter(page => !page.ok).map(page => page.route), ['/demimedia/']);
  assert.match(result.pages[1].problems.join(' '), /source bytes/);
});
test('redirects cannot make another origin appear to be a matching deployment', async () => {
  const result = await verifyDeployment({ fetchImpl: async () => new Response(null, { status: 302, headers: { location: 'https://example.com/' } }) });
  assert.equal(result.ok, false);
  assert.ok(result.pages.every(page => page.status === 302));
});
test('matching bytes without the security headers still fail', async () => {
  const result = await verifyDeployment({ fetchImpl: async url => new Response(bodies.get(new URL(url).pathname)) });
  assert.equal(result.ok, false);
  assert.ok(result.pages.every(page => page.problems.some(problem => problem.includes('security'))));
});
test('security headers require a real unambiguous default-deny directive', async () => {
  for (const policy of ["default-src 'none' https:", "script-src * 'unsafe-inline'; report-uri /default-src 'none'", "default-src *; default-src 'none'", "default-src 'none'; default-src *", "default-src\u00a0'none'", "\u00a0default-src 'none'"]) {
    const result = await verifyDeployment({ fetchImpl: async url => new Response(bodies.get(new URL(url).pathname), { headers: { ...headers, 'content-security-policy': policy } }) });
    assert.equal(result.ok, false, policy);
    assert.ok(result.pages.every(page => page.problems.some(problem => problem.includes('security'))));
  }
});
test('both declared and streamed oversize bodies are bounded', async () => {
  for (const advertised of [true, false]) {
    const result = await verifyDeployment({ maxBytes: 8, fetchImpl: async () => new Response('123456789', { headers: advertised ? { 'content-length': '9' } : {} }) });
    assert.equal(result.ok, false);
    assert.ok(result.pages.every(page => page.problems.some(problem => problem.includes('limit'))));
  }
});
test('unavailable network is reported as unknown rather than matching', async () => {
  const result = await verifyDeployment({ fetchImpl: async () => { throw new Error('offline'); } });
  assert.equal(result.ok, false);
  assert.ok(result.pages.every(page => page.status === null));
});
test('deployment origin forbids credentials, query, fragments and nested paths', async () => {
  for (const origin of ['https://user:secret@example.com', 'https://example.com/path', 'https://example.com/?token=x', 'https://example.com/#x', 'file:///tmp/']) {
    await assert.rejects(verifyDeployment({ origin, fetchImpl: async () => { throw new Error('must not fetch'); } }), /origin/);
  }
});
