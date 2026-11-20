import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, MessageSquareCode, Truck, Award } from 'lucide-react';
import { getProducts } from '../../db';
import ProductCard, { formatUGX, formatUSD } from './ProductCard';
import { navigateTo } from '../../Router';

export default function ProductDetailView({ routeParams, onAddToBag }) {
  const [product, setProduct] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Load product details and listen for real-time changes
  useEffect(() => {
    const loadProduct = () => {
      const products = getProducts();
      const found = products.find(p => p.id === routeParams.id);
      if (found) {
        setProduct(found);
        setSelectedColor(found.color || 'Gold');
      } else {
        setProduct(null);
      }
    };

    loadProduct();
    setSelectedImageIdx(0);

    window.addEventListener('storage', loadProduct);
    window.addEventListener('dainty_products_changed', loadProduct);
    return () => {
      window.removeEventListener('storage', loadProduct);
      window.removeEventListener('dainty_products_changed', loadProduct);
    };
  }, [routeParams.id]);

  // Active images list: strictly images added by admin (no default fallback padding)
  const rawImages = (product && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : (product?.image ? [product.image] : []);

  const activeImages = rawImages.filter(img => img && typeof img === 'string' && img.trim() !== '');
  if (activeImages.length === 0) {
    activeImages.push('/images/logo-image.png');
  }

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
    const number = '+256788227027'; // Business phone number
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
    <div className="detail-page-wrap">
      <div className="detail-layout">
        
        {/* Gallery Column */}
        <div className="detail-gallery">
          {/* Main Display with Slideshow Chevrons & Indicators */}
          <div className="detail-main-img-wrapper" style={{ position: 'relative' }}>
            <img 
              src={activeImages[selectedImageIdx] || '/images/vi.jpeg'} 
              alt={name} 
              className="detail-main-img" 
            />
            {activeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIdx(prev => (prev - 1 + activeImages.length) % activeImages.length);
                  }}
                  style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.9)', border: '1px solid #e8e2d7', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: '14px', fontWeight: 'bold', color: '#1c1917'
                  }}
                  title="Previous Photo"
                >
                  ❮
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIdx(prev => (prev + 1) % activeImages.length);
                  }}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.9)', border: '1px solid #e8e2d7', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: '14px', fontWeight: 'bold', color: '#1c1917'
                  }}
                  title="Next Photo"
                >
                  ❯
                </button>
                <div style={{
                  position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: '6px', zIndex: 10, background: 'rgba(0,0,0,0.45)', padding: '4px 8px', borderRadius: '12px', backdropFilter: 'blur(4px)'
                }}>
                  {activeImages.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setSelectedImageIdx(i)}
                      style={{
                        width: selectedImageIdx === i ? '18px' : '6px', height: '6px', borderRadius: '3px',
                        background: selectedImageIdx === i ? '#f5e6a5' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails (Capped to exactly up to 4 images) */}
          <div className="detail-thumbnails">
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

          {/* Color & Quantity Selectors Row */}
          <div className="detail-selectors-row">
            {/* Color Selector */}
            <div className="detail-selector-block">
              <span className="form-label" style={{ marginBottom: '0.45rem', color: '#1c1917', display: 'block' }}>Available Colors</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {availableColors.map(col => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    style={{
                      padding: '0.4rem 0.9rem',
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
              <div className="detail-selector-block" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="form-label" style={{ color: '#1c1917', margin: 0 }}>Quantity</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #eae6e1', borderRadius: '4px', overflow: 'hidden', background: '#ffffff' }}>
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: '0.4rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#1c1917' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 0.7rem', fontSize: '0.9rem', fontWeight: 600, color: '#1c1917' }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(stock_quantity, q + 1))}
                    style={{ padding: '0.4rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#1c1917' }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

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

          {/* Trust points row */}
          <div className="detail-trust-row">
            <div className="detail-trust-item">
              <Truck size={16} style={{ color: 'var(--color-gold-dark)', flexShrink: 0 }} />
              <span>Delivery across Kampala.</span>
            </div>
            <div className="detail-trust-item">
              <Award size={16} style={{ color: 'var(--color-gold-dark)', flexShrink: 0 }} />
              <span>Best Quality</span>
            </div>
          </div>

          {/* Specifications Table */}
          <h3 style={{ fontSize: '1.2rem', marginTop: '3rem', borderBottom: '1px solid #eae6e1', paddingBottom: '0.5rem', color: '#1c1917' }}>Specifications</h3>
          <table className="spec-table">
            <tbody>
              <tr>
                <th style={{ color: '#1c1917' }}>Material</th>
                <td style={{ color: '#44403c' }}>{product?.material || material || '14K Gold-Plated'}</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Finish</th>
                <td style={{ color: '#44403c' }}>{product?.finish || 'Tarnish-Resistant Finish'}</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Color</th>
                <td style={{ color: '#44403c' }}>{selectedColor || product?.color || 'Gold'}</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Length/Size</th>
                <td style={{ color: '#44403c' }}>{product?.length_size || product?.size || 'Adjustable Fit / 45 cm standard chain length'}</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Gender</th>
                <td style={{ color: '#44403c' }}>{product?.gender || gender || 'Women'}</td>
              </tr>
              <tr>
                <th style={{ color: '#1c1917' }}>Occasion</th>
                <td style={{ color: '#44403c' }}>{product?.occasion || occasion || 'Everyday'}</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>

      {/* Related Collection Pieces Matching Reference Photo */}
      <section className="dainty-product-section" style={{ marginTop: '3.5rem' }}>
        <div className="dainty-section-header-row">
          <div>
            <span className="dainty-section-kicker">You May Also Admire</span>
            <h2 className="dainty-section-heading">COMPLETE THE SUITE</h2>
          </div>
          <button
            className="dainty-btn-view-all"
            onClick={() => navigateTo('shop', { category: category_id })}
          >
            <span>Explore {catName}</span>
            <ChevronRight size={13} />
          </button>
        </div>
        <div className="dainty-responsive-grid-4">
          {getProducts()
            .filter(p => p.id !== id && (p.category_id === category_id || p.material === material))
            .slice(0, 4)
            .map(p => (
              <ProductCard key={p.id} product={p} onAddToBag={onAddToBag} />
            ))}
        </div>
      </section>
    </div>
  );
}
