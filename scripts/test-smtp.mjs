/**
 * Prueba SMTP Gmail. Uso:
 *   pnpm smtp:test
 *   pnpm smtp:test destino@gmail.com
 */
import nodemailer from 'nodemailer';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile() {
  try {
    const raw = readFileSync(join(root, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    console.error('No se encontró .env en la raíz del proyecto.');
    process.exit(1);
  }
}

loadEnvFile();

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT || 587);
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const from = process.env.SMTP_FROM || user;
const to = process.argv[2] || user;

if (!user || !pass) {
  console.error('\n❌ Falta SMTP_USER o SMTP_PASS en .env\n');
  console.error('Pasos:');
  console.error('  1. https://myaccount.google.com/security → Verificación en 2 pasos ON');
  console.error('  2. https://myaccount.google.com/apppasswords → Crear contraseña (Correo / MIND-SPHERE)');
  console.error('  3. Editar .env: SMTP_USER=tu@gmail.com  SMTP_PASS=16caracteres\n');
  process.exit(1);
}

if (!to?.includes('@')) {
  console.error('Indica un correo destino: pnpm smtp:test tu@gmail.com');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass: pass.replace(/\s/g, '') },
});

console.log(`Conectando a ${host}:${port} como ${user}…`);

try {
  await transport.verify();
  console.log('✓ Conexión SMTP OK');
} catch (error) {
  console.error('✗ No se pudo conectar:', error.message);
  console.error('\nRevisa: verificación en 2 pasos, contraseña de aplicación (no la clave normal), SMTP_USER correcto.');
  process.exit(1);
}

try {
  const info = await transport.sendMail({
    from,
    to,
    subject: '[MIND-SPHERE] Prueba de correo',
    text: 'Si lees esto, Gmail SMTP está configurado correctamente para MIND-SPHERE.',
    html: '<p>Si lees esto, <strong>Gmail SMTP</strong> está configurado correctamente para MIND-SPHERE.</p>',
  });
  console.log(`✓ Correo enviado a ${to}`);
  console.log('  messageId:', info.messageId);
} catch (error) {
  console.error('✗ Error al enviar:', error.message);
  process.exit(1);
}
