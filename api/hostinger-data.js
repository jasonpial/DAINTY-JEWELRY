import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_DIR = process.env.DATA_DIR || '/home/u111258626/domains/daintystudsandchains.com/public_html/api';
const FILES = { orders: 'orders.json', messages: 'messages.json', profiles: 'profiles.json' };

function load(name, fallback) {
  try {
    const file = resolve(DATA_DIR, FILES[name]);
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch { return fallback; }
}
function save(name, value) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(resolve(DATA_DIR, FILES[name]), JSON.stringify(value, null, 2), 'utf8');
}
function safeId(value, fallback = '') { return String(value || fallback).trim().slice(0, 160); }

export async function handleHostingerDataRequest(req, res, url, readJson, send) {
  const { pathname } = url;
  if (pathname === '/api/orders' && req.method === 'GET') return send(res, 200, load('orders', []));
  if (pathname === '/api/orders' && req.method === 'POST') {
    const body = await readJson(req); const orders = load('orders', []);
    const order = { ...body, id: safeId(body.id, `ord_${Date.now().toString(36)}`), created_at: body.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
    const index = orders.findIndex((item) => item && item.id === order.id);
    if (index >= 0) orders[index] = { ...orders[index], ...order }; else orders.push(order);
    save('orders', orders); return send(res, 200, order);
  }
  if (pathname.startsWith('/api/orders/') && (req.method === 'PUT' || req.method === 'PATCH')) {
    const id = safeId(pathname.replace('/api/orders/', '')); const body = await readJson(req); const orders = load('orders', []);
    const index = orders.findIndex((item) => item && item.id === id);
    if (index < 0) return send(res, 404, { error: 'Order not found' });
    orders[index] = { ...orders[index], ...body, id, updated_at: new Date().toISOString() }; save('orders', orders); return send(res, 200, orders[index]);
  }
  if (pathname === '/api/messages' && req.method === 'GET') {
    const chatId = safeId(url.searchParams.get('chatId')); const messages = load('messages', []);
    return send(res, 200, chatId ? messages.filter((item) => item.chatId === chatId) : messages);
  }
  if (pathname === '/api/messages' && req.method === 'POST') {
    const body = await readJson(req); const messages = load('messages', []);
    const message = { ...body, id: safeId(body.id, `msg_${Date.now().toString(36)}`), timestamp: body.timestamp || new Date().toISOString() };
    messages.push(message); save('messages', messages); return send(res, 200, message);
  }
  if (pathname.startsWith('/api/profiles/') && req.method === 'GET') {
    const userId = safeId(pathname.replace('/api/profiles/', '')); const profiles = load('profiles', {});
    return send(res, 200, profiles[userId] || null);
  }
  if (pathname.startsWith('/api/profiles/') && (req.method === 'PUT' || req.method === 'PATCH')) {
    const userId = safeId(pathname.replace('/api/profiles/', '')); if (!userId) return send(res, 400, { error: 'Profile ID required' });
    const body = await readJson(req); const profiles = load('profiles', {});
    profiles[userId] = { ...(profiles[userId] || {}), ...body, id: userId, updated_at: new Date().toISOString() };
    save('profiles', profiles); return send(res, 200, profiles[userId]);
  }
  if (pathname.startsWith('/api/profiles/') && req.method === 'DELETE') {
    const userId = safeId(pathname.replace('/api/profiles/', '')); const profiles = load('profiles', {});
    delete profiles[userId]; save('profiles', profiles); return send(res, 200, { success: true, id: userId });
  }
  return false;
}
