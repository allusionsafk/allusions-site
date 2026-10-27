import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, rmdir, symlink, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { verifyFiles, prepareLaunch } from '../scripts/prepare-launch.mjs';

async function fixture(t) {
  const folder = await mkdtemp(join(tmpdir(), 'portfolio-launch-test-'));
  t.after(() => rm(folder, {recursive:true, force:true}));
  const root=join(folder,'artifact');await mkdir(root);
  await mkdir(join(root,'assets'));await writeFile(join(root,'assets','index.html'),'approved bytes');
  const bytes=Buffer.from('approved bytes');
  return {folder,root,manifest:[{path:'assets/index.html',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}]};
}

test('launch inventory binds every exact byte and rejects extra developer, hidden and executable files', async t=>{
  const f=await fixture(t);await verifyFiles(f.root,f.manifest);
  for(const name of ['commerce.mjs','.env','Quire.exe','unexpected.json']) {
    await writeFile(join(f.root,name),'must not ship');
    await assert.rejects(verifyFiles(f.root,f.manifest),/inventory/);
    await rm(join(f.root,name));
  }
  await writeFile(join(f.root,'assets','index.html'),'tampered bytes');
  await assert.rejects(verifyFiles(f.root,f.manifest),/identity/);
  await rm(join(f.root,'assets','index.html'));
  await assert.rejects(verifyFiles(f.root,f.manifest),/inventory/);
});

test('empty directories and filesystem aliases cannot hide in a qualified artifact', async t=>{
  const f=await fixture(t);await mkdir(join(f.root,'private'));
  await assert.rejects(verifyFiles(f.root,f.manifest),/directory/);
  await rmdir(join(f.root,'private'));
  await symlink(join(f.root,'assets'),join(f.root,'alias'),process.platform==='win32'?'junction':'dir');
  await assert.rejects(verifyFiles(f.root,f.manifest),/link/);
});

test('hostile or ambiguous manifest paths and metadata fail before traversal', async t=>{
  const f=await fixture(t);
  for(const path of ['../owner.txt','/index.html','C:/owner.txt','assets\\index.html','assets//index.html','./assets/index.html']) {
    await assert.rejects(verifyFiles(f.root,[{...f.manifest[0],path}]),/manifest/);
  }
  for(const bad of [[],[...f.manifest,...f.manifest],[{...f.manifest[0],bytes:-1}],[{...f.manifest[0],sha256:'x'}]])
    await assert.rejects(verifyFiles(f.root,bad),/manifest/);
});

test('preparation refuses the repository and preserves an existing destination', async t=>{
  const f=await fixture(t);await writeFile(join(f.root,'owner.txt'),'preserve');
  await assert.rejects(prepareLaunch(f.root),/exists/);
  await assert.rejects(prepareLaunch(fileURLToPath(new URL('../',import.meta.url))),/outside/);
  assert.equal(await readFile(join(f.root,'owner.txt'),'utf8'),'preserve');
});

test('portfolio sitemap enumerates only its canonical public routes including proxied AFK', async()=>{
  const xml=await readFile(new URL('../sitemap.xml',import.meta.url),'utf8');
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort(),
    ['','ai/','demimedia/','quire/','valclips/'].map(p=>'https://allusions.pages.dev/'+p).sort());
  assert.match(await readFile(new URL('../robots.txt',import.meta.url),'utf8'),/^Sitemap: https:\/\/allusions\.pages\.dev\/sitemap\.xml$/m);
});
