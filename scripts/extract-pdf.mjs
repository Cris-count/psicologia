import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const exportDir = path.resolve('docs/notion/export');
const pdfFile = fs
  .readdirSync(exportDir)
  .find((name) => name.startsWith('Certificaci') && name.endsWith('.pdf'));

if (!pdfFile) {
  console.error('PDF not found');
  process.exit(1);
}

const buffer = fs.readFileSync(path.join(exportDir, pdfFile));
const data = await pdfParse(buffer);
const out = path.join(exportDir, 'extracted.txt');
fs.writeFileSync(out, data.text, 'utf8');
console.log(`Wrote ${data.text.length} chars to ${out}`);
