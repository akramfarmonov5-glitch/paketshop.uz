import { readFileSync, writeFileSync } from 'fs';

const files = [
  'api/gemini.ts',
  'vite-api-plugin.ts'
];

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  content = content.replace(/models\/gemini-2\.5-flash/g, 'models/gemini-3-flash-preview');
  writeFileSync(file, content, 'utf-8');
  console.log(`✅ ${file} yangilandi (gemini-3-flash-preview ga o'zgartirildi)`);
}
