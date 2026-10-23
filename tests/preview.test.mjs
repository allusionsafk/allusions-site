import assert from 'node:assert/strict';
import { request } from 'node:http';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { test } from 'node:test';
import { startPreview } from '../scripts/preview.mjs';

const fetchPreview = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(5000) });

async function preview(t, options) {
  const server = await startPreview({ port: 0, ...options });
  t.after(() => new Promise(resolve => server.close(resolve)));
  assert.equal(server.address().address, '127.0.0.1');
  return `http://127.0.0.1:${server.address().port}`;
}

test('HTTP preview serves real root, nested Quire routes, assets and production security headers', async t => {
  const origin = await preview(t);
  for (const [route, file, type] of [
    ['/', 'index.html', 'text/html'], ['/quire/', 'quire/index.html', 'text/html'],
    ['/quire/captures/quire-book-800.webp', 'quire/captures/quire-book-800.webp', 'image/webp'],
    ['/assets/site.css', 'assets/site.css', 'text/css'], ['/products/quire.json', 'products/quire.json', 'application/json'],
  ]) {
    const response = await fetchPreview(origin + route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get('content-type'), new RegExp(type));
    assert.match(response.headers.get('content-security-policy'), /default-src 'none'/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const expected = await readFile(new URL(`../${file}`, import.meta.url));
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected);
    const head = await fetchPreview(origin + route, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(Number(head.headers.get('content-length')), expected.length);
    assert.equal(await head.text(), '');
  }
});

test('preview redirects directory routes, gives a real 404 and never lists directories or proxies AFK', async t => {
  const origin = await preview(t);
  const redirect = await fetchPreview(origin + '/quire?from=studio', { redirect: 'manual' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), '/quire/?from=studio');
  for (const route of ['/missing', '/assets/', '/package.json', '/.git/config', '/scripts/preview.mjs', '/ai/']) {
    const response = await fetchPreview(origin + route);
    assert.equal(response.status, 404, route);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(new URL('../404.html', import.meta.url)));
    const head = await fetchPreview(origin + route, { method: 'HEAD' });
    assert.equal(head.status, 404);
    assert.equal(await head.text(), '');
  }
  const post = await fetchPreview(origin + '/', { method: 'POST', body: 'no' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

test('preview rejects raw and encoded traversal, separators, malformed paths and absolute request targets', async t => {
  const origin = await preview(t);
  for (const route of ['/../package.json', '/assets/%2e%2e/package.json', '/assets%2fcaptures/a.webp', '/assets%5ca.webp', '/assets/..\\package.json', '/%E0%A4%A', '/assets/%00a.webp', '//example.com/', 'https://example.com/']) {
    const status = await new Promise((resolve, reject) => {
      const req = request(origin, { path: route }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
      req.setTimeout(5000, () => req.destroy(new Error('Preview request timed out')));
      req.on('error', reject); req.end();
    });
    assert.equal(status, 404, route);
  }
});

test('preview rejects arbitrary Host headers even on its loopback listener', async t => {
  const origin = await preview(t);
  const { host } = new URL(origin);
  for (const supplied of ['evil.example', host + '.evil.example', 'localhost:' + new URL(origin).port, '127.0.0.1:1', host]) {
    // Node fetch replaces Host; use raw HTTP so the supplied header reaches the server.
    const status = await new Promise((resolve, reject) => {
      const req = request(origin, { headers: { Host: supplied } }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
      req.setTimeout(5000, () => req.destroy(new Error('Preview request timed out')));
      req.on('error', reject); req.end();
    });
    assert.equal(status, supplied === host ? 200 : 403, supplied);
  }
});

test('preview rejects symlinks escaping its root or aliasing nonpublic files inside it', async t => {
  const fixture = await mkdtemp(join(tmpdir(), 'allusions-preview-'));
  t.after(() => {
    assert.ok(fixture.startsWith(resolve(tmpdir()) + sep), 'cleanup remains inside the temporary directory');
    return rm(fixture, { recursive: true, force: true });
  });
  const root = join(fixture, 'site'); const outside = join(fixture, 'outside');
  await mkdir(join(root, 'assets'), { recursive: true }); await mkdir(outside);
  await mkdir(join(root, 'tests'));
  await writeFile(join(root, '404.html'), 'Missing');
  await writeFile(join(root, '_headers'), "/*\n  Content-Security-Policy: default-src 'none'\n  X-Content-Type-Options: nosniff\n");
  await writeFile(join(outside, 'private.css'), 'private fixture');
  await writeFile(join(root, 'tests', 'private.json'), '{"private":true}');
  await symlink(outside, join(root, 'assets', 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  await symlink(join(root, 'tests'), join(root, 'assets', 'internal'), process.platform === 'win32' ? 'junction' : 'dir');
  const origin = await preview(t, { root });
  for (const route of ['/assets/escape/private.css', '/assets/internal/private.json']) {
    const response = await fetchPreview(origin + route);
    assert.equal(response.status, 404, route);
    assert.equal(await response.text(), 'Missing');
  }
});
