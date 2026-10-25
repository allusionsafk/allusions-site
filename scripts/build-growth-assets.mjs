import { mkdir, readFile, copyFile, writeFile, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, dirname, resolve, join, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const escape = v => v.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
export async function buildGrowthAssets(output, root = sourceRoot) {
  root = await realpath(root);
  output = resolve(output);
  output = join(await realpath(dirname(output)), basename(output));
  const within = relative(root, output);
  if (within === '' || (!isAbsolute(within) && within !== '..' && !within.startsWith('..' + sep) && within.split(sep)[0] !== 'artifacts'))
    throw new Error('Growth output must stay outside public source');
  // Existing folders are refused; this command never deletes or overwrites.
  await mkdir(output);
  const campaign = JSON.parse(await readFile(join(root, 'growth/editorial.json'), 'utf8'));
  const manifest = [];
  async function record(name) {
    const bytes = await readFile(join(output, name));
    manifest.push({ path: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  const sides = [[8,1],[2,7],[6,3],[4,5]];
  const panels = sides.map(([left,right], i) => {
    const x = 80 + (i % 2) * 750, y = 220 + Math.floor(i / 2) * 330;
    return `<g><text x="${x}" y="${y-18}" font-size="22">Sheet ${Math.floor(i/2)+1} · ${i%2 ? 'back' : 'front'}</text><rect x="${x}" y="${y}" width="670" height="240" fill="#f9f6ee" stroke="#5b5248" stroke-width="2"/><path d="M${x+335},${y}v240" stroke="#9d6c28" stroke-dasharray="8 7"/>${[left,right].map((n,j)=>`<text x="${x+167+j*335}" y="${y+150}" text-anchor="middle" font-size="100">${n}</text>`).join('')}</g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#ede7da"/><g fill="#28241e" font-family="Georgia,serif"><text x="80" y="100" font-size="56">Eight pages. Two folded sheets.</text><text x="80" y="155" font-size="24">Original booklet schematic · numbered positions, not a printer feed instruction</text>${panels}<text x="80" y="930" font-size="23">Fold along the dashed centre. Test orientation on your own printer. No physical print qualification is claimed.</text></g></svg>\n`;
  await writeFile(join(output, 'eight-page-booklet.svg'), svg, { flag: 'wx' }); await record('eight-page-booklet.svg');
  const captures = ['quire-book-1320.webp', 'quire-covers-1320.webp'];
  const identities = ['e7c6a3eb3b4e0090ecbaf64e68030d7eabc66fca59fa6c68c8a5833205243f94', '0f388bad00a87dc75b9f523608f3b198019008f33ee2aaf052080114b39a92f7'];
  for (const [index, name] of captures.entries()) {
    const original = await readFile(join(root, 'quire/captures', name));
    if (createHash('sha256').update(original).digest('hex') !== identities[index]) throw new Error('Released capture identity changed; requalify provenance');
    await copyFile(join(root, 'quire/captures', name), join(output, name), 1); await record(name);
  }
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Quire demonstration storyboard — unpublished draft</title><style>body{max-width:1000px;margin:40px auto;padding:0 24px;background:#f8f6f0;color:#29251e;font:20px/1.6 Georgia,serif}img{max-width:100%;height:auto}figcaption{font-size:16px}li{margin:18px 0}</style><h1>A book starts with a clear plan.</h1><p>Original unpublished storyboard. Authentic Book and Cover Studio captures document the verified Quire v1.0.0 release. The source repository remains private. Newer releases are not shown by these captures; check the current release record before publication.</p><ol>${campaign.demoStoryboard.map(s=>`<li>${escape(s)}</li>`).join('')}</ol><figure><img src="eight-page-booklet.svg" alt="Original eight-page booklet schematic with front and back positions"><figcaption>Original mathematical schematic, not a photographed finished book.</figcaption></figure>${captures.map((name,i)=>`<figure><img src="${name}" alt="Released Quire 1.0.0 ${i ? 'Cover Studio' : 'Book workspace'} using an original specimen"><figcaption>Verified v1.0.0 capture, copied unchanged. No physical binding result is implied.</figcaption></figure>`).join('')}</html>\n`;
  await writeFile(join(output, 'demo-storyboard.html'), html, { flag: 'wx' }); await record('demo-storyboard.html');
  await writeFile(join(output, 'editorial.json'), JSON.stringify(campaign, null, 2) + '\n', { flag: 'wx' }); await record('editorial.json');
  return { classification: 'draft-not-published', files: manifest };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 3) throw new Error('Usage: node scripts/build-growth-assets.mjs NEW_OUTPUT_FOLDER');
  console.log(JSON.stringify(await buildGrowthAssets(process.argv[2]), null, 2));
}
