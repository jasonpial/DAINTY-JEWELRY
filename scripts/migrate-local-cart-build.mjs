import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = 'src/services/cartManager.js';
const insertion = `    if (localCartNow.length > 0) {\n      fetch('/api/cart', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ userId: shopperId, cart: localCartNow, shopper: getCurrentShopper(), updatedAt: new Date().toISOString() })\n      }).catch(() => {});\n    }\n\n`;
if (existsSync(path)) {
  let text = readFileSync(path, 'utf8');
  if (!text.includes("if (localCartNow.length > 0)")) {
    text = text.replace('    return localCartNow;\n  } catch {}', insertion + '    return localCartNow;\n  } catch {}');
    writeFileSync(path, text, 'utf8');
  }
}
