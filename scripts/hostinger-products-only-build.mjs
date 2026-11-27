import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = 'src/db.js';
if (existsSync(path)) {
  let text = readFileSync(path, 'utf8');
  text = text.replace(/const localProds = getStorageItem\('products',[\s\S]*?const combined = \[[\s\S]*?\];/, 'const combined = cleanServer;');
  text = text.replace(/const existingProds = getStorageItem\('products',[\s\S]*?\n  }\n  try \{/, "setStorageItem('products', [], true);\n  try {");
  text = text.replace("fetch('/api/products')", "fetch('/api/products?sync=' + Date.now(), { cache: 'no-store' })");
  writeFileSync(path, text, 'utf8');
}
