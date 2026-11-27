import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = 'src/db.js';
if (existsSync(path)) {
  let text = readFileSync(path, 'utf8');
  const functionCode = `export async function migrateLocalOrdersToHostinger() {\n  if (typeof window === 'undefined') return { migrated: 0, skipped: true };\n  try {\n    const markerKey = STORAGE_PREFIX + 'orders_migrated_to_hostinger';\n    if (localStorage.getItem(markerKey) === '1') return { migrated: 0, alreadyDone: true };\n    const localOrders = getStorageItem('orders', []);\n    if (!Array.isArray(localOrders) || localOrders.length === 0) { localStorage.setItem(markerKey, '1'); return { migrated: 0, empty: true }; }\n    let migrated = 0;\n    for (const order of localOrders) {\n      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });\n      if (!response.ok) throw new Error('Order migration stopped');\n      migrated += 1;\n    }\n    localStorage.setItem(markerKey, '1');\n    return { migrated };\n  } catch (error) { console.warn('Order migration pending:', error.message); return { migrated: 0, failed: true }; }\n}\n\n`;
  if (!text.includes('migrateLocalOrdersToHostinger')) text = text.replace('// Initialization\nexport function initDB()', functionCode + '// Initialization\nexport function initDB()');
  if (!text.includes('migrateLocalOrdersToHostinger();')) text = text.replace('    isServerSyncStarted = true;\n    syncProductsWithServer();', '    isServerSyncStarted = true;\n    migrateLocalOrdersToHostinger();\n    syncProductsWithServer();');
  writeFileSync(path, text, 'utf8');
}
