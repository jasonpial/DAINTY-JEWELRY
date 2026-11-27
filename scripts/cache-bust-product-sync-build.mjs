import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = 'src/db.js';
if (existsSync(path)) {
  let text = readFileSync(path, 'utf8');
  text = text.replace("fetch('/api/products')", "fetch('/api/products?sync=' + Date.now(), { cache: 'no-store' })");
  text = text.replace("fetch(`/api/products/${productId}`, {\n      method: 'DELETE'\n    })", "fetch(`/api/products/${productId}?sync=${Date.now()}`, {\n      method: 'DELETE',\n      cache: 'no-store'\n    })");
  writeFileSync(path, text, 'utf8');
}
