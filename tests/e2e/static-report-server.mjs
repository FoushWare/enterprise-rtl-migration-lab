// Minimal loopback static server for the smoke test's generated report directory (replaces `python3 -m http.server`).
// It serves only regular files directly inside that directory, under single-segment names. Everything else is refused.
import { createServer } from 'node:http';
import { lstat, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const contentTypes = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const safeName = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function send(response, status, body = '', type = 'text/plain; charset=utf-8') {
  response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  response.end(body);
}

export function startStaticReportServer({ directory, port }) {
  const root = resolve(directory);
  const server = createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') return send(response, 405, 'Method not allowed\n');
    let name;
    try {
      name = decodeURIComponent((new URL(request.url ?? '/', 'http://127.0.0.1').pathname).slice(1));
    } catch {
      return send(response, 400, 'Bad request\n');
    }
    // Single segment only: no separators, no traversal, no NUL, no hidden or empty names.
    if (!safeName.test(name) || name.includes('..')) return send(response, 404, 'Not found\n');
    const target = join(root, name);
    if (resolve(target) !== join(root, name)) return send(response, 404, 'Not found\n');
    try {
      const info = await lstat(target);
      if (!info.isFile()) return send(response, 404, 'Not found\n');
      const body = request.method === 'HEAD' ? '' : await readFile(target);
      const type = contentTypes[name.slice(name.lastIndexOf('.'))] ?? 'application/octet-stream';
      response.writeHead(200, { 'content-type': type, 'content-length': info.size, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      response.end(body);
    } catch {
      send(response, 404, 'Not found\n');
    }
  });
  return new Promise((resolveStart, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolveStart({ url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(done => server.close(() => done())) });
    });
  });
}
