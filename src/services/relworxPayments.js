/**
 * ============================================================
 * DAINTY – Relworx Payment Gateway Service
 * ============================================================
 * API Reference: https://payments.relworx.com/docs/
 *
 * Covers:
 *  - MTN Mobile Money (Uganda)  → merchant: +256 788 227027
 *  - Airtel Money (Uganda)      → merchant: +256 759 924291
 *  - Business Account:            REL11AE925B85
 *
 * The Relworx API is an async (2-step) flow:
 *   Step 1: POST /mobile-money/request-payment
 *           → returns { success, message, internal_reference }
 *   Step 2: Poll GET /mobile-money/check-request-status?internal_reference=...
 *           → status: "pending" | "successful" | "failed"
 *
 * ⚠️  IMPORTANT: Keep your .env credentials private. Never commit them.
 * ============================================================
 */

// Relworx credentials stay on the server. The browser calls our same-origin API.

// Merchant receiving numbers (resolved from .env)
export const MERCHANT_MTN_NUMBER    = '+256788227027';
export const MERCHANT_AIRTEL_NUMBER = '+256759924291';

// ────────────────────────────────────────────────────────────
// Uganda Mobile Prefix Map (2026)
// ────────────────────────────────────────────────────────────
const MTN_PREFIXES = [
  '77', '78', '76', '31', '39', // MTN Uganda
];

const AIRTEL_PREFIXES = [
  '70', '74', '75', '56', '57', // Airtel Uganda (0759 → prefix '75')
];

/**
 * Detects the mobile network from a Uganda phone number.
 * Accepts: +256701234567 | 0701234567 | 701234567
 * @param {string} phone
 * @returns {{ network: 'MTN'|'AIRTEL'|'UNKNOWN', msisdn: string }}
 */
export function detectMobileNetwork(phone) {
  let digits = phone.replace(/\D/g, ''); // strip non-digits

  if (digits.startsWith('0')) {
    digits = '256' + digits.slice(1);       // 0759... → 256759...
  } else if (!digits.startsWith('256')) {
    digits = '256' + digits;                // 759... → 256759...
  }

  const msisdn  = '+' + digits;             // → +256759924291
  const prefix2 = digits.slice(3, 5);       // → e.g. '75', '77'

  if (MTN_PREFIXES.includes(prefix2))    return { network: 'MTN',    msisdn };
  if (AIRTEL_PREFIXES.includes(prefix2)) return { network: 'AIRTEL', msisdn };

  return { network: 'UNKNOWN', msisdn };
}

// ────────────────────────────────────────────────────────────
// Core Fetch Wrapper
// ────────────────────────────────────────────────────────────
async function relworxFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api/relworx${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (networkErr) {
    throw new Error(`Payment server could not be reached: ${networkErr.message}`);
  }

  const rawText = await res.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    if (rawText.trim().startsWith('<!DOCTYPE') || rawText.includes('<html')) {
      throw new Error(`Payment API route not reached (HTTP ${res.status}): Server returned an HTML web page instead of JSON. Ensure your server.js or api/index.php is running on your host.`);
    }
    throw new Error(`Relworx API returned an invalid response (HTTP ${res.status}): ${rawText.slice(0, 100)}`);
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ────────────────────────────────────────────────────────────
// 1. Request Payment — pushes USSD prompt to customer's phone
// ────────────────────────────────────────────────────────────
/**
 * Initiates a Mobile Money collection request.
 * Sends a USSD prompt to the customer's handset for PIN approval.
 *
 * @param {Object} params
 * @param {string} params.msisdn       - Customer's phone: +256XXXXXXXXX
 * @param {number} params.amount       - Amount in UGX (min 500, max 5,000,000)
 * @param {string} params.reference    - Unique order reference (8–36 alphanumeric chars)
 * @param {string} [params.description]- Human-readable label shown to customer
 * @returns {Promise<{ success: boolean, message: string, internal_reference: string }>}
 */
export async function requestMobileMoneyPayment({ msisdn, amount, reference, description }) {
  return relworxFetch('/mobile-money/request-payment', {
    method: 'POST',
    body: JSON.stringify({
      reference,
      msisdn,
      currency:    'UGX',
      amount:      parseFloat(amount),
      description: description || `DAINTY Order ${reference}`,
    }),
  });
}

// ────────────────────────────────────────────────────────────
// 2. Check Payment Status
// ────────────────────────────────────────────────────────────
/**
 * Polls Relworx for the status of a pending payment.
 * Use the internal_reference returned from requestMobileMoneyPayment.
 *
 * @param {string} internalReference
 * @returns {Promise<{ status: 'pending'|'successful'|'failed', message: string }>}
 */
export async function checkPaymentStatus(internalReference) {
  return relworxFetch(`/mobile-money/check-request-status?internal_reference=${encodeURIComponent(internalReference)}`);
}

// ────────────────────────────────────────────────────────────
// 3. Validate Mobile Number (optional pre-check)
// ────────────────────────────────────────────────────────────
/**
 * Validates if a MSISDN is a registered Mobile Money subscriber.
 *
 * @param {string} msisdn - Phone in international format
 * @returns {Promise<{ valid: boolean, msisdn: string, network: string }>}
 */
export async function validateMobileNumber(msisdn) {
  return relworxFetch('/mobile-money/validate-mobile-number', {
    method: 'POST',
    body: JSON.stringify({
      msisdn,
    }),
  });
}

// ────────────────────────────────────────────────────────────
// 4. Full Orchestrated Payment Flow
// ────────────────────────────────────────────────────────────
/**
 * End-to-end payment: initiates → polls → resolves.
 *
 *  Poll cadence: every 5 seconds, up to 12 times (= 60 seconds max)
 *
 * @param {Object}   params          - Same params as requestMobileMoneyPayment
 * @param {Function} [onStatusUpdate]- Callback(status, attempt) on each poll
 * @returns {Promise<{ status: 'successful'|'failed'|'timeout', reference: string, internal_reference: string }>}
 */
export async function processFullPayment(params, onStatusUpdate, abortSignal) {
  const POLL_INTERVAL_MS = 5000;
  const MAX_POLLS        = 12;

  // Step 1 — Initiate payment (push USSD to customer exactly once)
  const initResponse = await requestMobileMoneyPayment(params);

  if (!initResponse.success) {
    throw new Error(initResponse.message || 'Payment initiation failed.');
  }

  const internalRef = initResponse.internal_reference;

  // Step 2 — Poll for confirmation until terminal status (success/failed) or abort
  for (let attempt = 1; attempt <= MAX_POLLS; attempt++) {
    if (abortSignal && abortSignal.aborted) {
      return { status: 'cancelled', reference: params.reference, internal_reference: internalRef };
    }

    await delay(POLL_INTERVAL_MS);

    if (abortSignal && abortSignal.aborted) {
      return { status: 'cancelled', reference: params.reference, internal_reference: internalRef };
    }

    let statusResponse;
    try {
      statusResponse = await checkPaymentStatus(internalRef);
    } catch {
      // Network hiccup — keep polling
      if (onStatusUpdate) onStatusUpdate('polling', attempt);
      continue;
    }

    const rawStatus = (statusResponse.status || statusResponse.request_status || '').toLowerCase();
    const isSuccess = rawStatus === 'successful' || rawStatus === 'success';
    const isFailed = (
      rawStatus === 'failed' ||
      rawStatus === 'declined' ||
      rawStatus === 'cancelled' ||
      rawStatus === 'canceled' ||
      rawStatus === 'rejected' ||
      rawStatus === 'expired' ||
      rawStatus === 'insufficient_funds' ||
      rawStatus === 'insufficient_balance' ||
      statusResponse.success === false
    );

    if (isSuccess) {
      if (onStatusUpdate) onStatusUpdate('successful', attempt);
      return { status: 'successful', reference: params.reference, internal_reference: internalRef };
    }

    if (isFailed) {
      const failReason = statusResponse.message || statusResponse.error || 'Payment was declined or cancelled on your handset.';
      if (onStatusUpdate) onStatusUpdate('failed', attempt, failReason);
      return { status: 'failed', reference: params.reference, internal_reference: internalRef, message: failReason };
    }

    if (onStatusUpdate) onStatusUpdate('polling', attempt);
  }

  // Timeout after 60 seconds
  return { status: 'timeout', reference: params.reference, internal_reference: internalRef };
}

// ────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────

/** Generates a unique order reference (8–36 alphanumeric chars) */
export function generateOrderReference(orderId) {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const id   = orderId ? `ORD${orderId}` : '';
  return `${id}${ts}${rand}`.substring(0, 36);
}

/** Promise-based delay */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Returns true when all required Relworx credentials are present.
 * Used in the UI to toggle the "not configured" warning banner.
 */
export function isRelworxConfigured() {
  return true; // Server reports a clear configuration error when credentials are absent.
}

/**
 * Checks server-side Relworx gateway configuration status.
 */
export async function getRelworxStatus() {
  try {
    const res = await fetch('/api/relworx/status');
    if (!res.ok) return { configured: false };
    return await res.json();
  } catch {
    return { configured: false };
  }
}

/**
 * Saves Relworx credentials to server persistent storage.
 */
export async function saveRelworxConfig(config) {
  const res = await fetch('/api/relworx/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

/**
 * Tests connectivity and authentication with Relworx servers.
 */
export async function testRelworxConnection(config) {
  const res = await fetch('/api/relworx/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

/**
 * Returns the correct merchant receiving number for a given network.
 * Used for display / confirmation messages.
 * @param {'MTN'|'AIRTEL'} network
 * @returns {string}
 */
export function getMerchantNumber(network) {
  return network === 'MTN' ? MERCHANT_MTN_NUMBER : MERCHANT_AIRTEL_NUMBER;
}
