import { existsSync, readFileSync, writeFileSync } from 'node:fs';

function patch(path, replacements) {
  if (!existsSync(path)) return;
  let text = readFileSync(path, 'utf8');
  for (const [oldText, newText] of replacements) {
    if (!text.includes(newText) && text.includes(oldText)) text = text.replace(oldText, newText);
  }
  writeFileSync(path, text, 'utf8');
}

const handler = 'api/handler.js';
patch(handler, [
  ["import { fileURLToPath } from 'node:url';\n", "import { fileURLToPath } from 'node:url';\nimport { handleHostingerDataRequest } from './hostinger-data.js';\n"],
  ["  try {\n    // =========================================================================\n    // DATABASE STATUS & HEALTH ENDPOINTS", "  try {\n    const hostingerDataHandled = await handleHostingerDataRequest(req, res, url, readJson, send);\n    if (hostingerDataHandled !== false) return;\n\n    // =========================================================================\n    // DATABASE STATUS & HEALTH ENDPOINTS"]
]);

const db = 'src/db.js';
patch(db, [
  ["// Initialization\nexport function initDB() {", "export async function syncOrdersWithServer() {\n  try { const res = await fetch('/api/orders'); if (!res.ok) return; const orders = await res.json(); if (Array.isArray(orders)) { setStorageItem('orders', orders, true); window.dispatchEvent(new CustomEvent('dainty_orders_changed', { detail: { count: orders.length } })); } } catch {}\n}\n\nexport async function syncMessagesWithServer() {\n  try { const res = await fetch('/api/messages'); if (!res.ok) return; const messages = await res.json(); if (Array.isArray(messages)) { setStorageItem('messages', messages, true); window.dispatchEvent(new CustomEvent('dainty_messages_changed', { detail: { count: messages.length } })); } } catch {}\n}\n\n// Initialization\nexport function initDB() {"],
  ["    syncProductsWithServer();\n\n    // Re-sync when switching back to this tab/window", "    syncProductsWithServer();\n    syncOrdersWithServer();\n    syncMessagesWithServer();\n\n    // Re-sync when switching back to this tab/window"],
  ["  setStorageItem('products', products);\n\n  return newOrder;", "  setStorageItem('products', products);\n  fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) }).catch(() => {});\n\n  return newOrder;"],
  ["    orders[idx].status = status;\n    setStorageItem('orders', orders);", "    orders[idx].status = status;\n    setStorageItem('orders', orders);\n    fetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).catch(() => {});"],
  ["  messages.push(newMessage);\n  setStorageItem('messages', messages);", "  messages.push(newMessage);\n  setStorageItem('messages', messages);\n  fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMessage) }).catch(() => {});"]
]);

const auth = 'src/services/auth.js';
patch(auth, [
  ["  getDoc,\n  getDocFromServer,\n  setDoc,\n  updateDoc,\n  deleteDoc,\n  serverTimestamp\n", "  getDocFromServer\n"],
  ["const path = `users/${firebaseUser.uid}`;\n  const userRef = doc(db, 'users', firebaseUser.uid);", "const userId = encodeURIComponent(firebaseUser.uid);"],
  ["export async function syncProfileUpdateToFirestore", "export async function syncProfileUpdateToFirestore"],
  ["export async function checkUserAccountExistsOnServer(userId) {", "export async function checkUserAccountExistsOnServer(userId) {" ]
]);
