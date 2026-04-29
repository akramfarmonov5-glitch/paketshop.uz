import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contextDir = path.join(__dirname, 'context');

const files = fs.readdirSync(contextDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(f => {
  const filePath = path.join(contextDir, f);
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.startsWith("'use client';") && !content.startsWith('"use client";')) {
    fs.writeFileSync(filePath, "'use client';\n" + content);
    console.log(`Added 'use client' to ${f}`);
  }
});
