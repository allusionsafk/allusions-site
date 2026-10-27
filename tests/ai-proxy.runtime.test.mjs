import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const root = fileURLToPath(new URL('../', import.meta.url));
test('real HTMLRewriter preserves proxy destinations, responsive assets and upstream security', { timeout: 20000 }, async () => {
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: [
      { type: 'ESModule', path: `${root}tests/runtime-entry.mjs`, contents: `import { onRequest } from '../functions/ai/[[path]].js'; export default { fetch(request) { return onRequest({ request }); } };` },
      { type: 'ESModule', path: `${root}functions/ai/[[path]].js` },
    ],
    compatibilityDate: '2026-10-22',
    cf: false,
    outboundService(request) {
      const url = new URL(request.url);
      assert.equal(url.origin, 'https://localai-windows-starter-site.allusionsafk.workers.dev');
      if (url.pathname === '/download') return new Response(new Uint8Array([0x4d, 0x5a, 0, 0xff]), { headers: { 'content-type': 'application/octet-stream', 'content-length': '4' } });
      const html = '<a href="/download">Get</a><a href="https://allusions.pages.dev/">Studio</a><img src="/assets/app.webp" srcset="/assets/app-small.webp 800w, /assets/app.webp 1320w"><a href="#requirements">Requirements</a>';
      return new Response(request.method === 'HEAD' ? null : html, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': "default-src 'self'; frame-ancestors 'none'", 'x-content-type-options': 'nosniff' } });
    },
  }));
  try {
    const response = await mf.dispatchFetch('https://allusions.pages.dev/ai/?from=studio');
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /href="\/ai\/download"/);
    assert.match(html, /src="\/ai\/assets\/app.webp"/);
    assert.match(html, /srcset="\/ai\/assets\/app-small.webp 800w, \/ai\/assets\/app.webp 1320w"/);
    assert.match(html, /href="https:\/\/allusions.pages.dev\/"/);
    assert.match(html, /href="#requirements"/);
    assert.equal(response.headers.get('content-security-policy'), "default-src 'self'; frame-ancestors 'none'");
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    const head = await mf.dispatchFetch('https://allusions.pages.dev/ai/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const download = await mf.dispatchFetch('https://allusions.pages.dev/ai/download');
    assert.deepEqual(new Uint8Array(await download.arrayBuffer()), new Uint8Array([0x4d, 0x5a, 0, 0xff]));
    assert.equal(download.headers.get('content-length'), '4');
  } finally { await mf.dispose(); }
});
