import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, test } from 'node:test';

// Load the Pages ES module without changing the static site's package format.
const source = await readFile(new URL('../functions/ai/[[path]].js', import.meta.url), 'utf8');
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const origin = 'https://localai-windows-starter-site.allusionsafk.workers.dev';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function upstreamResponse(response) {
  globalThis.fetch = async () => response;
}

test('canonical /ai redirect preserves the query without fetching upstream', async () => {
  globalThis.fetch = async () => { throw new Error('Unexpected upstream request'); };
  const response = await onRequest({ request: new Request('https://allusions.pages.dev/ai?from=studio') });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), 'https://allusions.pages.dev/ai/?from=studio');
});

for (const [location, expected] of [
  ['next?step=2#install', '/ai/docs/next?step=2#install'],
  ['../download#installer', '/ai/download#installer'],
  ['?step=2', '/ai/docs/start?step=2'],
  ['#install', '/ai/docs/start?from=studio#install'],
  ['/download?source=docs#installer', '/ai/download?source=docs#installer'],
  [`${origin}/download`, '/ai/download'],
  ['//localai-windows-starter-site.allusionsafk.workers.dev/download', '/ai/download'],
]) {
  test(`same-origin redirect ${location} resolves against the actual upstream request`, async () => {
    upstreamResponse(new Response(null, { status: 302, headers: { location } }));
    const response = await onRequest({ request: new Request('https://allusions.pages.dev/ai/docs/start?from=studio') });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), expected);
  });
}

for (const location of [
  'https://github.com/allusionsafk/afk-ai/releases/tag/v0.2.0-rc1',
  'https://localai-windows-starter-site.allusionsafk.workers.dev.example.com/download',
  'https://localai-windows-starter-site.allusionsafk.workers.dev@evil.example/download',
  '//example.com/download',
]) {
  test(`external redirect stays unchanged: ${location}`, async () => {
    upstreamResponse(new Response(null, { status: 307, headers: { location } }));
    const response = await onRequest({ request: new Request('https://allusions.pages.dev/ai/download') });
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), location);
  });
}

test('installer GET preserves exact bytes, integrity headers and upstream request metadata', async () => {
  const bytes = new Uint8Array([0x4d, 0x5a, 0x00, 0xff]);
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${origin}/download?source=studio`);
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'manual');
    assert.equal(options.headers.get('if-none-match'), '"installer"');
    return new Response(bytes, { headers: {
      'content-type': 'application/octet-stream',
      'content-length': String(bytes.length),
      'content-disposition': 'attachment; filename="installer.exe"',
      'x-content-type-options': 'nosniff',
      'cache-control': 'no-store',
    } });
  };
  const response = await onRequest({ request: new Request('https://allusions.pages.dev/ai/download?source=studio', {
    headers: { 'if-none-match': '"installer"' },
  }) });
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
  assert.equal(response.headers.get('content-length'), '4');
  assert.equal(response.headers.get('content-disposition'), 'attachment; filename="installer.exe"');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('installer HEAD preserves the bodyless response and verified metadata', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${origin}/download`);
    assert.equal(options.method, 'HEAD');
    return new Response(null, { headers: {
      'content-type': 'application/octet-stream', 'content-length': '58367121',
    } });
  };
  const response = await onRequest({ request: new Request('https://allusions.pages.dev/ai/download', { method: 'HEAD' }) });
  assert.equal(response.body, null);
  assert.equal(response.headers.get('content-length'), '58367121');
});

test('a double-slash visitor path cannot select a different upstream origin', async () => {
  globalThis.fetch = async (url) => {
    assert.equal(new URL(url).origin, origin);
    assert.equal(new URL(url).pathname, '//example.com/download');
    return new Response('missing', { status: 404 });
  };
  const response = await onRequest({ request: new Request('https://allusions.pages.dev/ai//example.com/download') });
  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'missing');
});
