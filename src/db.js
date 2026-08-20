// Categories structure
export const categories = [
  { id: 'rings', name: 'Rings', icon: '💍' },
  { id: 'necklaces', name: 'Necklaces', icon: '📿' },
  { id: 'earrings', name: 'Earrings', icon: '✨' },
  { id: 'bracelets', name: 'Bracelets', icon: '⛓️' },
  { id: 'anklets', name: 'Anklets', icon: '💎' },
  { id: 'watches', name: 'Watches', icon: '⌚' },
  { id: 'sets', name: 'Jewelry Sets', icon: '🧿' },
  { id: 'body', name: 'Body Jewelry', icon: '👑' },
  { id: 'accessories', name: 'Accessories & Gifts', icon: '🎁' }
];

// Subcategories mapping
export const subcategories = [
  // Rings
  { id: 'eng_rings', categoryId: 'rings', name: 'Engagement Rings' },
  { id: 'wed_rings', categoryId: 'rings', name: 'Wedding Rings' },
  { id: 'prom_rings', categoryId: 'rings', name: 'Promise Rings' },
  { id: 'fash_rings', categoryId: 'rings', name: 'Fashion Rings' },
  { id: 'cock_rings', categoryId: 'rings', name: 'Cocktail Rings' },
  { id: 'coup_rings', categoryId: 'rings', name: 'Couple Rings' },
  { id: 'stat_rings', categoryId: 'rings', name: 'Statement Rings' },
  { id: 'adj_rings', categoryId: 'rings', name: 'Adjustable Rings' },
  
  // Necklaces
  { id: 'pend_neck', categoryId: 'necklaces', name: 'Pendant Necklaces' },
  { id: 'chain_neck', categoryId: 'necklaces', name: 'Chain Necklaces' },
  { id: 'chok_neck', categoryId: 'necklaces', name: 'Choker Necklaces' },
  { id: 'lay_neck', categoryId: 'necklaces', name: 'Layered Necklaces' },
  { id: 'name_neck', categoryId: 'necklaces', name: 'Name/Initial Necklaces' },
  { id: 'stat_neck', categoryId: 'necklaces', name: 'Statement Necklaces' },
  { id: 'pearl_neck', categoryId: 'necklaces', name: 'Pearl Necklaces' },
  { id: 'cross_neck', categoryId: 'necklaces', name: 'Cross Necklaces' },
  
  // Earrings
  { id: 'stud_ear', categoryId: 'earrings', name: 'Stud Earrings' },
  { id: 'hoop_ear', categoryId: 'earrings', name: 'Hoop Earrings' },
  { id: 'drop_ear', categoryId: 'earrings', name: 'Drop Earrings' },
  { id: 'dang_ear', categoryId: 'earrings', name: 'Dangle Earrings' },
  { id: 'hugg_ear', categoryId: 'earrings', name: 'Huggie Earrings' },
  { id: 'cuff_ear', categoryId: 'earrings', name: 'Ear Cuffs' },
  { id: 'stat_ear', categoryId: 'earrings', name: 'Statement Earrings' },
  { id: 'pearl_ear', categoryId: 'earrings', name: 'Pearl Earrings' },

  // Bracelets
  { id: 'chain_brac', categoryId: 'bracelets', name: 'Chain Bracelets' },
  { id: 'bang_brac', categoryId: 'bracelets', name: 'Bangle Bracelets' },
  { id: 'charm_brac', categoryId: 'bracelets', name: 'Charm Bracelets' },
  { id: 'cuff_brac', categoryId: 'bracelets', name: 'Cuff Bracelets' },
  { id: 'bead_brac', categoryId: 'bracelets', name: 'Beaded Bracelets' },
  { id: 'pearl_brac', categoryId: 'bracelets', name: 'Pearl Bracelets' },
  { id: 'coup_brac', categoryId: 'bracelets', name: 'Couple/Friendship Bracelets' },

  // Anklets
  { id: 'chain_ank', categoryId: 'anklets', name: 'Chain Anklets' },
  { id: 'bead_ank', categoryId: 'anklets', name: 'Beaded Anklets' },
  { id: 'charm_ank', categoryId: 'anklets', name: 'Charm Anklets' },
  { id: 'lay_ank', categoryId: 'anklets', name: 'Layered Anklets' },

  // Watches
  { id: 'women_watch', categoryId: 'watches', name: "Women's Watches" },
  { id: 'men_watch', categoryId: 'watches', name: "Men's Watches" },
  { id: 'coup_watch', categoryId: 'watches', name: 'Couple Watches' },
  { id: 'fash_watch', categoryId: 'watches', name: 'Fashion Watches' },
  { id: 'lux_watch', categoryId: 'watches', name: 'Luxury Watches' },

  // Jewelry Sets
  { id: 'neck_ear_set', categoryId: 'sets', name: 'Necklace & Earrings Sets' },
  { id: 'neck_brac_set', categoryId: 'sets', name: 'Necklace & Bracelet Sets' },
  { id: 'ear_brac_set', categoryId: 'sets', name: 'Earrings & Bracelet Sets' },
  { id: 'comp_set', categoryId: 'sets', name: 'Complete Jewelry Sets' },
  { id: 'coup_set', categoryId: 'sets', name: 'Couple Sets' },

  // Body Jewelry
  { id: 'nose_jew', categoryId: 'body', name: 'Nose Jewelry' },
  { id: 'belly_ring', categoryId: 'body', name: 'Belly Rings' },
  { id: 'lip_jew', categoryId: 'body', name: 'Lip Jewelry' },
  { id: 'ear_pierc', categoryId: 'body', name: 'Ear Piercing Jewelry' },
  { id: 'other_body', categoryId: 'body', name: 'Other Body Jewelry' },

  // Accessories
  { id: 'jew_box', categoryId: 'accessories', name: 'Jewelry Boxes' },
  { id: 'jew_org', categoryId: 'accessories', name: 'Jewelry Organizers' },
  { id: 'gift_set', categoryId: 'accessories', name: 'Gift Sets' },
  { id: 'gift_card', categoryId: 'accessories', name: 'Gift Cards' },
  { id: 'care_prod', categoryId: 'accessories', name: 'Jewelry Care Products' }
];

// Seed Products
const defaultProducts = [
  {
    id: 'prod_1',
    name: '18K Gold Plated Heart Pendant Necklace',
    description: 'This elegant 18K Gold Plated Heart Pendant Necklace features a high-polished minimalist heart silhouette. Crafted with durability and timeless romance in mind, it is perfect for everyday elegance or a special evening. Gift it to a loved one or keep it as a symbol of self-love.',
    price: 85000,
    sale_price: 75000,
    category_id: 'necklaces',
    subcategory_id: 'pend_neck',
    material: 'Gold-Plated',
    color: 'Gold',
    gender: 'Women',
    occasion: "Valentine's",
    stock_quantity: 24,
    sku: 'DSC-NK-HRT-01',
    featured: true,
    new_arrival: true,
    best_seller: true,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a40?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['heart', 'love', 'gold chain', 'pendant']
  },
  {
    id: 'prod_2',
    name: 'Eternal Promise Diamond Band',
    description: 'A classic symbol of commitment, the Eternal Promise Diamond Band features a delicate layout of micro-pavé CZ crystals on a premium Sterling Silver ring body. Sleek, comfortable, and perfect for stacking or pairing with engagement rings.',
    price: 180000,
    sale_price: null,
    category_id: 'rings',
    subcategory_id: 'prom_rings',
    material: 'Sterling Silver',
    color: 'Silver',
    gender: 'Unisex',
    occasion: 'Promise',
    stock_quantity: 15,
    sku: 'DSC-RG-PRM-02',
    featured: true,
    new_arrival: false,
    best_seller: true,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['diamond', 'promise', 'wedding', 'silver ring']
  },
  {
    id: 'prod_3',
    name: 'Classic Gold Hoop Earrings',
    description: 'Every wardrobe needs a pair of standard gold hoops. These 18K Gold Plated hoops are lightweight, hollow, and feature a secure latch closure for comfortable, all-day everyday wear.',
    price: 48000,
    sale_price: 39000,
    category_id: 'earrings',
    subcategory_id: 'hoop_ear',
    material: 'Gold-Plated',
    color: 'Gold',
    gender: 'Women',
    occasion: 'Everyday',
    stock_quantity: 45,
    sku: 'DSC-ER-HOP-03',
    featured: false,
    new_arrival: true,
    best_seller: true,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a40?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['hoops', 'everyday', 'gold', 'minimalist']
  },
  {
    id: 'prod_4',
    name: 'Baroque Pearl Choker Necklace',
    description: 'Combining natural elegance with contemporary aesthetic, this choker features handpicked genuine freshwater baroque pearls mounted on a thick gold-plated stainless steel paperclip chain. Fully adjustable.',
    price: 120000,
    sale_price: null,
    category_id: 'necklaces',
    subcategory_id: 'chok_neck',
    material: 'Sterling Silver',
    color: 'White',
    gender: 'Women',
    occasion: 'Wedding',
    stock_quantity: 8,
    sku: 'DSC-NK-PRL-04',
    featured: true,
    new_arrival: true,
    best_seller: false,
    limited_edition: true,
    clearance: false,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a40?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['pearl', 'choker', 'bridal', 'baroque']
  },
  {
    id: 'prod_5',
    name: 'Premium Minimalist Gold Chronograph Watch',
    description: 'An architectural marvel on the wrist, featuring a solid 316L Stainless Steel case finished with a premium gold-plated brush. Classic white dials, sapphire crystal face, and reliable Japanese Quartz movement.',
    price: 490000,
    sale_price: 450000,
    category_id: 'watches',
    subcategory_id: 'lux_watch',
    material: 'Stainless Steel',
    color: 'Gold',
    gender: 'Men',
    occasion: 'Anniversary',
    stock_quantity: 6,
    sku: 'DSC-WT-LUX-05',
    featured: true,
    new_arrival: false,
    best_seller: true,
    limited_edition: true,
    clearance: false,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['watch', 'luxury', 'men watch', 'chronograph']
  },
  {
    id: 'prod_6',
    name: 'Gilded Intertwined Couple Ring Set',
    description: 'Designed as a physical representation of two lives woven together, this couple ring set is crafted from high-polished gold-plated titanium. The male ring is robust and thick, while the female ring features an elegant braided band.',
    price: 135000,
    sale_price: null,
    category_id: 'rings',
    subcategory_id: 'coup_rings',
    material: 'Titanium',
    color: 'Gold',
    gender: 'Unisex',
    occasion: 'Engagement',
    stock_quantity: 12,
    sku: 'DSC-RG-CUP-06',
    featured: true,
    new_arrival: true,
    best_seller: false,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['couple ring', 'promise ring', 'wedding band', 'matching']
  },
  {
    id: 'prod_7',
    name: 'Chunky Paperclip Gold Chain Bracelet',
    description: 'Make a bold statement with this geometric paperclip link bracelet. Made from premium 18K gold-plated marine-grade stainless steel, this bracelet is water-resistant, tarnish-resistant, and highly durable.',
    price: 65000,
    sale_price: 55000,
    category_id: 'bracelets',
    subcategory_id: 'chain_brac',
    material: 'Gold-Plated',
    color: 'Gold',
    gender: 'Women',
    occasion: 'Everyday',
    stock_quantity: 32,
    sku: 'DSC-BR-PPR-07',
    featured: false,
    new_arrival: false,
    best_seller: true,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a40?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['bracelet', 'chain', 'paperclip', 'gold links']
  },
  {
    id: 'prod_8',
    name: 'Timeless Diamond & Sapphire Wedding Ring',
    description: 'An exceptional custom masterpiece featuring a brilliant cushion-cut deep blue sapphire center, surrounded by a double halo of conflict-free diamonds in 18K solid white gold settings. Truly a luxury heirloom.',
    price: 850000,
    sale_price: null,
    category_id: 'rings',
    subcategory_id: 'wed_rings',
    material: 'Gold',
    color: 'White',
    gender: 'Women',
    occasion: 'Wedding',
    stock_quantity: 3,
    sku: 'DSC-RG-WED-08',
    featured: true,
    new_arrival: false,
    best_seller: false,
    limited_edition: true,
    clearance: false,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['sapphire', 'wedding ring', 'diamonds', 'luxury']
  },
  {
    id: 'prod_9',
    name: 'Sparkling Emerald Cut Ear Cuffs',
    description: 'No piercings required! This single ear cuff slides onto your cartilage and fits securely. Set with stunning emerald-cut green cubic zirconia stones on yellow gold-plated brass.',
    price: 35000,
    sale_price: 30000,
    category_id: 'earrings',
    subcategory_id: 'cuff_ear',
    material: 'Gold-Plated',
    color: 'Mixed',
    gender: 'Women',
    occasion: 'Gift',
    stock_quantity: 50,
    sku: 'DSC-ER-CUF-09',
    featured: false,
    new_arrival: true,
    best_seller: false,
    limited_edition: false,
    clearance: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['ear cuff', 'no piercing', 'emerald', 'gift under 50k']
  },
  {
    id: 'prod_10',
    name: 'Regal Velvet Jewelry Organizer Box',
    description: 'Store your growing DAINTY collection in style. This luxury box features soft velvet drawer partitions, custom ring slots, necklace hooks, and a built-in lock with a gold-tone key.',
    price: 150000,
    sale_price: 130000,
    category_id: 'accessories',
    subcategory_id: 'jew_box',
    material: 'Stainless Steel', // For metal accents
    color: 'Black',
    gender: 'Unisex',
    occasion: 'Birthday',
    stock_quantity: 10,
    sku: 'DSC-AC-BOX-10',
    featured: true,
    new_arrival: false,
    best_seller: false,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80'
    ],
    tags: ['box', 'organizer', 'velvet', 'storage']
  }
];

// Helper functions
const STORAGE_PREFIX = 'dainty_ecommerce_';

function getStorageItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('LocalStorage read error:', error);
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    // Trigger storage event manually for same-page listeners
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('LocalStorage write error:', error);
  }
}

// Initialization
export function initDB() {
  if (!localStorage.getItem(STORAGE_PREFIX + 'products')) {
    setStorageItem('products', defaultProducts);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'orders')) {
    setStorageItem('orders', []);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'messages')) {
    setStorageItem('messages', [
      {
        id: 'msg_welcome',
        chatId: 'admin_demo_chat',
        sender: 'admin',
        content: 'Welcome to DAINTY STUDS AND CHAINS! How can we assist you today?',
        timestamp: new Date().toISOString()
      }
    ]);
  }
}

// Products API
export function getProducts() {
  initDB();
  return getStorageItem('products', []);
}

export function saveProduct(product) {
  const products = getProducts();
  if (product.id) {
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...product };
    } else {
      products.push(product);
    }
  } else {
    product.id = 'prod_' + Math.random().toString(36).substr(2, 9);
    product.created_at = new Date().toISOString();
    products.push(product);
  }
  setStorageItem('products', products);
  return product;
}

export function deleteProduct(productId) {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  setStorageItem('products', filtered);
}

export function updateProductPrice(productId, newPrice, newSalePrice = null) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx].price = Number(newPrice);
    products[idx].sale_price = newSalePrice ? Number(newSalePrice) : null;
    setStorageItem('products', products);
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

  return newOrder;
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    setStorageItem('orders', orders);
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
  localStorage.removeItem(STORAGE_PREFIX + 'orders');
  localStorage.removeItem(STORAGE_PREFIX + 'messages');
  initDB();
  window.dispatchEvent(new Event('storage'));
}
