import { existsSync, readFileSync, writeFileSync } from 'node:fs';

function patch(path, replacements) {
  if (!existsSync(path)) return;
  let text = readFileSync(path, 'utf8');
  for (const [oldText, newText] of replacements) {
    if (!text.includes(newText) && text.includes(oldText)) text = text.replace(oldText, newText);
  }
  writeFileSync(path, text, 'utf8');
}
function regexPatch(path, replacements) {
  if (!existsSync(path)) return;
  let text = readFileSync(path, 'utf8');
  for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
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
patch(auth, [["  getDoc,\n  getDocFromServer,\n  setDoc,\n  updateDoc,\n  deleteDoc,\n  serverTimestamp\n", "  getDocFromServer\n"]]);
regexPatch(auth, [
  [/async function syncFirebaseUserProfile[\s\S]*?\n}\n\n\/\*\*/, `async function syncFirebaseUserProfile(firebaseUser, { name, phone = '', address = '', provider = 'password' } = {}) {\n  const userId = encodeURIComponent(firebaseUser.uid);\n  const safeEmail = clampStr(firebaseUser.email || '', 160);\n  const safeName = clampStr(name || firebaseUser.displayName || safeEmail.split('@')[0] || 'Dainty Patron', 100);\n  const safePhone = clampStr(phone || firebaseUser.phoneNumber || '', 32);\n  const safeAddress = clampStr(address || '', 300);\n  const safeProvider = provider === 'google' ? 'google' : 'password';\n  let existing = null;\n  try { const response = await fetch('/api/profiles/' + userId); if (response.ok) existing = await response.json(); } catch {}\n  const profile = { ...(existing || {}), id: firebaseUser.uid, uid: firebaseUser.uid, name: clampStr(existing?.name || safeName, 100), email: safeEmail || existing?.email || '', phone: existing?.phone || safePhone, address: existing?.address || safeAddress, provider: safeProvider, createdAt: existing?.createdAt || new Date().toISOString(), updated_at: new Date().toISOString() };\n  const response = await fetch('/api/profiles/' + userId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });\n  if (!response.ok) throw new Error('Could not save the account profile to Hostinger.');\n  return await response.json();\n}\n\n/**`],
  [/export async function syncProfileUpdateToFirestore[\s\S]*?\n}\n\n\/\*\*/, `export async function syncProfileUpdateToFirestore({ name, email, phone = '', address = '' }) {\n  const currentUser = auth.currentUser;\n  if (!currentUser) return false;\n  try {\n    const response = await fetch('/api/profiles/' + encodeURIComponent(currentUser.uid), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: clampStr(name || currentUser.displayName || 'Dainty Patron', 100), email: clampStr(email || currentUser.email || '', 160), phone: clampStr(phone, 32), address: clampStr(address, 300) }) });\n    return response.ok;\n  } catch { return false; }\n}\n\n/**`],
  [/export async function checkUserAccountExistsOnServer[\s\S]*?\n}\n\nexport async function deleteFirebaseAccount/, `export async function checkUserAccountExistsOnServer(userId) {\n  if (!userId) return true;\n  try { const response = await fetch('/api/profiles/' + encodeURIComponent(userId)); if (!response.ok) return true; return Boolean(await response.json()); } catch { return true; }\n}\n\nexport async function deleteFirebaseAccount`],
  [/export async function deleteFirebaseAccount[\s\S]*?\n}\n$/, `export async function deleteFirebaseAccount() {\n  try {\n    const user = auth.currentUser; const active = getActiveUser(); const userId = user?.uid || active?.id;\n    if (userId) { await fetch('/api/profiles/' + encodeURIComponent(userId), { method: 'DELETE' }); clearUserCart('shopper_uid_' + userId); }\n    if (user) await deleteUser(user);\n  } catch (err) { console.warn('Account deletion note:', err); }\n  deleteActiveAccount(); window.dispatchEvent(new Event('storage')); window.dispatchEvent(new CustomEvent('dainty_account_deleted'));\n}\n`]
]);
