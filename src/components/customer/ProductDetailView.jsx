import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, MessageSquareCode, Truck, ShieldAlert, Award } from 'lucide-react';
import { getProducts } from '../../db';
import { formatUGX, formatUSD } from './ProductCard';
import { navigateTo } from '../../Router';

export default function ProductDetailView({ routeParams, onAddToBag }) {
  const [product, setProduct] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Load product details
  useEffect(() => {
    const products = getProducts();
    const found = products.find(p => p.id === routeParams.id);
    if (found) {
      setProduct(found);
      setSelectedImageIdx(0);
      setSelectedColor(found.color || 'Gold');
    }
  }, [routeParams.id]);

  // Capped Images list (exactly up to 4 images)
  const activeImages = product && product.images ? product.images.slice(0, 4) : [];

  // Automatic slideshow effect
  useEffect(() => {
    if (!product || activeImages.length <= 1) return;

    const timer = setInterval(() => {
      setSelectedImageIdx(prev => (prev + 1) % activeImages.length);
    }, 4000); // Transitions every 4 seconds

    return () => clearInterval(timer);
  }, [product, activeImages.length]);

  if (!product) {
    return (
      <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <h2>Loading Product...</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Fetching dainty jewelry item details.</p>
      </div>
    );
  }

  const {
    id,
    name,
    description,
    price,
    sale_price,
    category_id,
    subcategory_id,
    material,
    color,
    gender,
    occasion,
    stock_quantity,
    sku
  } = product;

  const isSale = sale_price && sale_price < price;
  const activePrice = isSale ? sale_price : price;
  const isOutOfStock = stock_quantity <= 0;

  // Available colors (derived from catalog or standard list for dropdown selection)
  const availableColors = color === 'Mixed' ? ['Gold', 'Silver', 'Rose Gold'] : [color];

  const handleAddToBag = () => {
    if (isOutOfStock) return;
    onAddToBag({
      ...product,
      selectedColor,
      quantity
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onAddToBag({
      ...product,
      selectedColor,
      quantity
    });
    navigateTo('cart');
  };

  const handleOrderWhatsApp = () => {
    const number = '+256700000000'; // Business phone number
    const pageUrl = `${window.location.origin}${window.location.pathname}#/product?id=${id}`;
    const text = `Hello DAINTY STUDS AND CHAINS! I would like to order:
    
*Product:* ${name}
*SKU:* ${sku}
*Material:* ${material}
*Selected Color:* ${selectedColor}
*Quantity:* ${quantity}
*Price:* ${formatUGX(activePrice)} (~${formatUSD(activePrice)} USD)

*Product Page:* ${pageUrl}`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${number}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Generate path names
  const catName = category_id.charAt(0).toUpperCase() + category_id.slice(1);
  const subcatName = subcategory_id ? subcategory_id.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') : '';

  return (
    <div style={{ background: 'transparent', padding: '2rem 0' }}>
      <div className="detail-layout">
        
        {/* Gallery Column */}
        <div className="detail-gallery">
          {/* Main Display */}
          <div className="detail-main-img-wrapper">
            <img 
              src={activeImages[selectedImageIdx] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80'} 
              alt={name} 
              className="detail-main-img" 
            />
          </div>

          {/* Thumbnails (Capped to exactly up to 4 images) */}
          <div className="detail-thumbnails" style={{ gridTemplateColumns: `repeat(${activeImages.length}, 1fr)` }}>
            {activeImages.map((img, idx) => (
              <div 
                key={idx}
                className={`detail-thumb ${selectedImageIdx === idx ? 'active' : ''}`}
                onClick={() => setSelectedImageIdx(idx)}
              >
                <img src={img} alt={`view ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="detail-info">
          {/* Breadcrumb path */}
          <div className="detail-cat-path">
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop'); }}>Shop</a>
            <ChevronRight size={12} style={{ margin: '0 0.4rem' }} />
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop', { category: category_id }); }}>{catName}</a>
            {subcatName && (
              <>
                <ChevronRight size={12} style={{ margin: '0 0.4rem' }} />
                <span style={{ color: '#1c1917' }}>{subcatName}</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h1 className="detail-name" style={{ color: '#1c1917' }}>{name}</h1>

          {/* Pricing in UGX and USD */}
          <div className="detail-price-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
            {isSale ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.8rem', color: '#b91c1c', fontFamily: 'var(--font-luxury)', fontWeight: 700 }}>
                    {formatUGX(sale_price)}
                  </span>
                  <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#a8a29e', fontFamily: 'var(--font-luxury)' }}>
                    {formatUGX(price)}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#78716c', fontWeight: 600 }}>
                  ~ {formatUSD(sale_price)} USD
                </div>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '1.8rem', color: '#1c1917', fontFamily: 'var(--font-luxury)', fontWeight: 700 }}>
                  {formatUGX(price)}
                </span>
                <div style={{ fontSize: '0.9rem', color: '#78716c', fontWeight: 600, marginTop: '0.1rem' }}>
                  ~ {formatUSD(price)} USD
                </div>
              </div>
            )}
          </div>

          {/* Short specs card */}
          <div className="detail-meta-grid animate-fade-in">
            <div className="detail-meta-item">
              <span className="detail-meta-label">Material</span>
              <span className="detail-meta-val">{material}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Gender</span>
              <span className="detail-meta-val">{gender}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">SKU</span>
              <span className="detail-meta-val">{sku}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Availability</span>
              <span 
                className="detail-meta-val"
                style={{ color: isOutOfStock ? 'var(--color-error)' : 'var(--color-gold-dark)' }}
              >
                {isOutOfStock ? 'Out of Stock' : stock_quantity <= 5 ? `Low Stock (${stock_quantity} left)` : 'In Stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="detail-desc" style={{ color: '#44403c' }}>{description}</p>

          {/* Color Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="form-label" style={{ marginBottom: '0.6rem', color: '#1c1917' }}>Available Colors</span>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {availableColors.map(col => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  style={{
                    padding: '0.4rem 1rem',
                    border: '1px solid',
                    borderColor: selectedColor === col ? 'var(--color-gold-primary)' : '#eae6e1',
                    borderRadius: 'var(--border-radius-sm)',
                    background: selectedColor === col ? '#fcfbfa' : '#ffffff',
                    color: selectedColor === col ? 'var(--color-gold-dark)' : '#1c1917',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'var(--transition-quick)'
                  }}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="form-label" style={{ color: '#1c1917' }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #eae6e1', borderRadius: '4px', overflow: 'hidden', background: '#ffffff' }}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ padding: '0.4rem 0.8rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#1c1917' }}
                >
                  -
                </button>
                <span style={{ padding: '0 0.8rem', fontSize: '0.9rem', fontWeight: 600, color: '#1c1917' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(stock_quantity, q + 1))}
                  style={{ padding: '0.4rem 0.8rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#1c1917' }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Actions Column */}
          <div className="detail-actions">
            {!isOutOfStock ? (
              <>
                <div className="detail-actions-row">
                  <button onClick={handleAddToBag} className="btn-secondary detail-btn-cart">
                    <ShoppingBag size={18} /> Add To Bag
                  </button>
                  <button onClick={handleBuyNow} className="btn-primary detail-btn-buy">
                    Buy Now
                  </button>
                </div>
                <button onClick={handleOrderWhatsApp} className="btn-whatsapp" style={{ justifyContent: 'center' }}>
                  <MessageSquareCode size={18} /> Order Via WhatsApp
                </button>
              </>
            ) : (
              <button className="btn-primary" style={{ background: '#78716c', borderColor: '#78716c', cursor: 'not-allowed', width: '100%', justifyContent: 'center' }} disabled>
                Sold Out - Order inquiry via chat
              </button>
            )}
          </div>

          {/* Trust points list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '1px solid #eae6e1', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#44403c' }}>
              <Truck size={16} style={{ color: 'var(--color-gold-dark)' }} />
              <span>Standard delivery within 24-48 hours across Uganda.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#44403c' }}>
              <Award size={16} style={{ color: 'var(--color-gold-dark)' }} />
              <span>Handcrafted from tarnish-resistant copper-like gold plating and sterling silver.</span>
            </div>
          </div>

          {/* Specifications Table */}
          <h3 style={{ fontSize: '1.2rem', marginTop: '3rem', borderBottom: '1px solid #eae6e1', paddingBottom: '0.5rem', color: '#1c1917' }}>Specifications</h3>
          <table className="spec-table">
            <tbody>
              <tr>
                <th style={{ color: '#1c1917' }}>Material</th>
                <td style={{ color: '#44403c' }}>{material}</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Finish</th>
                <td style={{ color: '#44403c' }}>Tarnish-Resistant Finish</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Color</th>
                <td style={{ color: '#44403c' }}>{selectedColor}</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Length/Size</th>
                <td style={{ color: '#44403c' }}>Adjustable Fit / 45 cm standard chain length</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Gender</th>
                <td style={{ color: '#44403c' }}>{gender}</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Occasion</th>
                <td style={{ color: '#44403c' }}>{occasion}</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
