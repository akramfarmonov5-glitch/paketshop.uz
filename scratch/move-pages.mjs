import fs from 'fs';
import path from 'path';

const appDir = path.join(process.cwd(), 'app');
const langDir = path.join(appDir, '[lang]');

if (!fs.existsSync(langDir)) {
  fs.mkdirSync(langDir);
}

// All top level items in app except [lang], api, globals.css
const items = fs.readdirSync(appDir);

items.forEach(item => {
  if (item !== '[lang]' && item !== 'api' && item !== 'globals.css') {
    const oldPath = path.join(appDir, item);
    const newPath = path.join(langDir, item);
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item} to [lang]/`);
  }
});
