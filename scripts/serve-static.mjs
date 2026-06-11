import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handlePresenceRequest } from './presence-api.mjs';

const root = join(fileURLToPath(new URL('..', import.meta.url)), 'dist', 'Psicologo', 'browser');
const port = Number(process.env.PORT ?? 4200);
const host = process.env.HOST ?? '0.0.0.0';

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendFile(res, filePath) {
  const type = types[extname(filePath)] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  createReadStream(filePath).pipe(res);
}

function resolveFile(urlPath) {
  const cleanPath = normalize(decodeURIComponent(urlPath.split('?')[0] ?? '/')).replace(/^(\.\.[/\\])+/, '');
  const extension = extname(cleanPath);
  const direct = join(root, cleanPath);

  if (extension && existsSync(direct) && statSync(direct).isFile()) {
    return direct;
  }

  return join(root, 'index.html');
}

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (handlePresenceRequest(req, res)) return;

  const filePath = resolveFile(req.url ?? '/');
  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build no encontrado. Ejecuta pnpm build primero.');
    return;
  }

  sendFile(res, filePath);
}).listen(port, host, () => {
  console.log(`Servidor academico listo en http://${host}:${port}`);
});
