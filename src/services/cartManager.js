/**
 * DAINTY STUDS & CHAINS — Multi-User Isolated Cart & Shopper Service
 * Ensures each customer manages their own separate, private shopping bag/cart.
 * Provides live client-side persistence and backend synchronization.
 */

const STORAGE_ACTIVE_SHOPPER_KEY = 'dainty_active_shopper';
const STORAGE_SAVED_SHOPPERS_KEY  = 'dainty_saved_shoppers';
const LEGACY_CART_KEY             = 'dainty_cart';

function sanitizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '').trim();
}

/**
 * Generate a unique random shopper session ID
 */
function generateShopperId() {
  return 'shopper_' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);
}

/**
 * Get the currently active shopper profile
 * Each visitor/user has their own isolated profile
 */
export function getCurrentShopper() {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_SHOPPER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (err) {
    console.warn('Error reading active shopper:', err);
  }

  // Create default guest shopper for this device/session
  const newShopper = {
    id: generateShopperId(),
    name: 'Guest Client',
    phone: '',
    email: '',
    isGuest: true,
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_ACTIVE_SHOPPER_KEY, JSON.stringify(newShopper));
    addOrUpdateSavedShopper(newShopper);
  } catch {}

  return newShopper;
}

/**
 * List all shopper profiles stored on this device
 */
export function getSavedShoppers() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_SHOPPERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Add or update shopper profile in the saved profiles registry
 */
export function addOrUpdateSavedShopper(shopper) {
  if (!shopper || !shopper.id) return;
  try {
    const list = getSavedShoppers();
    const idx = list.findIndex(s => s.id === shopper.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...shopper, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...shopper, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_SAVED_SHOPPERS_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {}
}

/**
 * Switch the active shopper to an existing profile or created one
 * Loads their separate bag and fires reactive events
 */
export function switchShopper(shopper) {
  if (!shopper || !shopper.id) return;
  try {
    localStorage.setItem(STORAGE_ACTIVE_SHOPPER_KEY, JSON.stringify(shopper));
    addOrUpdateSavedShopper(shopper);
    window.dispatchEvent(new CustomEvent('dainty_shopper_changed', { detail: { shopper } }));
    window.dispatchEvent(new CustomEvent('dainty_cart_changed', { detail: { shopperId: shopper.id } }));
  } catch (err) {
    console.error('Error switching shopper:', err);
  }
}

/**
 * Create a brand-new separate shopping bag for a new shopper/gift order
 */
export function createNewShopper(name = '', phone = '', email = '') {
  const cleanPhone = sanitizePhone(phone);
  const id = cleanPhone
    ? 'shopper_ph_' + cleanPhone.replace(/\+/g, 'p')
    : generateShopperId();

  const newShopper = {
    id,
    name: name.trim() || (cleanPhone ? `Customer (${cleanPhone})` : `Guest #${Math.floor(100 + Math.random() * 900)}`),
    phone: cleanPhone,
    email: email.trim(),
    isGuest: !cleanPhone,
    createdAt: new Date().toISOString()
  };

  switchShopper(newShopper);
  return newShopper;
}

/**
 * Identify / Bind the current cart to a customer's phone number or name
 * If a bag already exists for this phone, seamlessly load it; otherwise attach current bag to this phone
 */
export function identifyShopperByPhone(phone, name = '', email = '') {
  const cleanPhone = sanitizePhone(phone);
  if (!cleanPhone) return getCurrentShopper();

  const targetId = 'shopper_ph_' + cleanPhone.replace(/\+/g, 'p');
  const current = getCurrentShopper();

  // If already active with this phone ID, update details
  if (current.id === targetId) {
    const updated = {
      ...current,
      name: name.trim() || current.name || `Customer (${cleanPhone})`,
      phone: cleanPhone,
      email: email.trim() || current.email,
      isGuest: false
    };
    switchShopper(updated);
    return updated;
  }

  // Check if target shopper already has an existing saved bag
  const existingTargetCart = getUserCart(targetId);
  const currentCart = getUserCart(current.id);

  const updated = {
    id: targetId,
    name: name.trim() || (cleanPhone ? `Client (${cleanPhone})` : current.name),
    phone: cleanPhone,
    email: email.trim() || current.email,
    isGuest: false,
    createdAt: new Date().toISOString()
  };

  // If target cart already had items, keep it; if empty and current had items, migrate current
  if (existingTargetCart.length === 0 && currentCart.length > 0) {
    saveUserCart(targetId, currentCart, updated);
  }

  switchShopper(updated);
  return updated;
}

/**
 * Retrieve the isolated cart for a specific user/shopper ID
 */
export function getUserCart(shopperId) {
  if (!shopperId) {
    const active = getCurrentShopper();
    shopperId = active.id;
  }

  const key = `dainty_cart_${shopperId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  // Check legacy migration fallback if this is the first session
  try {
    const legacyRaw = localStorage.getItem(LEGACY_CART_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        // Save into this shopper's isolated key
        localStorage.setItem(key, JSON.stringify(legacyParsed));
        return legacyParsed;
      }
    }
  } catch {}

  return [];
}

/**
 * Save the isolated cart for a specific user/shopper ID
 * Persists locally and syncs to backend server
 */
export function saveUserCart(shopperId, cart, shopperInfo = null) {
  if (!shopperId) {
    const active = getCurrentShopper();
    shopperId = active.id;
  }

  const key = `dainty_cart_${shopperId}`;
  const cleanCart = Array.isArray(cart) ? cart : [];

  try {
    localStorage.setItem(key, JSON.stringify(cleanCart));
    // Keep legacy in sync with active shopper for backward compatibility
    localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(cleanCart));
  } catch (err) {
    console.warn('Could not save cart to localStorage:', err);
  }

  // Notify listeners across components
  window.dispatchEvent(new CustomEvent('dainty_cart_changed', {
    detail: { shopperId, count: cleanCart.reduce((sum, i) => sum + (i.quantity || 1), 0) }
  }));

  // Sync to server backend asynchronously
  fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: shopperId,
      cart: cleanCart,
      shopper: shopperInfo || getCurrentShopper(),
      updatedAt: new Date().toISOString()
    })
  }).catch(() => {
    // Silent fail if offline or host server is unreachable
  });

  return cleanCart;
}

/**
 * Clear the cart for a specific user/shopper
 */
export function clearUserCart(shopperId) {
  if (!shopperId) {
    const active = getCurrentShopper();
    shopperId = active.id;
  }

  const key = `dainty_cart_${shopperId}`;
  try {
    localStorage.removeItem(key);
    localStorage.setItem(LEGACY_CART_KEY, JSON.stringify([]));
  } catch {}

  window.dispatchEvent(new CustomEvent('dainty_cart_changed', {
    detail: { shopperId, count: 0 }
  }));

  fetch(`/api/cart?userId=${encodeURIComponent(shopperId)}`, {
    method: 'DELETE'
  }).catch(() => {});

  return [];
}

/**
 * Fetch and synchronize the shopper's cart with the backend server
 */
export async function syncUserCartFromServer(shopperId) {
  if (!shopperId) {
    const active = getCurrentShopper();
    shopperId = active.id;
  }

  try {
    const res = await fetch(`/api/cart?userId=${encodeURIComponent(shopperId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.cart)) {
        // If server has cart, save locally
        const key = `dainty_cart_${shopperId}`;
        localStorage.setItem(key, JSON.stringify(data.cart));
        window.dispatchEvent(new CustomEvent('dainty_cart_changed', {
          detail: { shopperId, count: data.cart.reduce((sum, i) => sum + (i.quantity || 1), 0) }
        }));
        return data.cart;
      }
    }
  } catch {}
  return getUserCart(shopperId);
}
