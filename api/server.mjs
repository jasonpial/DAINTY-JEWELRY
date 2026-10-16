import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.API_PORT || 8787);
const API_KEY = process.env.RELWORX_API_KEY;
const ACCOUNT_NO = process.env.RELWORX_ACCOUNT_NO;
const WEBHOOK_KEY = process.env.RELWORX_WEBHOOK_KEY;
const BASE_URL = (process.env.RELWORX_BASE_URL || 'https://payments.relworx.com/api').replace(/\/$/, '');
const WEBHOOK_URL = process.env.RELWORX_WEBHOOK_URL;

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 32_768) throw new Error('Request body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function send(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function relworx(path, method = 'GET', payload) {
  if (!API_KEY || !ACCOUNT_NO) throw new Error('Relworx server credentials are not configured. Set RELWORX_API_KEY and RELWORX_ACCOUNT_NO.');
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { Accept: 'application/vnd.relworx.v2', Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    ...(payload ? { body: JSON.stringify({ ...payload, account_no: ACCOUNT_NO }) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Relworx HTTP ${response.status}`);
  return data;
}

function validWebhook(req, data) {
  if (!WEBHOOK_KEY || !WEBHOOK_URL) return false;
  const signatureHeader = req.headers['relworx-signature'] || '';
  const parts = Object.fromEntries(signatureHeader.split(',').map(part => part.trim().split('=')));
  if (!parts.t || !parts.v || !/^\d+$/.test(parts.t)) return false;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) return false;
  const selected = { status: data.status, customer_reference: data.customer_reference, internal_reference: data.internal_reference };
  const signed = WEBHOOK_URL + parts.t + Object.keys(selected).sort().map(key => key + String(selected[key] ?? '')).join('');
  const expected = createHmac('sha256', WEBHOOK_KEY).update(signed).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v);
  return a.length === b.length && timingSafeEqual(a, b);
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, { ok: true, relworxConfigured: Boolean(API_KEY && ACCOUNT_NO) });
    }
    if (req.method === 'POST' && url.pathname === '/api/relworx/webhook') {
      const data = await readJson(req);
      if (!validWebhook(req, data)) return send(res, 401, { error: 'Invalid webhook signature or webhook URL configuration.' });
      // Relworx notifications are acknowledged after signature and payload checks.
      console.info('Verified Relworx webhook', JSON.stringify({ status: data.status, customer_reference: data.customer_reference, internal_reference: data.internal_reference }));
      return send(res, 200, { received: true });
    }
    if (url.pathname === '/api/relworx/mobile-money/request-payment' && req.method === 'POST') {
      const data = await readJson(req);
      const { msisdn, amount, reference, description } = data;
      if (!/^\+256\d{9}$/.test(msisdn || '') || !Number.isFinite(Number(amount)) || Number(amount) < 500 || Number(amount) > 5_000_000 || !/^[A-Za-z0-9]{8,36}$/.test(reference || '')) {
        return send(res, 400, { error: 'Invalid phone, amount, or payment reference.' });
      }
      const result = await relworx('/mobile-money/request-payment', 'POST', { msisdn, amount: Number(amount), reference, currency: 'UGX', description: String(description || `DAINTY Order ${reference}`).slice(0, 100) });
      return send(res, 200, result);
    }
    if (req.method === 'GET' && url.pathname === '/api/relworx/mobile-money/check-request-status') {
      const internalReference = url.searchParams.get('internal_reference');
      if (!internalReference || !/^[A-Za-z0-9-]+$/.test(internalReference)) return send(res, 400, { error: 'Invalid internal reference.' });
      const query = new URLSearchParams({ internal_reference: internalReference, account_no: ACCOUNT_NO || '' });
      const result = await relworx(`/mobile-money/check-request-status?${query}`);
      if ((result.status || '').toLowerCase() === 'success') result.status = 'successful';
      return send(res, 200, result);
    }
    if (url.pathname === '/api/relworx/mobile-money/validate-mobile-number' && req.method === 'POST') {
      const { msisdn } = await readJson(req);
      if (!/^\+256\d{9}$/.test(msisdn || '')) return send(res, 400, { error: 'Invalid Uganda mobile number.' });
      return send(res, 200, await relworx('/mobile-money/validate-mobile-number', 'POST', { msisdn }));
    }
    return send(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('Payment API error:', error.message);
    return send(res, 502, { error: error.message || 'Payment service error' });
  }
}).listen(PORT, () => console.log(`DAINTY payment API listening on http://localhost:${PORT}`));
