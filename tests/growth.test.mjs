import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, mkdir, symlink, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildGrowthAssets } from '../scripts/build-growth-assets.mjs';
import { feeScenario } from '../commerce/economics.mjs';

test('original growth assets are deterministic, authentic and kept unpublished', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'allusions-growth-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const a = await buildGrowthAssets(join(folder, 'first'));
  assert.deepEqual(a, await buildGrowthAssets(join(folder, 'second')));
  const html = await readFile(join(folder, 'first/demo-storyboard.html'), 'utf8');
  assert.match(html, /unpublished|Unpublished/); assert.match(html, /source repository remains private/);
  assert.match(html, /Newer releases are not shown/);
  assert.doesNotMatch(html, /https?:\/\/|<script|<form|1\.1\.0/);
  const draft = JSON.parse(await readFile(join(folder, 'first/editorial.json'), 'utf8'));
  assert.deepEqual([...new Set(draft.schedule.map(i => i.week))], [1,2,3,4]);
  assert.ok(draft.schedule.every(i => i.status !== 'published'));
  for (const capture of a.files.filter(f => f.path.endsWith('.webp')))
    assert.deepEqual(await readFile(join(folder, 'first', capture.path)), await readFile(new URL('../quire/captures/' + capture.path, import.meta.url)));
  await assert.rejects(buildGrowthAssets(join(folder, 'first')), /EEXIST/);
});
test('unit economics are explicit scenarios, not revenue or an approved price', () => {
  const example = feeScenario({ totalCents: 2400, taxCents: 400, rateBps: 650 });
  assert.equal(example.estimatedFeeCents, 206);
  assert.equal(example.estimatedProceedsCents, 1794);
  assert.equal(example.classification, 'scenario-only');
  assert.throws(() => feeScenario({ totalCents: true }));
  assert.throws(() => feeScenario({ totalCents: 100, taxCents: 101 }));
  assert.throws(() => feeScenario({ totalCents: 100, rateBps: 10001 }));
});
test('growth output cannot enter public source through an ancestor alias', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'allusions-growth-alias-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const root = join(folder, 'root'); await mkdir(root); await mkdir(join(root, 'assets'));
  const alias = join(folder, 'alias'); await symlink(root, alias, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(buildGrowthAssets(join(alias, 'assets', 'generated'), root), /outside public source/);
  assert.deepEqual(await readdir(join(root, 'assets')), []);
});
