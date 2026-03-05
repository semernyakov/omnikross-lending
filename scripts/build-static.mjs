import { mkdirSync, cpSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const publicDir = join(root, 'public');
const distDir = join(root, 'dist');

mkdirSync(distDir, { recursive: true });

cpSync(publicDir, distDir, {
  recursive: true,
  force: true,
  filter: (src) => {
    const rel = relative(publicDir, src);
    if (!rel) return true;
    return rel !== 'css/core.css';
  }
});

const walk = (dir, files = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
};

const minifyHtml = (code) => code
  .replace(/<!--([\s\S]*?)-->/g, '')
  .replace(/\n\s+/g, ' ')
  .replace(/>\s+</g, '><')
  .trim();

const minifyJs = (code) => code
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\s)\/\/.*$/gm, '$1')
  .replace(/\n\s+/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim();

const minifyCss = (code) => code
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\n\s+/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .replace(/\s*([{}:;,])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

if (existsSync(distDir)) {
  for (const file of walk(distDir)) {
    const src = readFileSync(file, 'utf8');
    if (file.endsWith('.html')) writeFileSync(file, minifyHtml(src));
    if (file.endsWith('.js')) writeFileSync(file, minifyJs(src));
    if (file.endsWith('.css')) writeFileSync(file, minifyCss(src));
  }
}

console.log('✅ Static files copied and minified to dist');
