// Categories structure (Earrings only)
export const categories = [
  { id: 'earrings', name: 'Earrings', icon: '✨' }
];

// Subcategories mapping (Earrings only)
export const subcategories = [
  // Earrings
  { id: 'stud_ear', categoryId: 'earrings', name: 'Stud Earrings' },
  { id: 'hoop_ear', categoryId: 'earrings', name: 'Hoop Earrings' },
  { id: 'drop_ear', categoryId: 'earrings', name: 'Drop Earrings' },
  { id: 'dang_ear', categoryId: 'earrings', name: 'Dangle Earrings' },
  { id: 'hugg_ear', categoryId: 'earrings', name: 'Huggie Earrings' },
  { id: 'cuff_ear', categoryId: 'earrings', name: 'Ear Cuffs' },
  { id: 'stat_ear', categoryId: 'earrings', name: 'Statement Earrings' },
  { id: 'pearl_ear', categoryId: 'earrings', name: 'Pearl Earrings' }
];

// Piercing Location Categorization (Shop by Piercing)
export const piercingLocations = [
  'Ear Lobe',
  'Helix/Cartilage',
  'Flat',
  'Conch',
  'Tragus',
  'Rook',
  'Daith',
  'Industrials',
  'Nostril',
  'Septum',
  'Body Jewelry'
];

// Seed Products
const defaultProducts = [
  {
    id: "prod_dainty_1",
    name: "18K Gold Draped Chain Studs",
    category_id: "earrings",
    subcategory_id: "dang_ear",
    price: 145000,
    sale_price: null,
    description: "Handcrafted 18K gold-plated sterling silver stud connected to a delicate draped chain for effortless cascading elegance.",
    images: ["/images/iv.jpeg", "/images/v.jpeg", "/images/vi.jpeg"],
    stock_quantity: 45,
    best_seller: true,
    new_arrival: true,
    gender: "Women",
    occasion: "Everyday",
    created_at: "2026-11-01T00:00:00.000Z"
  },
  {
    id: "prod_dainty_2",
    name: "Diamond-Pavé Huggie Clickers",
    category_id: "earrings",
    subcategory_id: "hugg_ear",
    price: 180000,
    sale_price: 159000,
    description: "Seamless hinged huggie hoops encrusted with micro-pavé cubic zirconia stones for brilliant sparkle from every angle.",
    images: ["/images/iii.jpeg", "/images/ii.jpeg", "/images/i.jpeg"],
    stock_quantity: 30,
    best_seller: true,
    new_arrival: false,
    gender: "Women",
    occasion: "Wedding",
    created_at: "2026-11-02T00:00:00.000Z"
  },
  {
    id: "prod_dainty_3",
    name: "Titanium Flat-Back Sleep-In Stud",
    category_id: "earrings",
    subcategory_id: "stud_ear",
    price: 95000,
    sale_price: null,
    description: "Implant-grade titanium flat-back labret designed for 24/7 comfortable wear, fresh piercings, and sensitive skin.",
    images: ["/images/vi.jpeg", "/images/0.jpeg"],
    stock_quantity: 60,
    best_seller: true,
    new_arrival: true,
    gender: "Unisex",
    occasion: "Everyday",
    created_at: "2026-11-03T00:00:00.000Z"
  },
  {
    id: "prod_dainty_4",
    name: "Marquise Cluster Cartilage Earring",
    category_id: "earrings",
    subcategory_id: "stat_ear",
    price: 165000,
    sale_price: null,
    description: "Stunning marquise and round stone cluster designed specifically for helix, conch, and flat cartilage piercings.",
    images: ["/images/vii.jpeg", "/images/viii.jpeg"],
    stock_quantity: 25,
    best_seller: false,
    new_arrival: true,
    gender: "Women",
    occasion: "Party",
    created_at: "2026-11-04T00:00:00.000Z"
  },
  {
    id: "prod_dainty_5",
    name: "Minimalist Gold Hoop Earrings",
    category_id: "earrings",
    subcategory_id: "hoop_ear",
    price: 120000,
    sale_price: null,
    description: "Classic lightweight polished gold hoops offering timeless elegance for daily stacking and professional wear.",
    images: ["/images/i.jpeg", "/images/ii.jpeg"],
    stock_quantity: 50,
    best_seller: true,
    new_arrival: false,
    gender: "Women",
    occasion: "Everyday",
    created_at: "2026-11-05T00:00:00.000Z"
  },
  {
    id: "prod_dainty_6",
    name: "Double Chain Drop Piercing Ring",
    category_id: "earrings",
    subcategory_id: "dang_ear",
    price: 155000,
    sale_price: null,
    description: "Bold dual-chain drop connecting two piercing locations with fluid motion and high-polished shine.",
    images: ["/images/iv.jpeg", "/images/v.jpeg"],
    stock_quantity: 20,
    best_seller: false,
    new_arrival: true,
    gender: "Women",
    occasion: "Anniversary",
    created_at: "2026-11-06T00:00:00.000Z"
  }
];

// Helper functions
const STORAGE_PREFIX = 'dainty_ecommerce_';

// Client-side image compression utility
// Resizes and compresses uploaded images to compact WebP/JPEG data URLs
// preventing localStorage quota blowout and network bloat
export async function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve('/images/vi.jpeg');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const compressed = canvas.toDataURL('image/webp', quality);
            resolve(compressed);
            return;
          } catch {
            const compressedJpg = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedJpg);
            return;
          }
        }
        resolve(e.target.result);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('/images/vi.jpeg');
    reader.readAsDataURL(file);
  });
}

function getStorageItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('LocalStorage read error:', error);
    return defaultValue;
  }
}

function setStorageItem(key, value, silent = false) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    if (!silent) {
      // Trigger storage event manually for same-page listeners
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dainty_products_changed', { detail: { key, count: value?.length } }));
    }
  } catch (error) {
    console.error('LocalStorage write error:', error);
  }
}

// Blacklist tracking for permanently deleted products
export function getDeletedProductIds() {
  const list = getStorageItem('deleted_product_ids', []);
  return new Set(Array.isArray(list) ? list : []);
}

export function addDeletedProductId(productId) {
  if (!productId) return;
  const list = getStorageItem('deleted_product_ids', []);
  const safeList = Array.isArray(list) ? list : [];
  if (!safeList.includes(productId)) {
    setStorageItem('deleted_product_ids', [...safeList, productId]);
  }
}

export function removeDeletedProductId(productId) {
  if (!productId) return;
  const list = getStorageItem('deleted_product_ids', []);
  const safeList = Array.isArray(list) ? list : [];
  if (safeList.includes(productId)) {
    setStorageItem('deleted_product_ids', safeList.filter(id => id !== productId));
  }
}

// Background sync with /api/products database
let isServerSyncStarted = false;
let lastSyncHash = '';

const NON_EARRING_SEED_IDS = new Set([
  'prod_1', 'prod_2', 'prod_4', 'prod_5', 'prod_6', 'prod_7', 'prod_8', 'prod_10'
]);

const VALID_EARRING_SUBCATS = new Set([
  'stud_ear', 'hoop_ear', 'drop_ear', 'dang_ear', 'hugg_ear', 'cuff_ear', 'stat_ear', 'pearl_ear'
]);

function filterEarringsOnly(list, deletedSet = new Set()) {
  if (!Array.isArray(list)) return [];
  return list
    .filter(p => {
      if (!p || !p.id || deletedSet.has(p.id)) return false;
      if (NON_EARRING_SEED_IDS.has(p.id)) return false;
      // If product came from legacy non-earring category (other than prod_14 curated earring suite), exclude it
      const cat = String(p.category_id || p.category || 'earrings').toLowerCase();
      if (cat !== 'earrings' && p.id !== 'prod_14') return false;
      return true;
    })
    .map(p => ({
      ...p,
      id: String(p.id),
      category_id: 'earrings',
      subcategory_id: VALID_EARRING_SUBCATS.has(p.subcategory_id) ? p.subcategory_id : 'stud_ear'
    }));
}

export async function syncProductsWithServer() {
  try {
    const res = await fetch('/api/products?sync=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) {
      console.warn('Server database sync responded with status:', res.status);
      return;
    }

    const serverProducts = await res.json();
    if (Array.isArray(serverProducts)) {
      const deletedSet = getDeletedProductIds();
      
      // Filter out any locally deleted or non-earring products
      const cleanServer = filterEarringsOnly(serverProducts, deletedSet);
      
      // Keep only newly drafted local items that are waiting for initial sync
      const combined = cleanServer;

      // Compare with previous state to avoid redundant renders
      const currentJson = JSON.stringify(combined);
      if (currentJson !== lastSyncHash) {
        lastSyncHash = currentJson;
        setStorageItem('products', combined);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('dainty_products_changed', { 
          detail: { action: 'sync', count: combined.length } 
        }));
      }
    }
  } catch (err) {
    console.warn('Server database sync idle:', err.message);
  }
}

export async function syncOrdersWithServer() {
  try { const res = await fetch('/api/orders'); if (!res.ok) return; const orders = await res.json(); if (Array.isArray(orders)) { setStorageItem('orders', orders, true); window.dispatchEvent(new CustomEvent('dainty_orders_changed', { detail: { count: orders.length } })); } } catch {}
}

export async function syncMessagesWithServer() {
  try { const res = await fetch('/api/messages'); if (!res.ok) return; const messages = await res.json(); if (Array.isArray(messages)) { setStorageItem('messages', messages, true); window.dispatchEvent(new CustomEvent('dainty_messages_changed', { detail: { count: messages.length } })); } } catch {}
}

export async function migrateLocalOrdersToHostinger() {
  if (typeof window === 'undefined') return { migrated: 0, skipped: true };
  try {
    const markerKey = STORAGE_PREFIX + 'orders_migrated_to_hostinger';
    if (localStorage.getItem(markerKey) === '1') return { migrated: 0, alreadyDone: true };
    const localOrders = getStorageItem('orders', []);
    if (!Array.isArray(localOrders) || localOrders.length === 0) { localStorage.setItem(markerKey, '1'); return { migrated: 0, empty: true }; }
    let migrated = 0;
    for (const order of localOrders) {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
      if (!response.ok) throw new Error('Order migration stopped');
      migrated += 1;
    }
    localStorage.setItem(markerKey, '1');
    return { migrated };
  } catch (error) { console.warn('Order migration pending:', error.message); return { migrated: 0, failed: true }; }
}



// Initialization
export function initDB() {
  const deletedSet = getDeletedProductIds();
  const existingProds = getStorageItem('products', null);
  if (!Array.isArray(existingProds)) {
    const initialList = filterEarringsOnly(defaultProducts, deletedSet);
    setStorageItem('products', initialList, true);
  } else {
    const cleanedExisting = filterEarringsOnly(existingProds, deletedSet);
    if (cleanedExisting.length !== existingProds.length || JSON.stringify(cleanedExisting) !== JSON.stringify(existingProds)) {
      setStorageItem('products', cleanedExisting, true);
    }
  }
  try {
    if (!localStorage.getItem(STORAGE_PREFIX + 'orders')) {
      setStorageItem('orders', [], true);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'messages')) {
      setStorageItem('messages', [], true);
    }
  } catch {}

  // Trigger background server sync once on load and on tab focus
  if (!isServerSyncStarted && typeof window !== 'undefined') {
    isServerSyncStarted = true;
    migrateLocalOrdersToHostinger();
    syncProductsWithServer();
    syncOrdersWithServer();
    syncMessagesWithServer();

    // Re-sync when switching back to this tab/window
    window.addEventListener('focus', () => syncProductsWithServer());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) syncProductsWithServer();
    });

    // Background poll every 15 seconds to sync deletions/additions from other devices
    setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        syncProductsWithServer();
      }
    }, 15000);
  }
}

// Products API
export function getProducts() {
  initDB();
  const deletedSet = getDeletedProductIds();
  const prods = getStorageItem('products', null);
  const base = Array.isArray(prods) ? prods : defaultProducts;
  return filterEarringsOnly(base, deletedSet);
}

export async function saveProduct(product) {
  const cleanProduct = { ...product };

  // If this product ID was previously in deleted blacklist, clear it
  if (cleanProduct.id) {
    removeDeletedProductId(cleanProduct.id);
  } else {
    cleanProduct.id = 'prod_' + Math.random().toString(36).substr(2, 9);
    cleanProduct.created_at = new Date().toISOString();
  }

  // Ensure default metadata & enforce Earrings as the sole category
  if (!cleanProduct.gender) cleanProduct.gender = 'Women';
  if (!cleanProduct.occasion) cleanProduct.occasion = 'Everyday';
  cleanProduct.category_id = 'earrings';
  if (!VALID_EARRING_SUBCATS.has(cleanProduct.subcategory_id)) {
    cleanProduct.subcategory_id = 'stud_ear';
  }
  if (cleanProduct.new_arrival === undefined) cleanProduct.new_arrival = true;
  if (!cleanProduct.created_at) cleanProduct.created_at = new Date().toISOString();

  // Normalize images
  if (!Array.isArray(cleanProduct.images) || cleanProduct.images.length === 0) {
    cleanProduct.images = [cleanProduct.image || '/images/vi.jpeg'];
  }

  cleanProduct._pendingSync = true;

  const products = [...getProducts()];
  const idx = products.findIndex(p => p.id === cleanProduct.id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...cleanProduct };
  } else {
    products.unshift(cleanProduct); // Prepend to top so it's immediately visible
  }

  // Persist locally
  setStorageItem('products', products);
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dainty_products_changed', { detail: { action: 'save', id: cleanProduct.id } }));

  // Persist to server database asynchronously
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanProduct)
    });
    if (res.ok) {
      cleanProduct._pendingSync = false;
      const current = getStorageItem('products', []);
      const cIdx = current.findIndex(p => p.id === cleanProduct.id);
      if (cIdx !== -1) {
        current[cIdx]._pendingSync = false;
        setStorageItem('products', current);
      }
      await syncProductsWithServer();
    }
  } catch (err) {
    console.warn('Failed to persist product to server database:', err);
  }

  return cleanProduct;
}

export async function deleteProduct(productId) {
  if (!productId) return;

  // 1. Permanently register in deleted blacklist so it NEVER resurrects
  addDeletedProductId(productId);

  // 2. Immediately remove from local products array
  const currentProds = getStorageItem('products', defaultProducts);
  const safeCurrent = Array.isArray(currentProds) ? currentProds : defaultProducts;
  const filtered = safeCurrent.filter(p => p && p.id !== productId);
  setStorageItem('products', filtered);

  // 3. Immediately emit change events across components and tabs
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dainty_products_changed', { detail: { action: 'delete', id: productId } }));

  // 4. Persist deletion to server database and trigger re-sync
  try {
    const res = await fetch(`/api/products/${productId}?sync=${Date.now()}`, {
      method: 'DELETE',
      cache: 'no-store'
    });
    if (res.ok) {
      await syncProductsWithServer();
    }
  } catch (err) {
    console.warn('Failed to delete product from server database:', err);
  }
}

export function updateProductPrice(productId, newPrice, newSalePrice = null) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx].price = Number(newPrice);
    products[idx].sale_price = newSalePrice ? Number(newSalePrice) : null;
    setStorageItem('products', products);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products[idx])
    }).catch(() => {});
    return products[idx];
  }
  return null;
}

// Orders API
export function getOrders() {
  initDB();
  return getStorageItem('orders', []);
}

export function saveOrder(orderData) {
  const orders = getOrders();
  const newOrder = {
    id: 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    customer_name: orderData.name,
    customer_email: orderData.email,
    customer_phone: orderData.phone,
    delivery_address: orderData.address,
    notes: orderData.notes || '',
    items: orderData.items, // Array of { product_id, name, quantity, color, price }
    total_amount: orderData.total_amount,
    status: 'Pending',
    created_at: new Date().toISOString()
  };
  orders.push(newOrder);
  setStorageItem('orders', orders);

  // Reduce product stock
  const products = getProducts();
  newOrder.items.forEach(item => {
    const pIdx = products.findIndex(p => p.id === item.product_id);
    if (pIdx !== -1) {
      products[pIdx].stock_quantity = Math.max(0, products[pIdx].stock_quantity - item.quantity);
    }
  });
  setStorageItem('products', products);
  fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) }).catch(() => {});

  return newOrder;
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    setStorageItem('orders', orders);
    fetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).catch(() => {});
    return orders[idx];
  }
  return null;
}

// Messages API (Live chat)
export function getMessages() {
  initDB();
  return getStorageItem('messages', []);
}

export function saveMessage(chatId, sender, content) {
  const messages = getMessages();
  const newMessage = {
    id: 'msg_' + Math.random().toString(36).substr(2, 9),
    chatId,
    sender, // 'customer' or 'admin'
    content,
    timestamp: new Date().toISOString()
  };
  messages.push(newMessage);
  setStorageItem('messages', messages);
  fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMessage) }).catch(() => {});
  return newMessage;
}

export function getChats() {
  const messages = getMessages();
  const chats = {};
  messages.forEach(msg => {
    if (!chats[msg.chatId]) {
      chats[msg.chatId] = {
        chatId: msg.chatId,
        lastMessage: msg,
        messages: []
      };
    }
    chats[msg.chatId].messages.push(msg);
    if (new Date(msg.timestamp) > new Date(chats[msg.chatId].lastMessage.timestamp)) {
      chats[msg.chatId].lastMessage = msg;
    }
  });
  return Object.values(chats).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
}

// Reset Database Utility
export function resetDatabase() {
  localStorage.removeItem(STORAGE_PREFIX + 'products');
  localStorage.removeItem(STORAGE_PREFIX + 'deleted_product_ids');
  localStorage.removeItem(STORAGE_PREFIX + 'orders');
  localStorage.removeItem(STORAGE_PREFIX + 'messages');
  setStorageItem('products', defaultProducts);
  fetch('/api/products/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaultProducts)
  }).catch(() => {});
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('dainty_products_changed', { detail: { action: 'reset' } }));
}

// Admin Authentication & Credentials API
const ADMIN_USER_KEY = 'dainty_admin_username';
const ADMIN_PASS_KEY = 'dainty_admin_password';

export function getAdminCredentials() {
  const username = localStorage.getItem(ADMIN_USER_KEY) || 'admin';
  const password = localStorage.getItem(ADMIN_PASS_KEY) || 'admin123';
  return { username, password };
}

export function updateAdminCredentials(newUsername, newPassword) {
  if (newUsername && newUsername.trim()) {
    localStorage.setItem(ADMIN_USER_KEY, newUsername.trim());
  }
  if (newPassword && newPassword.trim()) {
    localStorage.setItem(ADMIN_PASS_KEY, newPassword.trim());
  }
  return {
    username: localStorage.getItem(ADMIN_USER_KEY) || 'admin',
    password: localStorage.getItem(ADMIN_PASS_KEY) || 'admin123'
  };
}
