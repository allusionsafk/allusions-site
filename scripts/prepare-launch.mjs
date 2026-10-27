import assert from 'node:assert/strict';
import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildPublic } from './build-public.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const origin = 'https://github.com/allusionsafk/allusions-site.git';
const functionPath = 'functions/ai/[[path]].js';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (root,path) => { const r=relative(root,path); return !r || (!isAbsolute(r) && r!=='..' && !r.startsWith('..'+sep)); };

/** Exact reviewed manifest verification; not a semantic secret classifier. */
export async function verifyFiles(root, manifest, { receipt = false } = {}) {
  assert.ok(Array.isArray(manifest) && manifest.length>0 && manifest.length<1000,'Invalid manifest');
  const paths=new Set(); const directories=new Set();
  for(const row of manifest) {
    assert.ok(typeof row.path==='string' && /^[A-Za-z0-9_\[\]-][A-Za-z0-9_./\[\]-]*$/.test(row.path)
      && !row.path.includes('//') && row.path.split('/').every(p=>p && p!=='.' && p!=='..')
      && !paths.has(row.path) && Number.isSafeInteger(row.bytes) && row.bytes>=0 && row.bytes<=32*1024*1024
      && /^[a-f0-9]{64}$/.test(row.sha256),'Invalid manifest entry');
    paths.add(row.path);
    const parts=row.path.split('/');parts.pop();while(parts.length){directories.add(parts.join('/'));parts.pop();}
  }
  const found=[];
  async function walk(path='') {
    const file=join(root,path);const info=await lstat(file);
    assert.ok(!info.isSymbolicLink(),'Artifact contains a filesystem link');
    if(info.isDirectory()) {
      assert.ok(!path || directories.has(path),'Unexpected artifact directory');
      for(const name of (await readdir(file)).sort()) await walk(path ? path+'/'+name : name);
    } else {
      assert.ok(info.isFile(),'Artifact contains a special file');
      if(receipt && path==='launch.json')return;
      assert.ok(paths.has(path),'Unexpected artifact inventory entry');
      const expected=manifest.find(row=>row.path===path);
      assert.equal(info.size,expected.bytes,'Artifact byte identity differs');
      assert.equal(hash(await readFile(file)),expected.sha256,'Artifact hash identity differs');
      found.push(path);
    }
  }
  await walk();assert.deepEqual(found.sort(),[...paths].sort(),'Artifact inventory is incomplete');
}

function git(root,args) { return execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).trim(); }
function sourceCommit(root) {
  assert.equal(resolve(git(root,['rev-parse','--show-toplevel'])),resolve(root),'Unexpected source repository');
  assert.equal(git(root,['remote','get-url','origin']),origin,'Unexpected source origin');
  assert.equal(git(root,['status','--porcelain','--untracked-files=normal']),'','Source must be clean at an exact commit');
  const sha=git(root,['rev-parse','HEAD']);assert.match(sha,/^[a-f0-9]{40}$/);return sha;
}
async function archived(root,commit,action) {
  const parent=await realpath(tmpdir());const folder=await mkdtemp(join(parent,'portfolio-launch-archive-'));
  try {
    const tar=execFileSync('git',['archive','--format=tar',commit],{cwd:root,maxBuffer:64*1024*1024});
    execFileSync('tar',['-xf','-','-C',folder],{input:tar,maxBuffer:1024*1024});
    return await action(folder);
  } finally {
    // Only this freshly allocated direct temporary child can be removed.
    assert.equal(dirname(folder),parent);assert.ok(basename(folder).startsWith('portfolio-launch-archive-'));
    await rm(folder,{recursive:true,force:true});
  }
}
async function stage(source,destination) {
  const functions=await readdir(join(source,'functions','ai'));
  assert.deepEqual(functions,['[[path]].js'],'Unexpected Functions source inventory');
  assert.deepEqual(await readdir(join(source,'functions')),['ai'],'Unexpected Functions routes');
  for(const path of ['functions','functions/ai',functionPath]) {
    assert.ok(!(await lstat(join(source,path))).isSymbolicLink() && inside(source,await realpath(join(source,path))),'Functions source contains a filesystem link');
  }
  const manifest=(await buildPublic(join(destination,'assets'),source)).map(row=>({...row,path:'assets/'+row.path}));
  await mkdir(join(destination,'functions','ai'),{recursive:true});
  await copyFile(join(source,functionPath),join(destination,functionPath),constants.COPYFILE_EXCL);
  const bytes=await readFile(join(destination,functionPath));
  manifest.push({path:functionPath,bytes:bytes.length,sha256:hash(bytes)});
  return manifest.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
}
function receipt(commit,manifest) {
  return {schemaVersion:1,kind:'pages-assets-and-functions-source',sourceRepository:origin,sourceCommit:commit,
    lineEndings:'git archive bytes',publicOrigin:'https://allusions.pages.dev',
    manifestSha256:hash(JSON.stringify(manifest)),manifest};
}

/** No account, credentials or deploy command: output is a new review package. */
export async function prepareLaunch(destination, root=repository) {
  root=await realpath(root);
  destination=join(await realpath(dirname(resolve(destination))),basename(resolve(destination)));
  assert.ok(!inside(root,destination),'Output must be outside the source repository');
  try {await lstat(destination);throw new Error('Output already exists');}catch(error){if(error.code!=='ENOENT')throw error;}
  const commit=sourceCommit(root);
  await mkdir(destination);
  const result=await archived(root,commit,async source=>receipt(commit,await stage(source,destination)));
  await writeFile(join(destination,'launch.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  await verifyFiles(destination,result.manifest,{receipt:true});return result;
}

export async function verifyLaunch(destination,root=repository) {
  root=await realpath(root);const commit=sourceCommit(root);
  const info=await lstat(join(destination,'launch.json'));assert.ok(info.isFile() && !info.isSymbolicLink() && info.size<=1024*1024,'Invalid launch receipt');
  const actual=JSON.parse(await readFile(join(destination,'launch.json'),'utf8'));
  return archived(root,commit,async source=>{
    const candidate=join(source,'expected');await mkdir(candidate);
    const expected=receipt(commit,await stage(source,candidate));
    assert.deepEqual(actual,expected,'Launch receipt differs from current immutable source');
    await verifyFiles(destination,expected.manifest,{receipt:true});return expected;
  });
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {
    assert.ok(process.argv.length===4 && ['prepare','verify'].includes(process.argv[2]),'Usage: prepare-launch.mjs prepare|verify NEW_EXTERNAL_DIRECTORY');
    const result=await (process.argv[2]==='prepare'?prepareLaunch:verifyLaunch)(process.argv[3]);
    console.log(JSON.stringify(result,null,2));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
