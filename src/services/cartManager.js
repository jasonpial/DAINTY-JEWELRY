/**
 * DAINTY STUDS & CHAINS — Multi-User Isolated Cart & Shopper Service
 * Ensures each customer manages their own separate, private shopping bag/cart.
 * Provides live client-side persistence and backend synchronization.
 */

const STORAGE_ACTIVE_SHOPPER_KEY = 'dainty_active_shopper';
const STORAGE_SAVED_SHOPPERS_KEY  = 'dainty_saved_shoppers';
const LEGACY_CART_KEY             = 'dainty_cart';

// Track local mutations & in-flight writes per shopper so stale GET /api/cart responses never wipe local items
const localCartVersions = new Map();
const pendingCartWrites = new Map();

function bumpLocalCartVersion(shopperId) {
  const next = (localCartVersions.get(shopperId) || 0) + 1;
  localCartVersions.set(shopperId, next);
  return next;
}

function getLocalCartVersion(shopperId) {
  return localCartVersions.get(shopperId) || 0;
}

function incrementPendingWrite(shopperId) {
  pendingCartWrites.set(shopperId, (pendingCartWrites.get(shopperId) || 0) + 1);
}

function decrementPendingWrite(shopperId) {
  const current = pendingCartWrites.get(shopperId) || 0;
  if (current <= 1) {
    pendingCartWrites.delete(shopperId);
  } else {
    pendingCartWrites.set(shopperId, current - 1);
  }
}

function sanitizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '').trim();
}

function readStoredCartOnly(shopperId) {
  if (!shopperId) return null;
  const key = `dainty_cart_${shopperId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return null;
}

function mergeCartItems(primaryCart = [], secondaryCart = []) {
  const merged = [];
  const indexMap = new Map();

  const addItem = (item) => {
    if (!item || !item.id) return;
    const color = item.selectedColor || item.color || 'Gold';
    const sig = `${item.id}::${color}`;
    if (indexMap.has(sig)) {
      const idx = indexMap.get(sig);
      const existing = merged[idx];
      merged[idx] = {
        ...existing,
        quantity: Math.max(Number(existing.quantity) || 1, Number(item.quantity) || 1)
      };
    } else {
      indexMap.set(sig, merged.length);
      merged.push({
        ...item,
        selectedColor: color,
        quantity: Number(item.quantity) || 1
      });
    }
  };

  primaryCart.forEach(addItem);
  secondaryCart.forEach(addItem);
  return merged;
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
 * Switch or create isolated shopper session tied specifically to a user ID.
 */
export function switchShopperByUserId(userId, name = '', email = '', phone = '') {
  if (!userId) return getCurrentShopper();
  const cleanId = 'shopper_uid_' + String(userId).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const current = getCurrentShopper();

  if (current.id === cleanId) {
    const updated = {
      ...current,
      name: name.trim() || current.name || 'Dainty Patron',
      email: cleanEmail || current.email,
      phone: phone || current.phone,
      isGuest: false
    };
    localStorage.setItem(STORAGE_ACTIVE_SHOPPER_KEY, JSON.stringify(updated));
    addOrUpdateSavedShopper(updated);
    return updated;
  }

  const shopperProfile = {
    id: cleanId,
    name: name.trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Dainty Patron'),
    email: cleanEmail,
    phone: phone || '',
    isGuest: false,
    createdAt: new Date().toISOString()
  };

  switchShopper(shopperProfile);
  return shopperProfile;
}

/**
 * Identify / Bind the current cart to a customer's phone number or name.
 * Always preserves and merges any items currently in the active bag so checkout never loses items.
 */
export function identifyShopperByPhone(phone, name = '', email = '') {
  const cleanPhone = sanitizePhone(phone);
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  if (!cleanPhone || digitsOnly.length < 9) return getCurrentShopper();

  const targetId = 'shopper_ph_' + cleanPhone.replace(/\+/g, 'p');
  const current = getCurrentShopper();

  // If already active with this phone ID, update details without disturbing the bag
  if (current.id === targetId) {
    const updated = {
      ...current,
      name: name.trim() || current.name || `Customer (${cleanPhone})`,
      phone: cleanPhone,
      email: email.trim() || current.email,
      isGuest: false
    };
    localStorage.setItem(STORAGE_ACTIVE_SHOPPER_KEY, JSON.stringify(updated));
    addOrUpdateSavedShopper(updated);
    return updated;
  }

  // Read both carts cleanly (without triggering legacy fallback on targetId)
  const existingTargetCart = readStoredCartOnly(targetId) || [];
  const currentCart = getUserCart(current.id);

  const updated = {
    id: targetId,
    name: name.trim() || (cleanPhone ? `Client (${cleanPhone})` : current.name),
    phone: cleanPhone,
    email: email.trim() || current.email,
    isGuest: false,
    createdAt: new Date().toISOString()
  };

  // Merge active bag items with any saved items for targetId so nothing added before checkout is lost
  const mergedCart = currentCart.length > 0
    ? mergeCartItems(currentCart, existingTargetCart)
    : existingTargetCart;

  saveUserCart(targetId, mergedCart, updated);
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
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  // Check legacy migration fallback only when the shopper key has never been initialized
  try {
    const legacyRaw = localStorage.getItem(LEGACY_CART_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
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

  bumpLocalCartVersion(shopperId);

  try {
    localStorage.setItem(key, JSON.stringify(cleanCart));
    // Keep legacy in sync with active shopper for backward compatibility
    localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(cleanCart));
  } catch (err) {
    console.warn('Could not save cart to localStorage:', err);
  }

  // Notify listeners across components
  window.dispatchEvent(new CustomEvent('dainty_cart_changed', {
    detail: { shopperId, cart: cleanCart, count: cleanCart.reduce((sum, i) => sum + (i.quantity || 1), 0) }
  }));

  // Sync to server backend asynchronously while guarding against stale GET overwrites
  incrementPendingWrite(shopperId);
  fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: shopperId,
      cart: cleanCart,
      shopper: shopperInfo || getCurrentShopper(),
      updatedAt: new Date().toISOString()
    })
  })
    .catch(() => {
      // Silent fail if offline or host server is unreachable
    })
    .finally(() => {
      decrementPendingWrite(shopperId);
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
  bumpLocalCartVersion(shopperId);

  try {
    localStorage.setItem(key, JSON.stringify([]));
    localStorage.setItem(LEGACY_CART_KEY, JSON.stringify([]));
  } catch {}

  window.dispatchEvent(new CustomEvent('dainty_cart_changed', {
    detail: { shopperId, cart: [], count: 0 }
  }));

  incrementPendingWrite(shopperId);
  fetch(`/api/cart?userId=${encodeURIComponent(shopperId)}`, {
    method: 'DELETE'
  })
    .catch(() => {})
    .finally(() => {
      decrementPendingWrite(shopperId);
    });

  return [];
}

/**
 * Fetch and synchronize the shopper's cart with the backend server.
 * Never overwrites non-empty local bag items with an empty or stale server response.
 */
export async function syncUserCartFromServer(shopperId) {
  if (!shopperId) {
    const active = getCurrentShopper();
    shopperId = active.id;
  }

  const startVersion = getLocalCartVersion(shopperId);
  const localCartBefore = getUserCart(shopperId);

  if ((pendingCartWrites.get(shopperId) || 0) > 0) {
    return localCartBefore;
  }

  try {
    const res = await fetch(`/api/cart?userId=${encodeURIComponent(shopperId)}`);
    if (!res.ok) {
      return getUserCart(shopperId);
    }

    const data = await res.json();

    // If a local cart write occurred while the request was in flight, local state wins
    if (getLocalCartVersion(shopperId) !== startVersion || (pendingCartWrites.get(shopperId) || 0) > 0) {
      return getUserCart(shopperId);
    }

    const serverCart = data && Array.isArray(data.cart) ? data.cart : [];
    const localCartNow = getUserCart(shopperId);

    // If server has items, synchronize across devices
    if (serverCart.length > 0) {
      if (JSON.stringify(serverCart) !== JSON.stringify(localCartNow)) {
        const key = `dainty_cart_${shopperId}`;
        localStorage.setItem(key, JSON.stringify(serverCart));
        localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(serverCart));
        window.dispatchEvent(new CustomEvent('dainty_cart_changed', {
          detail: { shopperId, cart: serverCart, count: serverCart.reduce((sum, i) => sum + (i.quantity || 1), 0) }
        }));
      }
      return serverCart;
    }

    if (localCartNow.length > 0) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: shopperId, cart: localCartNow, shopper: getCurrentShopper(), updatedAt: new Date().toISOString() })
      }).catch(() => {});
    }

    return localCartNow;
  } catch {}

  return getUserCart(shopperId);
}
