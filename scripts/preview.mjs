import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
const isPublic = path => !path.split('/').some(part => part.startsWith('.')) && (path === '/' || /^\/(?:index\.html|404\.html|robots\.txt|sitemap\.xml|products\/quire\.json|(?:assets|demimedia|valclips|quire)(?:\/.*)?)$/.test(path));

// Static, loopback-only preview. Use Wrangler Pages dev to exercise /ai/ Functions.
export async function startPreview({ root = sourceRoot, port = 4173 } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid preview port');
  root = await realpath(root);
  const publicFile = async path => {
    const file = await realpath(path);
    const within = relative(root, file);
    if (within === '..' || within.startsWith('..' + sep) || isAbsolute(within) || !isPublic('/' + within.split(sep).join('/'))) throw new Error('Not public');
    return file;
  };
  const missing = await readFile(await publicFile(join(root, '404.html')));
  const headerFile = await readFile(join(root, '_headers'), 'utf8');
  const globalBlock = headerFile.split(/\r?\n\r?\n/)[0].split(/\r?\n/).slice(1).filter(line => line.trim());
  const headers = Object.fromEntries(globalBlock.map(line => {
    const colon = line.indexOf(':');
    if (colon < 1) throw new Error('Invalid global preview header');
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  }));
  headers['Cache-Control'] = 'no-store';
  const server = createServer(async (request, response) => {
    const send = (status, data, extra = {}) => {
      response.writeHead(status, { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': data.length, ...extra });
      response.end(request.method === 'HEAD' ? undefined : data);
    };
    if (request.headers.host !== `127.0.0.1:${server.address().port}`) return send(403, Buffer.alloc(0));
    if (!['GET', 'HEAD'].includes(request.method)) return send(405, Buffer.alloc(0), { Allow: 'GET, HEAD' });
    try {
      const raw = request.url;
      if (!raw.startsWith('/') || raw.startsWith('//') || /%2f|%5c/i.test(raw.split('?')[0])) throw new Error('Invalid target');
      const decoded = decodeURIComponent(raw.split('?')[0]);
      if (/[\\\0]/.test(decoded) || !isPublic(decoded)) throw new Error('Not public');
      let file = await publicFile(join(root, decoded));
      if ((await stat(file)).isDirectory()) {
        if (!decoded.endsWith('/')) return send(308, Buffer.alloc(0), { Location: decoded + '/' + (raw.includes('?') ? raw.slice(raw.indexOf('?')) : '') });
        file = await publicFile(join(file, 'index.html'));
      }
      const type = mime[extname(file)];
      if (!type) throw new Error('Not a public asset');
      send(200, await readFile(file), { 'Content-Type': type });
    } catch { send(404, missing); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--port')) throw new Error('Usage: npm run preview -- [--port 4173]');
  const server = await startPreview({ port: args.length ? Number(args[1]) : 4173 });
  console.log(`ALLUSIONS static preview: http://127.0.0.1:${server.address().port}/ (Ctrl+C to stop)`);
}
