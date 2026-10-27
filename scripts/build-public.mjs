import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, readFile, readdir, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const source = fileURLToPath(new URL('../', import.meta.url));
const directories = ['assets', 'demimedia', 'valclips', 'quire'];
const required = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '_headers', 'products/quire.json'];
const extensions = new Set(['.html', '.css', '.svg', '.png', '.webp', '.woff2', '.woff', '.txt', '.ico']);

// Prepare assets only. Wrangler finds the existing /functions directory in the
// project root; never copy its sources or development tooling into static assets.
export async function buildPublic(destination, root = source) {
  root = await realpath(root);
  destination = resolve(destination);
  // mkdir below is intentionally nonrecursive: the parent must already exist.
  // Canonicalize that ancestor before testing aliases/junctions into source.
  destination = join(await realpath(dirname(destination)), basename(destination));
  if (destination === root || [...directories, 'products'].some(d => {
    const path = relative(join(root, d), destination);
    return path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith('..' + sep));
  })) throw new Error('Output must be separate from public source');
  const entries = [];
  async function collect(path, requiredFile = false) {
    const file = join(root, path);
    const info = await lstat(file);
    const canonical = relative(root, await realpath(file));
    if (info.isSymbolicLink() || isAbsolute(canonical) || canonical === '..' || canonical.startsWith('..' + sep))
      throw new Error('Public source must not contain links');
    if (info.isDirectory()) {
      for (const child of (await readdir(file)).sort()) {
        if (!child.startsWith('.')) await collect(path + '/' + child);
      }
    } else if (info.isFile() && (requiredFile || extensions.has(extname(path)))) entries.push(path);
  }
  for (const path of required) await collect(path, true);
  for (const path of directories) await collect(path);
  entries.sort();
  // A new directory is required. Existing files/trees are never removed.
  await mkdir(destination);
  const manifest = [];
  for (const path of entries) {
    const output = join(destination, path);
    await mkdir(dirname(output), { recursive: true });
    await copyFile(join(root, path), output, constants.COPYFILE_EXCL);
    const bytes = await readFile(output);
    manifest.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  return manifest;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length > 3) throw new Error('Usage: npm run build -- [new-output-directory]');
  const manifest = await buildPublic(process.argv[2] ?? '.preview-dist');
  console.log(JSON.stringify({ files: manifest.length, bytes: manifest.reduce((n, f) => n + f.bytes, 0), manifest }, null, 2));
}
