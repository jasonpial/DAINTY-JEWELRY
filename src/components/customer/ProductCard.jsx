import { useState, useEffect, useRef } from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import { navigateTo } from '../../Router';

// Formatter for Ugandan Shilling (UGX)
export function formatUGX(amount) {
  return 'UGX ' + Math.round(amount).toLocaleString('en-US');
}

// Formatter for US Dollars (USD) - Conversion rate: 1 USD = 3700 UGX
export function formatUSD(amountUGX) {
  const usd = amountUGX / 3700;
  return '$' + usd.toFixed(2);
}

export default function ProductCard({ product, onAddToBag }) {
  const {
    id,
    name,
    price,
    sale_price,
    category_id,
    stock_quantity,
    images = [],
    new_arrival,
    best_seller,
    limited_edition,
    clearance
  } = product;

  // Filter out empty strings or invalid images
  const validImages = (images && images.length > 0) 
    ? images.filter(img => img && img.trim() !== '') 
    : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80'];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Generate a random interval between 2400ms and 5000ms for each card instance to avoid uniform slideshow transitions
  const [slideshowInterval] = useState(() => Math.floor(Math.random() * (5000 - 2400 + 1)) + 2400);

  const cardRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Close reveal when user taps outside the product card
  useEffect(() => {
    if (!isRevealed) return;

    const handleOutsideClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsRevealed(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isRevealed]);

  useEffect(() => {
    if (validImages.length <= 1) return;

    // Transition product images automatically using the unique random interval time
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }, slideshowInterval);

    return () => clearInterval(interval);
  }, [validImages.length, slideshowInterval]);

  const isSale = sale_price && sale_price < price;
  const isOutOfStock = stock_quantity <= 0;

  // Determine badge text
  let badgeText = '';
  if (new_arrival) badgeText = 'New';
  else if (best_seller) badgeText = 'Best Seller';
  else if (limited_edition) badgeText = 'Limited';
  else if (clearance) badgeText = 'Clearance';

  const handleDetailsClick = (e) => {
    // Detect touchscreen devices to trigger tap-to-reveal on first tap instead of clicking through
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && !isRevealed) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsRevealed(true);
      return;
    }
    navigateTo('product', { id });
  };

  const handleAddToBagClick = (e) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      onAddToBag(product);
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`product-card ${isRevealed ? 'touched-reveal' : ''}`}
      onClick={handleDetailsClick} 
      style={{ cursor: 'pointer' }}
    >
      <div className="product-img-wrapper">
        {/* Badges */}
        {badgeText && <span className="product-badge">{badgeText}</span>}
        {isSale && <span className="product-sale-badge">Sale</span>}
        
        {/* Auto-slideshow Images */}
        {validImages.map((imgUrl, index) => (
          <img 
            key={index}
            src={imgUrl} 
            alt={`${name} view ${index + 1}`} 
            className="product-img" 
            style={{ 
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
              zIndex: index === currentImageIndex ? 2 : 1
            }}
            loading="lazy" 
          />
        ))}
      </div>

      <div className="product-info">
        <span className="product-info-cat">{category_id}</span>
        <h3 className="product-info-name" title={name}>{name}</h3>
        
        {/* Compact Horizontal Price Line */}
        <div className="product-info-price">
          {isSale ? (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'baseline', justifyContent: 'center', fontSize: '0.8rem', flexWrap: 'wrap' }}>
              <span className="price-sale" style={{ color: '#b91c1c', fontWeight: 700 }}>{formatUGX(sale_price)}</span>
              <span className="price-original" style={{ textDecoration: 'line-through', fontSize: '0.7rem', color: '#a8a29e' }}>{formatUGX(price)}</span>
              <span className="price-usd" style={{ fontSize: '0.7rem', color: '#78716c' }}>~ {formatUSD(sale_price)} USD</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'baseline', justifyContent: 'center', fontSize: '0.8rem' }}>
              <span className="price-regular" style={{ color: '#1c1917', fontWeight: 700 }}>{formatUGX(price)}</span>
              <span className="price-usd" style={{ fontSize: '0.7rem', color: '#78716c' }}>~ {formatUSD(price)} USD</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-card-buttons">
          <button 
            className="card-btn-action-visible card-btn-details-visible"
            onClick={(e) => { e.stopPropagation(); handleDetailsClick(); }}
          >
            Details
          </button>
          
          {!isOutOfStock ? (
            <button 
              className="card-btn-action-visible card-btn-bag-visible"
              onClick={handleAddToBagClick}
            >
              Add
            </button>
          ) : (
            <button 
              className="card-btn-action-visible" 
              style={{ background: '#78716c', color: 'white', borderColor: '#78716c', cursor: 'not-allowed' }}
              disabled
              onClick={(e) => e.stopPropagation()}
            >
              Sold
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
