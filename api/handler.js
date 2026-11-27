import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const POSSIBLE_PERSISTENT_DIRS = [
  process.env.DATA_DIR,
  '/home/u111258626/domains/daintystudsandchains.com/dainty_data',
  resolve(__dirname, '../data'),
  resolve(__dirname, '../../dainty_data'),
  resolve(__dirname, 'data')
].filter(Boolean);

const POSSIBLE_READ_DIRS = [
  ...POSSIBLE_PERSISTENT_DIRS,
  __dirname
];

function ensureDir(dir) {
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function getPaymentConfig() {
  for (const dir of POSSIBLE_PERSISTENT_DIRS) {
    try {
      if (existsSync(dir)) {
        const target = resolve(dir, 'payment_config.json');
        if (existsSync(target)) {
          const content = readFileSync(target, 'utf-8');
          return JSON.parse(content);
        }
      }
    } catch {}
  }
  return {};
}

function savePaymentConfig(config) {
  let saved = false;
  for (const dir of POSSIBLE_PERSISTENT_DIRS) {
    try {
      if (ensureDir(dir)) {
        const target = resolve(dir, 'payment_config.json');
        writeFileSync(target, JSON.stringify(config, null, 2), 'utf-8');
        saved = true;
      }
    } catch {}
  }
  return saved;
}

function parseEnvString(content) {
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  }
  return result;
}

function getEnvFileCredentials() {
  const possibleEnvFiles = [
    resolve(__dirname, '../.env'),
    resolve(__dirname, '.env'),
    '/home/u111258626/domains/daintystudsandchains.com/dainty_data/.env'
  ];
  for (const p of possibleEnvFiles) {
    try {
      if (existsSync(p)) {
        return parseEnvString(readFileSync(p, 'utf-8'));
      }
    } catch {}
  }
  return {};
}

function isCleanVal(val) {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('replace_with') ||
    lower.includes('your_relworx') ||
    lower.includes('your-domain.example') ||
    lower.includes('your_api_key') ||
    lower.includes('your_account')
  ) {
    return '';
  }
  return trimmed;
}

function resolveRelworxCredentials(customEnv = {}) {
  const fileConfig = getPaymentConfig();
  const envFile = getEnvFileCredentials();

  // Priority: 1. fileConfig (Admin dashboard save), 2. customEnv / process.env, 3. envFile, 4. default
  const apiKey = (
    isCleanVal(fileConfig.apiKey) ||
    isCleanVal(fileConfig.RELWORX_API_KEY) ||
    isCleanVal(customEnv.RELWORX_API_KEY) ||
    isCleanVal(process.env.RELWORX_API_KEY) ||
    isCleanVal(envFile.RELWORX_API_KEY) ||
    ''
  );

  const accountNo = (
    isCleanVal(fileConfig.accountNo) ||
    isCleanVal(fileConfig.RELWORX_ACCOUNT_NO) ||
    isCleanVal(customEnv.RELWORX_ACCOUNT_NO) ||
    isCleanVal(process.env.RELWORX_ACCOUNT_NO) ||
    isCleanVal(envFile.RELWORX_ACCOUNT_NO) ||
    'REL11AE925B85'
  );

  const webhookKey = (
    isCleanVal(fileConfig.webhookKey) ||
    isCleanVal(fileConfig.RELWORX_WEBHOOK_KEY) ||
    isCleanVal(customEnv.RELWORX_WEBHOOK_KEY) ||
    isCleanVal(process.env.RELWORX_WEBHOOK_KEY) ||
    isCleanVal(envFile.RELWORX_WEBHOOK_KEY) ||
    '424a7fe74781e4ecdcb8dfcbdb'
  );

  const baseUrl = (
    isCleanVal(fileConfig.baseUrl) ||
    isCleanVal(fileConfig.RELWORX_BASE_URL) ||
    isCleanVal(customEnv.RELWORX_BASE_URL) ||
    isCleanVal(process.env.RELWORX_BASE_URL) ||
    isCleanVal(envFile.RELWORX_BASE_URL) ||
    'https://payments.relworx.com/api'
  ).replace(/\/+$/, '');

  const webhookUrl = (
    isCleanVal(fileConfig.webhookUrl) ||
    isCleanVal(fileConfig.RELWORX_WEBHOOK_URL) ||
    isCleanVal(customEnv.RELWORX_WEBHOOK_URL) ||
    isCleanVal(process.env.RELWORX_WEBHOOK_URL) ||
    isCleanVal(envFile.RELWORX_WEBHOOK_URL) ||
    'https://daintystudsandchains.com/api/relworx/webhook'
  );

  return { apiKey, accountNo, webhookKey, baseUrl, webhookUrl };
}

let cachedServerIp = null;
let lastIpCheck = 0;
async function getServerIp() {
  if (cachedServerIp && (Date.now() - lastIpCheck < 300_000)) return cachedServerIp;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        cachedServerIp = data.ip;
        lastIpCheck = Date.now();
        return cachedServerIp;
      }
    }
  } catch {}
  return cachedServerIp || '151.106.96.51';
}

function getFilePath(filename) {
  // First check if persistent directory already has the file
  for (const dir of POSSIBLE_PERSISTENT_DIRS) {
    try {
      if (existsSync(dir)) {
        const candidate = resolve(dir, filename);
        if (existsSync(candidate)) return candidate;
      }
    } catch {}
  }
  return resolve(__dirname, filename);
}

const _PRODUCTS_DB_PATH = getFilePath('products_db.json');
const _DELETED_IDS_PATH = getFilePath('deleted_ids.json');

// Helper to read and write database with persistent mirroring
function getDeletedIds() {
  for (const dir of POSSIBLE_READ_DIRS) {
    try {
      if (existsSync(dir)) {
        const target = resolve(dir, 'deleted_ids.json');
        if (existsSync(target)) {
          const content = readFileSync(target, 'utf-8');
          return JSON.parse(content);
        }
      }
    } catch {}
  }
  return [];
}

function saveDeletedIds(ids) {
  let saved = false;
  for (const dir of POSSIBLE_PERSISTENT_DIRS) {
    try {
      if (ensureDir(dir)) {
        const target = resolve(dir, 'deleted_ids.json');
        writeFileSync(target, JSON.stringify(ids, null, 2), 'utf-8');
        saved = true;
      }
    } catch {}
  }
  return saved;
}

function getDbProducts() {
  const deletedSet = new Set(getDeletedIds());
  for (const dir of POSSIBLE_READ_DIRS) {
    try {
      if (existsSync(dir)) {
        const target = resolve(dir, 'products_db.json');
        if (existsSync(target)) {
          const content = readFileSync(target, 'utf-8');
          const all = JSON.parse(content);
          if (Array.isArray(all)) {
            return all
              .filter(p => p && p.id && !deletedSet.has(p.id) && (p.category_id || 'earrings').toLowerCase() === 'earrings')
              .map(p => ({ ...p, category_id: 'earrings' }));
          }
        }
      }
    } catch {}
  }
  return [];
}

function saveDbProducts(products) {
  let saved = false;
  for (const dir of POSSIBLE_PERSISTENT_DIRS) {
    try {
      if (existsSync(dir)) {
        const target = resolve(dir, 'products_db.json');
        writeFileSync(target, JSON.stringify(products, null, 2), 'utf-8');
        saved = true;
      }
    } catch {}
  }
  return saved;
}

function getUserCartsDb() {
  for (const dir of POSSIBLE_PERSISTENT_DIRS) {
    try {
      if (existsSync(dir)) {
        const target = resolve(dir, 'user_carts.json');
        if (existsSync(target)) {
          const content = readFileSync(target, 'utf-8');
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      }
    } catch {}
  }
  return {};
}

function saveUserCartsDb(carts) {
  let saved = false;
  for (const dir of POSSIBLE_PERSISTENT_DIRS) {
    try {
      if (ensureDir(dir)) {
        const target = resolve(dir, 'user_carts.json');
        writeFileSync(target, JSON.stringify(carts, null, 2), 'utf-8');
        saved = true;
      }
    } catch {}
  }
  return saved;
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 15_000_000) throw new Error('Request body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function send(res, status, data) {
  res.writeHead(status, { 
    'content-type': 'application/json', 
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

async function callRelworx(path, method = 'GET', payload, { apiKey, accountNo, baseUrl }) {
  if (!apiKey || !accountNo) {
    throw new Error('Relworx server credentials are not configured. Set RELWORX_API_KEY and RELWORX_ACCOUNT_NO.');
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.relworx.v2',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    ...(payload ? { body: JSON.stringify({ ...payload, account_no: accountNo }) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Relworx HTTP ${response.status}`);
  return data;
}

function _validWebhook(req, data, { webhookKey, webhookUrl }) {
  if (!webhookKey || !webhookUrl) return false;
  const signatureHeader = req.headers['relworx-signature'] || '';
  const parts = Object.fromEntries(signatureHeader.split(',').map(part => part.trim().split('=')));
  if (!parts.t || !parts.v || !/^\d+$/.test(parts.t)) return false;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) return false;
  const selected = { status: data.status, customer_reference: data.customer_reference, internal_reference: data.internal_reference };
  const signed = webhookUrl + parts.t + Object.keys(selected).sort().map(key => key + String(selected[key] ?? '')).join('');
  const expected = createHmac('sha256', webhookKey).update(signed).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function handleApiRequest(req, res, customEnv = {}) {
  const credentials = resolveRelworxCredentials(customEnv);
  const API_KEY = credentials.apiKey;
  const ACCOUNT_NO = credentials.accountNo;
  const WEBHOOK_KEY = credentials.webhookKey;
  const BASE_URL = credentials.baseUrl;
  const WEBHOOK_URL = credentials.webhookUrl;

  const url = new URL(req.url, 'http://localhost');
  const pathname = (url.pathname || '/').replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end();
    return;
  }

  try {
    // =========================================================================
    // DATABASE STATUS & HEALTH ENDPOINTS (Fixes Hostinger /api/database/status)
    // =========================================================================
    if (pathname === '/api/database/status' || pathname === '/api/db_status' || pathname === '/api/status') {
      const prods = getDbProducts();
      return send(res, 200, {
        status: 'connected',
        driver: 'Node.js 22 Hostinger Persistent Server Database',
        products_count: prods.length,
        persistent: true,
        online: true,
        timestamp: new Date().toISOString()
      });
    }

    if ((req.method === 'POST' || req.method === 'PUT') && (pathname === '/api/database/config' || pathname === '/api/db_config')) {
      const config = await readJson(req);
      try {
        const publicConfigPath = resolve(__dirname, '../public/api/db_config.json');
        writeFileSync(publicConfigPath, JSON.stringify(config, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Could not write public/api/db_config.json:', err);
      }
      return send(res, 200, {
        success: true,
        message: 'Database configuration saved successfully.'
      });
    }

    // =========================================================================
    // PRODUCTS DATABASE REST ENDPOINTS (GET, POST, PUT, DELETE, RESET)
    // =========================================================================
    
    // GET /api/products -> Retrieve all stored products
    if (req.method === 'GET' && pathname === '/api/products') {
      const products = getDbProducts();
      return send(res, 200, products);
    }

    // GET /api/products/:id -> Retrieve a single product by ID
    if (req.method === 'GET' && pathname.startsWith('/api/products/')) {
      const productId = pathname.replace('/api/products/', '').trim();
      const products = getDbProducts();
      const found = products.find(p => p.id === productId);
      if (found) {
        return send(res, 200, found);
      }
      return send(res, 404, { error: `Product ${productId} not found.` });
    }

    // POST or PUT /api/products or /api/products/:id -> Create or update product
    if ((req.method === 'POST' || req.method === 'PUT') && (pathname === '/api/products' || pathname.startsWith('/api/products/'))) {
      if (pathname === '/api/products/reset') {
        // Fall through to reset handler below
      } else {
        const product = await readJson(req);
        if (!product || (!product.name && !product.title)) {
          return send(res, 400, { error: 'Product name is required.' });
        }

        // Enforce Earrings as the sole storefront product category
        product.category_id = 'earrings';

        // Check if ID is in URL
        const idFromUrl = pathname.startsWith('/api/products/') ? pathname.replace('/api/products/', '').trim() : '';
        if (idFromUrl && !product.id) {
          product.id = idFromUrl;
        }

        if (product.id) {
          const deletedIds = getDeletedIds();
          if (deletedIds.includes(product.id)) {
            saveDeletedIds(deletedIds.filter(id => id !== product.id));
          }
        } else {
          product.id = 'prod_' + Math.random().toString(36).substr(2, 9);
          product.created_at = new Date().toISOString();
        }

        const products = getDbProducts();
        const idx = products.findIndex(p => p.id === product.id);
        if (idx !== -1) {
          products[idx] = { ...products[idx], ...product };
        } else {
          products.unshift(product);
        }

        saveDbProducts(products);
        return send(res, 200, product);
      }
    }

    // DELETE /api/products/:id -> Delete a product by ID permanently
    if (req.method === 'DELETE' && pathname.startsWith('/api/products/')) {
      const productId = pathname.replace('/api/products/', '').trim();
      if (!productId) {
        return send(res, 400, { error: 'Product ID required' });
      }
      
      // Add to permanent deleted IDs blacklist
      const deletedIds = getDeletedIds();
      if (!deletedIds.includes(productId)) {
        deletedIds.push(productId);
        saveDeletedIds(deletedIds);
      }

      const products = getDbProducts();
      const filtered = products.filter(p => p.id !== productId);
      saveDbProducts(filtered);
      return send(res, 200, { success: true, deletedId: productId, count: filtered.length });
    }

    // POST /api/products/reset -> Reset database
    if (req.method === 'POST' && pathname === '/api/products/reset') {
      const resetProducts = await readJson(req);
      saveDeletedIds([]); // Clear deleted blacklist on explicit reset
      const toSave = Array.isArray(resetProducts) && resetProducts.length > 0 ? resetProducts : getDbProducts();
      saveDbProducts(toSave);
      return send(res, 200, { success: true, count: toSave.length });
    }

    // =========================================================================
    // MULTI-USER ISOLATED SHOPPING BAG / CART ENDPOINTS
    // =========================================================================

    // GET /api/cart?userId=... or /api/cart/:userId
    if (req.method === 'GET' && (pathname === '/api/cart' || pathname.startsWith('/api/cart/'))) {
      const userId = (pathname.startsWith('/api/cart/')
        ? pathname.replace('/api/cart/', '').trim()
        : (url.searchParams.get('userId') || url.searchParams.get('shopperId') || '')).trim();

      if (!userId) {
        return send(res, 400, { error: 'userId parameter required' });
      }

      const cartsDb = getUserCartsDb();
      const exists = Object.prototype.hasOwnProperty.call(cartsDb, userId);
      const userEntry = exists ? cartsDb[userId] : { cart: [], shopper: null, updatedAt: null };
      const cart = Array.isArray(userEntry) ? userEntry : (userEntry.cart || []);
      return send(res, 200, {
        userId,
        exists,
        cart,
        count: cart.length,
        updatedAt: userEntry?.updatedAt || null
      });
    }

    // POST /api/cart -> Save/update cart for a specific user
    if ((req.method === 'POST' || req.method === 'PUT') && pathname === '/api/cart') {
      const body = await readJson(req);
      const userId = (body && body.userId ? String(body.userId).trim() : '').trim();
      if (!userId) {
        return send(res, 400, { error: 'userId is required to save user-isolated cart' });
      }

      const cart = Array.isArray(body.cart) ? body.cart : [];
      const updatedAt = body.updatedAt || new Date().toISOString();
      const cartsDb = getUserCartsDb();
      cartsDb[userId] = {
        cart,
        shopper: body.shopper || null,
        updatedAt
      };
      saveUserCartsDb(cartsDb);
      return send(res, 200, { success: true, userId, count: cart.length, updatedAt });
    }

    // DELETE /api/cart?userId=... or /api/cart/:userId -> Clear user cart
    if (req.method === 'DELETE' && (pathname === '/api/cart' || pathname.startsWith('/api/cart/'))) {
      const userId = (pathname.startsWith('/api/cart/')
        ? pathname.replace('/api/cart/', '').trim()
        : (url.searchParams.get('userId') || url.searchParams.get('shopperId') || '')).trim();

      if (userId) {
        const cartsDb = getUserCartsDb();
        delete cartsDb[userId];
        saveUserCartsDb(cartsDb);
      }
      return send(res, 200, { success: true, userId });
    }

    // =========================================================================
    // PAYMENTS & RELWORX ENDPOINTS
    // =========================================================================
    if (req.method === 'GET' && pathname === '/api/health') {
      return send(res, 200, {
        ok: true,
        relworxConfigured: Boolean(API_KEY && ACCOUNT_NO),
        account_no: ACCOUNT_NO || 'REL11AE925B85'
      });
    }

    // GET /api/relworx/status -> Check gateway configuration status
    if (req.method === 'GET' && (pathname === '/api/relworx/status' || pathname === '/api/relworx/config')) {
      const isConfigured = Boolean(API_KEY && ACCOUNT_NO);
      const serverIp = await getServerIp();
      return send(res, 200, {
        configured: isConfigured,
        account_no: ACCOUNT_NO || 'REL11AE925B85',
        api_key_set: Boolean(API_KEY),
        masked_key: API_KEY ? `${API_KEY.slice(0, 4)}••••••••${API_KEY.slice(-4)}` : null,
        webhook_key_set: Boolean(WEBHOOK_KEY),
        server_ip: serverIp,
        base_url: BASE_URL,
        webhook_url: WEBHOOK_URL || 'https://daintystudsandchains.com/api/relworx/webhook',
        merchant_mtn: '+256788227027',
        merchant_airtel: '+256759924291',
        supported_networks: ['MTN', 'AIRTEL'],
        timestamp: new Date().toISOString()
      });
    }

    // POST /api/relworx/config -> Save Relworx credentials to persistent storage
    if (req.method === 'POST' && pathname === '/api/relworx/config') {
      const body = await readJson(req);
      const current = getPaymentConfig();
      const updated = {
        ...current,
        accountNo: (body.accountNo || body.account_no || current.accountNo || 'REL11AE925B85').trim(),
        apiKey: (body.apiKey !== undefined ? body.apiKey : (body.api_key !== undefined ? body.api_key : (current.apiKey || ''))).trim(),
        webhookKey: (body.webhookKey !== undefined ? body.webhookKey : (body.webhook_key !== undefined ? body.webhook_key : (current.webhookKey || ''))).trim(),
        baseUrl: (body.baseUrl || body.base_url || current.baseUrl || 'https://payments.relworx.com/api').trim(),
        webhookUrl: (body.webhookUrl || body.webhook_url || current.webhookUrl || 'https://daintystudsandchains.com/api/relworx/webhook').trim(),
        updated_at: new Date().toISOString()
      };
      savePaymentConfig(updated);
      return send(res, 200, {
        success: true,
        message: 'Relworx payment credentials saved and persisted successfully.',
        configured: Boolean(updated.apiKey && updated.accountNo),
        account_no: updated.accountNo,
        masked_key: updated.apiKey ? `${updated.apiKey.slice(0, 4)}••••••••${updated.apiKey.slice(-4)}` : null
      });
    }

    // POST /api/relworx/test-connection -> Verify connection to Relworx API
    if (req.method === 'POST' && pathname === '/api/relworx/test-connection') {
      const body = await readJson(req);
      const testKey = (body.apiKey || body.api_key || API_KEY || '').trim();
      const testAccount = (body.accountNo || body.account_no || ACCOUNT_NO || 'REL11AE925B85').trim();
      const testBase = (body.baseUrl || body.base_url || BASE_URL).trim();

      if (!testKey) {
        return send(res, 400, {
          success: false,
          error: 'Please enter a Relworx API Key to test connection.'
        });
      }

      try {
        const query = new URLSearchParams({ internal_reference: 'PING_TEST_REF', account_no: testAccount });
        const response = await fetch(`${testBase}/mobile-money/check-request-status?${query}`, {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.relworx.v2',
            Authorization: `Bearer ${testKey}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 401 || response.status === 403) {
          const respText = await response.text();
          let parsed;
          try { parsed = JSON.parse(respText); } catch {}
          const errorMsg = parsed?.message || parsed?.error || 'Authentication failed with Relworx. The API key is invalid or unauthorized.';
          return send(res, 401, {
            success: false,
            error: errorMsg
          });
        }

        return send(res, 200, {
          success: true,
          message: 'Relworx payment server is connected and authenticated successfully!',
          account_no: testAccount,
          status: response.status
        });
      } catch (err) {
        return send(res, 502, {
          success: false,
          error: `Could not reach Relworx server: ${err.message}`
        });
      }
    }

    // POST /api/relworx/webhook -> Relworx transaction callback webhook
    if (req.method === 'POST' && pathname === '/api/relworx/webhook') {
      try {
        const data = await readJson(req);
        console.info('Received Relworx webhook callback:', JSON.stringify({
          status: data.status,
          customer_reference: data.customer_reference,
          internal_reference: data.internal_reference
        }));
      } catch {}
      // Always acknowledge HTTP 200 immediately to prevent Relworx from retrying
      return send(res, 200, { received: true });
    }

    // Rate-limiting / debounce cache for payment requests
    if (!globalThis.__recentPaymentRequests) {
      globalThis.__recentPaymentRequests = new Map();
    }

    // POST /api/relworx/mobile-money/request-payment -> Initiate USSD prompt to customer
    if (req.method === 'POST' && pathname === '/api/relworx/mobile-money/request-payment') {
      const data = await readJson(req);
      const { msisdn, amount, reference, description } = data;
      if (!/^\+256\d{9}$/.test(msisdn || '') || !Number.isFinite(Number(amount)) || Number(amount) < 500 || Number(amount) > 5_000_000 || !/^[A-Za-z0-9]{8,36}$/.test(reference || '')) {
        return send(res, 400, { error: 'Invalid phone, amount, or payment reference.' });
      }

      // Check if a payment request was already fired to this number in the last 10 seconds
      const now = Date.now();
      const lastSent = globalThis.__recentPaymentRequests.get(msisdn);
      if (lastSent && (now - lastSent < 10000)) {
        return send(res, 429, { 
          error: 'A payment prompt was just sent to your phone. Please check your handset or wait a few seconds before trying again.' 
        });
      }
      globalThis.__recentPaymentRequests.set(msisdn, now);

      const result = await callRelworx('/mobile-money/request-payment', 'POST', {
        msisdn,
        amount: Number(amount),
        reference,
        currency: 'UGX',
        description: String(description || `DAINTY Order ${reference}`).slice(0, 100)
      }, { apiKey: API_KEY, accountNo: ACCOUNT_NO, baseUrl: BASE_URL });
      return send(res, 200, result);
    }

    // GET /api/relworx/mobile-money/check-request-status -> Check payment status polling
    if (req.method === 'GET' && pathname === '/api/relworx/mobile-money/check-request-status') {
      const internalReference = url.searchParams.get('internal_reference');
      if (!internalReference || !/^[A-Za-z0-9-]+$/.test(internalReference)) {
        return send(res, 400, { error: 'Invalid internal reference.' });
      }
      const query = new URLSearchParams({ internal_reference: internalReference, account_no: ACCOUNT_NO || '' });
      const result = await callRelworx(`/mobile-money/check-request-status?${query}`, 'GET', null, { apiKey: API_KEY, accountNo: ACCOUNT_NO, baseUrl: BASE_URL });
      
      const raw = (result.status || result.request_status || '').toLowerCase();
      if (raw === 'success' || raw === 'successful') {
        result.status = 'successful';
      } else if (
        raw === 'failed' || raw === 'declined' || raw === 'cancelled' || raw === 'canceled' ||
        raw === 'rejected' || raw === 'expired' || raw === 'insufficient_funds' || raw === 'insufficient_balance' ||
        result.success === false
      ) {
        result.status = 'failed';
        if (!result.message) {
          result.message = (raw.includes('insufficient') || (result.error || '').includes('insufficient'))
            ? 'Insufficient balance in mobile money wallet.'
            : 'Payment was cancelled or declined on phone.';
        }
      }
      return send(res, 200, result);
    }

    // POST /api/relworx/mobile-money/validate-mobile-number -> Validate Ugandan phone number
    if (req.method === 'POST' && pathname === '/api/relworx/mobile-money/validate-mobile-number') {
      const { msisdn } = await readJson(req);
      if (!/^\+256\d{9}$/.test(msisdn || '')) return send(res, 400, { error: 'Invalid Uganda mobile number.' });
      const result = await callRelworx('/mobile-money/validate-mobile-number', 'POST', { msisdn }, { apiKey: API_KEY, accountNo: ACCOUNT_NO, baseUrl: BASE_URL });
      return send(res, 200, result);
    }

    return send(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('API error:', error.message);
    return send(res, 502, { error: error.message || 'Service error' });
  }
}
