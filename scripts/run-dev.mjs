/**
 * Desarrollo: API de presencia + ng serve con proxy.
 */
import { spawn } from 'node:child_process';
import { createPresenceServer } from './presence-api.mjs';

createPresenceServer(Number(process.env.PRESENCE_PORT ?? 4201));

const ng = spawn('pnpm', ['exec', 'ng', 'serve', '--proxy-config', 'proxy.conf.json'], {
  stdio: 'inherit',
  shell: true,
});

ng.on('exit', (code) => process.exit(code ?? 0));

process.on('SIGINT', () => {
  ng.kill('SIGINT');
  process.exit(0);
});
