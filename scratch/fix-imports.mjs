import fs from 'fs';
import path from 'path';

function replaceImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceImports(fullPath);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from '\.\.\//g, "from '../../");
      content = content.replace(/import '\.\.\//g, "import '../../");
      fs.writeFileSync(fullPath, content);
    }
  });
}

replaceImports(path.join(process.cwd(), 'app', '[lang]'));
console.log('Imports fixed.');
