import { createServer } from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf' };
const allowed = new Set(['index.html', 'styles.css', 'js', 'assets', 'robots.txt']);

export const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const target = path.resolve(root, relative);
    const withinRoot = target.startsWith(root + path.sep);
    if (!withinRoot || !allowed.has(relative.split('/')[0])) {
      response.writeHead(404).end('Not found');
      return;
    }
    if (!(await stat(target)).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    const body = await readFile(target);
    const headers = { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' };
    if (path.extname(target) === '.pdf') headers['Content-Disposition'] = 'attachment; filename="Asen-Mayuranga-Wijesiri-CV.pdf"';
    response.writeHead(200, headers);
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Portfolio preview: http://127.0.0.1:${server.address().port}`);
});
