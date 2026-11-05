import { createHmac, timingSafeEqual } from 'node:crypto';

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

function validWebhook(req, data, { webhookKey, webhookUrl }) {
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
  const env = { ...process.env, ...customEnv };
  const API_KEY = env.RELWORX_API_KEY;
  const ACCOUNT_NO = env.RELWORX_ACCOUNT_NO;
  const WEBHOOK_KEY = env.RELWORX_WEBHOOK_KEY;
  const BASE_URL = (env.RELWORX_BASE_URL || 'https://payments.relworx.com/api').replace(/\/$/, '');
  const WEBHOOK_URL = env.RELWORX_WEBHOOK_URL;

  const url = new URL(req.url, 'http://localhost');

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, { ok: true, relworxConfigured: Boolean(API_KEY && ACCOUNT_NO) });
    }

    if (req.method === 'POST' && url.pathname === '/api/relworx/webhook') {
      const data = await readJson(req);
      if (!validWebhook(req, data, { webhookKey: WEBHOOK_KEY, webhookUrl: WEBHOOK_URL })) {
        return send(res, 401, { error: 'Invalid webhook signature or webhook URL configuration.' });
      }
      console.info('Verified Relworx webhook', JSON.stringify({ status: data.status, customer_reference: data.customer_reference, internal_reference: data.internal_reference }));
      return send(res, 200, { received: true });
    }

    if (url.pathname === '/api/relworx/mobile-money/request-payment' && req.method === 'POST') {
      const data = await readJson(req);
      const { msisdn, amount, reference, description } = data;
      if (!/^\+256\d{9}$/.test(msisdn || '') || !Number.isFinite(Number(amount)) || Number(amount) < 500 || Number(amount) > 5_000_000 || !/^[A-Za-z0-9]{8,36}$/.test(reference || '')) {
        return send(res, 400, { error: 'Invalid phone, amount, or payment reference.' });
      }
      const result = await callRelworx('/mobile-money/request-payment', 'POST', {
        msisdn,
        amount: Number(amount),
        reference,
        currency: 'UGX',
        description: String(description || `DAINTY Order ${reference}`).slice(0, 100)
      }, { apiKey: API_KEY, accountNo: ACCOUNT_NO, baseUrl: BASE_URL });
      return send(res, 200, result);
    }

    if (req.method === 'GET' && url.pathname === '/api/relworx/mobile-money/check-request-status') {
      const internalReference = url.searchParams.get('internal_reference');
      if (!internalReference || !/^[A-Za-z0-9-]+$/.test(internalReference)) {
        return send(res, 400, { error: 'Invalid internal reference.' });
      }
      const query = new URLSearchParams({ internal_reference: internalReference, account_no: ACCOUNT_NO || '' });
      const result = await callRelworx(`/mobile-money/check-request-status?${query}`, 'GET', null, { apiKey: API_KEY, accountNo: ACCOUNT_NO, baseUrl: BASE_URL });
      if ((result.status || '').toLowerCase() === 'success') result.status = 'successful';
      return send(res, 200, result);
    }

    if (url.pathname === '/api/relworx/mobile-money/validate-mobile-number' && req.method === 'POST') {
      const { msisdn } = await readJson(req);
      if (!/^\+256\d{9}$/.test(msisdn || '')) return send(res, 400, { error: 'Invalid Uganda mobile number.' });
      const result = await callRelworx('/mobile-money/validate-mobile-number', 'POST', { msisdn }, { apiKey: API_KEY, accountNo: ACCOUNT_NO, baseUrl: BASE_URL });
      return send(res, 200, result);
    }

    return send(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('Payment API error:', error.message);
    return send(res, 502, { error: error.message || 'Payment service error' });
  }
}
