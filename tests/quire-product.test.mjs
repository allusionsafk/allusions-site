import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

const record = JSON.parse(await readFile(new URL('../products/quire.json', import.meta.url)));
const page = await readFile(new URL('../quire/index.html', import.meta.url), 'utf8');
test('Quire release snapshot preserves exact asset identity and explicit access limits', () => {
  assert.equal(record.schemaVersion, 1);
  assert.equal(record.id, 'quire');
  assert.equal(record.repositoryVisibility, 'private');
  assert.equal(record.release.access, 'public-download');
  assert.equal(record.repositoryUrl, 'https://github.com/allusionsafk/quire');
  assert.equal(record.release.version, '1.1.0');
  assert.equal(record.release.publishedAt, '2026-10-25');
  assert.equal(record.release.url, 'https://github.com/allusionsafk/quire-download/releases/tag/v1.1.0');
  assert.equal(record.release.asset.url, 'https://github.com/allusionsafk/quire-download/releases/download/v1.1.0/Quire.exe');
  assert.equal(record.release.asset.size, 77868455);
  assert.equal(record.release.asset.sha256, 'c475513aa80b263f5780240a34157cda049ec2d734b7b67b24475f4479564a6e');
  assert.equal(record.release.tag, `v${record.release.version}`);
  assert.equal(record.release.asset.name, 'Quire.exe');
  assert.equal(new URL(record.release.asset.url).origin, 'https://github.com');
  assert.match(record.release.asset.sha256, /^[a-f0-9]{64}$/);
  assert.ok(Number.isSafeInteger(record.release.asset.size) && record.release.asset.size > 0);
  assert.ok(page.includes(record.release.version) && page.includes(record.release.url));
  assert.match(page, /private|access required/);
  assert.ok(page.includes(record.release.asset.url));
  assert.ok(page.includes(record.release.asset.sha256));
  assert.ok(page.includes(record.release.asset.size.toLocaleString('en-US')));
  assert.match(page, /publicly downloadable/);
  assert.doesNotMatch(page, /does not provide an anonymous public download|release and executable require GitHub/);
  assert.equal(record.websiteUrl, null);
  assert.match(page, /public address has not been assigned/);
});
test('Quire showcases only existing captures with dimensions, alt text and provenance', async () => {
  const provenance = await readFile(new URL('../quire/captures/PROVENANCE.md', import.meta.url), 'utf8');
  assert.match(provenance, /7fce147/);
  assert.ok(provenance.includes('ab45bf1fdb3db5342e522670f5f4fcbd1fec52ea13cc4797a1cde35640d461cf'));
  assert.match(page, /screenshots above show v1\.0\.0/);
  assert.doesNotMatch(page, /(?:genuine Quire|Released Quire) 1\.1\.0/);
  const images = [...page.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)];
  assert.equal(images.length, 3);
  for (const [tag, source] of images) {
    assert.match(tag, /alt="[^"]{40,}"/);
    assert.match(tag, /width="\d+" height="\d+"/);
    assert.ok((await stat(new URL(`../quire/${source}`, import.meta.url))).size > 0);
  }
});
test('owner-supplied Home preview preserves exact bytes and cannot stand in for a verified release capture', async () => {
  const image = await readFile(new URL('../quire/captures/quire-home-owner-preview.png', import.meta.url));
  assert.equal(createHash('sha256').update(image).digest('hex'), 'f1c3e24fdef389344fb3faedb1e80f8ff395e595ac829f1744cfc44efac56b8f');
  assert.deepEqual([image.readUInt32BE(16), image.readUInt32BE(20)], [2560, 1600]);
  const figure = page.match(/<figure[^>]*>\s*<img src="captures\/quire-home-owner-preview\.png"[\s\S]*?<\/figure>/)?.[0];
  assert.ok(figure, 'Home preview has its own figure');
  assert.match(figure, /Owner-supplied Home screen preview/);
  assert.match(figure, /build version has not been verified/);
  assert.doesNotMatch(figure, /verified (?:1\.0\.0|release)|Released Quire/);
});
