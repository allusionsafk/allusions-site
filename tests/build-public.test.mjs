import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildPublic } from '../scripts/build-public.mjs';

test('public asset builds are deterministic and omit all developer/commerce sources', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'allusions-public-build-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const a = await buildPublic(join(folder, 'first'));
  const b = await buildPublic(join(folder, 'second'));
  assert.deepEqual(a, b);
  assert.ok(a.some(f => f.path === 'quire/captures/quire-home-owner-preview.png'));
  assert.ok(a.some(f => f.path === 'products/quire.json'));
  assert.ok(a.every(f => !/^(commerce|scripts|tests|growth|functions|node_modules|\.git)\//.test(f.path)));
  assert.ok(a.every(f => !/\.(?:mjs|sql|md|sqlite)$/.test(f.path)));
  assert.equal(await readFile(join(folder, 'first', 'quire/index.html'), 'utf8'), await readFile(new URL('../quire/index.html', import.meta.url), 'utf8'));
  await assert.rejects(buildPublic(join(folder, 'first')), /EEXIST/);
});
test('public build rejects output over source and does not overwrite owner files', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'allusions-public-owner-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  await writeFile(join(folder, 'owner.txt'), 'preserve');
  await assert.rejects(buildPublic(folder), /EEXIST/);
  assert.equal(await readFile(join(folder, 'owner.txt'), 'utf8'), 'preserve');
  await assert.rejects(buildPublic(fileURLToPath(new URL('../assets/output', import.meta.url))), /separate/);
});
test('public sources cannot export a linked private file', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'allusions-public-link-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const root = join(folder, 'root'); await mkdir(root);
  for (const name of ['assets', 'demimedia', 'valclips', 'quire', 'products']) await mkdir(join(root, name));
  for (const name of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '_headers', 'products/quire.json']) await writeFile(join(root, name), 'fixture');
  await mkdir(join(folder, 'private'));
  await writeFile(join(folder, 'private', 'private.txt'), 'not public');
  await symlink(join(folder, 'private'), join(root, 'assets', 'exposed'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(buildPublic(join(folder, 'output'), root), /links/);
  assert.deepEqual((await readdir(folder)).sort(), ['private', 'root']);
});
test('a destination ancestor alias cannot write a build inside public source', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'allusions-public-output-alias-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const root = join(folder, 'root'); await mkdir(root);
  for (const name of ['assets', 'demimedia', 'valclips', 'quire', 'products']) await mkdir(join(root, name));
  for (const name of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '_headers', 'products/quire.json']) await writeFile(join(root, name), 'fixture');
  const alias = join(folder, 'alias');
  await symlink(root, alias, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(buildPublic(join(alias, 'assets', 'generated'), root), /separate/);
  assert.deepEqual(await readdir(join(root, 'assets')), []);
  await assert.rejects(buildPublic(join(root, 'products', 'generated'), root), /separate/);
});
