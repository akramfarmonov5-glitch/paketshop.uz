import fs from 'fs';
import path from 'path';

const contextDir = path.join(process.cwd(), 'context');
const componentsDir = path.join(process.cwd(), 'components');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // A naive replacement for common localStorage patterns in this app
  // Replacing `localStorage.getItem('paketshop_theme')` with `(typeof window !== 'undefined' ? localStorage.getItem('paketshop_theme') : null)`
  content = content.replace(/localStorage\.getItem\(([^)]+)\)/g, "(typeof window !== 'undefined' ? localStorage.getItem($1) : null)");
  
  // Replace direct window usage in useState
  content = content.replace(/window\.matchMedia/g, "(typeof window !== 'undefined' ? window.matchMedia : function(){return {matches:false}})");
  content = content.replace(/window\.location\.pathname/g, "(typeof window !== 'undefined' ? window.location.pathname : '/')");
  
  fs.writeFileSync(filePath, content);
}

const contextFiles = fs.readdirSync(contextDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
contextFiles.forEach(f => fixFile(path.join(contextDir, f)));

const componentFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
componentFiles.forEach(f => fixFile(path.join(componentsDir, f)));

console.log("Fixed window/localStorage SSR issues.");
