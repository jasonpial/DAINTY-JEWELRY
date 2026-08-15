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
                <span style={{ color: 'var(--color-text-primary)' }}>{subcatName}</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h1 className="detail-name">{name}</h1>

          {/* Pricing in UGX and USD */}
          <div className="detail-price-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
            {isSale ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.8rem', color: 'var(--color-error)', fontFamily: 'var(--font-luxury)', fontWeight: 700 }}>
                    {formatUGX(sale_price)}
                  </span>
                  <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--color-text-muted)', fontFamily: 'var(--font-luxury)' }}>
                    {formatUGX(price)}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  ~ {formatUSD(sale_price)} USD
                </div>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '1.8rem', color: '#ffffff', fontFamily: 'var(--font-luxury)', fontWeight: 700 }}>
                  {formatUGX(price)}
                </span>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600, marginTop: '0.1rem' }}>
                  ~ {formatUSD(price)} USD
                </div>
              </div>
            )}
          </div>

          {/* Short specs card */}
          <div className="detail-meta-grid">
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
                style={{ color: isOutOfStock ? 'var(--color-error)' : 'var(--color-success)' }}
              >
                {isOutOfStock ? 'Out of Stock' : stock_quantity <= 5 ? `Low Stock (${stock_quantity} left)` : 'In Stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="detail-desc">{description}</p>

          {/* Color Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="form-label" style={{ marginBottom: '0.6rem' }}>Available Colors</span>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {availableColors.map(col => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  style={{
                    padding: '0.4rem 1rem',
                    border: '1px solid',
                    borderColor: selectedColor === col ? 'var(--color-gold-primary)' : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--border-radius-sm)',
                    background: selectedColor === col ? 'rgba(194, 139, 83, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
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
              <span className="form-label">Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.05)' }}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ padding: '0.4rem 0.8rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#ffffff' }}
                >
                  -
                </button>
                <span style={{ padding: '0 0.8rem', fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(stock_quantity, q + 1))}
                  style={{ padding: '0.4rem 0.8rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#ffffff' }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)' }}>
              <Truck size={16} style={{ color: 'var(--color-gold-light)' }} />
              <span>Standard delivery within 24-48 hours across Uganda.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)' }}>
              <Award size={16} style={{ color: 'var(--color-gold-light)' }} />
              <span>Handcrafted from tarnish-resistant copper-like gold plating and sterling silver.</span>
            </div>
          </div>

          {/* Specifications Table */}
          <h3 style={{ fontSize: '1.2rem', marginTop: '3rem', borderBottom: '1px solid var(--color-border-gold)', paddingBottom: '0.5rem' }}>Specifications</h3>
          <table className="spec-table">
            <tbody>
              <tr>
                <th>Material</th>
                <td>{material}</td>
              </tr>
              <tr>
                <th>Finish</th>
                <td>Tarnish-Resistant Finish</td>
              </tr>
              <tr>
                <th>Color</th>
                <td>{selectedColor}</td>
              </tr>
              <tr>
                <th>Length/Size</th>
                <td>Adjustable Fit / 45 cm standard chain length</td>
              </tr>
              <tr>
                <th>Gender</th>
                <td>{gender}</td>
              </tr>
              <tr>
                <th>Occasion</th>
                <td>{occasion}</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
