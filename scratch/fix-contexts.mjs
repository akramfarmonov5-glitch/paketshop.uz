import fs from 'fs';
import path from 'path';

const contextDir = path.join(process.cwd(), 'context');
const files = fs.readdirSync(contextDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(f => {
  const filePath = path.join(contextDir, f);
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.startsWith("'use client';") && !content.startsWith('"use client";')) {
    fs.writeFileSync(filePath, "'use client';\n" + content);
    console.log(`Added 'use client' to ${f}`);
  }
});
