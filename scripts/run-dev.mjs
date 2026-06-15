/**
 * Desarrollo: Store API (incluye presencia) + ng serve con proxy.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dataDir = join(process.cwd(), '.data', 'dev');
mkdirSync(dataDir, { recursive: true });

const api = spawn('node', ['docker/store-api.mjs'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3000', DATA_DIR: dataDir },
});

const ng = spawn('pnpm', ['exec', 'ng', 'serve', '--proxy-config', 'proxy.conf.json'], {
  stdio: 'inherit',
  shell: true,
});

function shutdown(code = 0) {
  api.kill('SIGINT');
  ng.kill('SIGINT');
  process.exit(code);
}

api.on('exit', (code) => {
  if (code && code !== 0) shutdown(code);
});

ng.on('exit', (code) => shutdown(code ?? 0));

process.on('SIGINT', () => shutdown(0));
