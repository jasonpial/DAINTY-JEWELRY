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

// Piercing Location Categorization (Shop by Piercing)
export const piercingLocations = [
  'Ear Lobe',
  'Helix/Cartilage',
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
  },
  {
    id: 'prod_11',
    name: 'DAINTY 14K Gold Marquise Cluster Stud Earring',
    description: 'Exquisite multi-stone marquise and round brilliant cut CZ cluster stud crafted in warm 14K gold plate with high security back. A signature delicate piece tailored for lobe or flat cartilage styling.',
    price: 95000,
    sale_price: 85000,
    category_id: 'earrings',
    subcategory_id: 'stud_ear',
    material: '14K Gold-Plated',
    color: 'Gold',
    gender: 'Women',
    occasion: 'Everyday',
    stock_quantity: 35,
    sku: 'DSC-ST-MRQ-11',
    featured: true,
    new_arrival: true,
    best_seller: true,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      '/images/stud_vii_marquise_cluster_stud.jpeg',
      '/images/vii.jpeg',
      '/images/hero_home_earrings.png'
    ],
    tags: ['stud', 'marquise', 'dainty studs', 'piercing', 'gold']
  },
  {
    id: 'prod_12',
    name: 'DAINTY 18K Gold Draped Chain Piercing Ring',
    description: 'An architectural statement hoop featuring a delicate suspended cascade chain connecting the front clasp to a gentle drape. Designed for septum, helix, or conch styling.',
    price: 85000,
    sale_price: null,
    category_id: 'earrings',
    subcategory_id: 'dang_ear',
    material: '18K Gold-Plated',
    color: 'Gold',
    gender: 'Unisex',
    occasion: 'Everyday',
    stock_quantity: 28,
    sku: 'DSC-CH-DRP-12',
    featured: true,
    new_arrival: true,
    best_seller: true,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      '/images/stud_v_gold_draped_chain_ring.jpeg',
      '/images/v.jpeg',
      '/images/stud_iv_gold_chain_ring.jpeg'
    ],
    tags: ['chain', 'chains', 'drape', 'piercing', 'septum']
  },
  {
    id: 'prod_13',
    name: 'DAINTY Diamond Pavé Eternity Clicker Hoop',
    description: 'Seamless hinged clicker ring paved with radiant pavé micro-gemstones. Effortless click-to-close mechanism offering continuous sparkle for tragus, helix, and lobe piercings.',
    price: 78000,
    sale_price: 69000,
    category_id: 'earrings',
    subcategory_id: 'hugg_ear',
    material: 'Gold-Plated',
    color: 'Gold',
    gender: 'Women',
    occasion: 'Everyday',
    stock_quantity: 42,
    sku: 'DSC-ER-PVH-13',
    featured: true,
    new_arrival: true,
    best_seller: true,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      '/images/stud_iii_gold_pave_clicker.jpeg',
      '/images/iii.jpeg',
      '/images/stud_ii_diamond_eternity_ring.jpeg'
    ],
    tags: ['pave', 'clicker', 'hoop', 'dainty studs', 'gold']
  },
  {
    id: 'prod_14',
    name: 'DAINTY Curated 3-Pair Earring & Stud Suite',
    description: 'The ultimate ear stack in a single presentation: includes micro-pavé huggies, classic mirror-polished hoops, and round brilliant solitary studs. Made for mix-and-match stacking.',
    price: 145000,
    sale_price: 125000,
    category_id: 'sets',
    subcategory_id: 'stud_ear',
    material: 'Gold-Plated',
    color: 'Gold',
    gender: 'Women',
    occasion: 'Gift',
    stock_quantity: 20,
    sku: 'DSC-SET-CUR-14',
    featured: true,
    new_arrival: true,
    best_seller: true,
    limited_edition: true,
    clearance: false,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      '/images/stud_viii_luxury_earring_curation_set.jpeg',
      '/images/viii.jpeg',
      '/images/hero_home_luxury.png'
    ],
    tags: ['ear stack', 'curation set', 'gift set', 'studs']
  },
  {
    id: 'prod_15',
    name: 'DAINTY Threadless Gold Flat-Back Labret Stud',
    description: 'Implant-grade flat back comfort stud featuring a mirror-finish 18K PVD gold front pin. Built for sleeping and active days without poking behind the ear.',
    price: 55000,
    sale_price: null,
    category_id: 'earrings',
    subcategory_id: 'stud_ear',
    material: 'Titanium & Gold PVD',
    color: 'Gold',
    gender: 'Unisex',
    occasion: 'Everyday',
    stock_quantity: 50,
    sku: 'DSC-LB-GLD-15',
    featured: true,
    new_arrival: true,
    best_seller: false,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      '/images/stud_vi_gold_flatback_labret.jpeg',
      '/images/vi.jpeg',
      '/images/stud_0_silver_flatback.jpeg'
    ],
    tags: ['flat back', 'labret', 'stud', 'dainty studs', 'piercing']
  },
  {
    id: 'prod_16',
    name: 'DAINTY Minimalist Open Ring Piercing Clicker',
    description: 'Ultra-refined minimalist open piercing contour with safety post ball. Designed for high fashion curated styling on nose or cartilage.',
    price: 45000,
    sale_price: 39000,
    category_id: 'earrings',
    subcategory_id: 'hugg_ear',
    material: '18K Gold-Plated',
    color: 'Gold',
    gender: 'Unisex',
    occasion: 'Everyday',
    stock_quantity: 30,
    sku: 'DSC-RN-OPN-16',
    featured: false,
    new_arrival: true,
    best_seller: false,
    limited_edition: false,
    clearance: false,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    images: [
      '/images/stud_i_gold_open_ring.jpeg',
      '/images/i.jpeg'
    ],
    tags: ['open ring', 'minimalist', 'cartilage', 'septum']
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

function setStorageItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    // Trigger storage event manually for same-page listeners
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('dainty_products_changed', { detail: { key, count: value?.length } }));
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

export async function syncProductsWithServer() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) {
      console.warn('Server database sync responded with status:', res.status);
      return;
    }

    const serverProducts = await res.json();
    if (Array.isArray(serverProducts)) {
      const deletedSet = getDeletedProductIds();
      
      // Filter out any locally deleted products
      const cleanServer = serverProducts.filter(p => p && p.id && !deletedSet.has(p.id));
      
      // Keep only newly drafted local items that are waiting for initial sync
      const localProds = getStorageItem('products', []);
      const safeLocal = Array.isArray(localProds) ? localProds : [];
      const pendingLocal = safeLocal.filter(p => p && p.id && p._pendingSync === true && !deletedSet.has(p.id));

      // Merge pending local items on top of authoritative server items
      const serverIdSet = new Set(cleanServer.map(p => p.id));
      const combined = [
        ...pendingLocal.filter(p => !serverIdSet.has(p.id)),
        ...cleanServer
      ];

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

// Initialization
export function initDB() {
  const deletedSet = getDeletedProductIds();
  const existingProds = getStorageItem('products', null);
  if (!existingProds) {
    const initialList = defaultProducts.filter(p => !deletedSet.has(p.id));
    setStorageItem('products', initialList);
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

  // Trigger background server sync once on load and on tab focus
  if (!isServerSyncStarted && typeof window !== 'undefined') {
    isServerSyncStarted = true;
    syncProductsWithServer();

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
  return base.filter(p => p && p.id && !deletedSet.has(p.id));
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

  // Ensure default metadata for storefront filtering
  if (!cleanProduct.gender) cleanProduct.gender = 'Women';
  if (!cleanProduct.occasion) cleanProduct.occasion = 'Everyday';
  if (!cleanProduct.category_id && cleanProduct.category) cleanProduct.category_id = cleanProduct.category;
  if (!cleanProduct.category_id) cleanProduct.category_id = 'earrings';
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
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
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
