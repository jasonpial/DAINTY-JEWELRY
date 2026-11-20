import { useState, useEffect } from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { navigateTo } from '../../Router';

// Formatter for Ugandan Shilling (UGX)
export function formatUGX(amount) {
  const num = Number(amount);
  return 'UGX ' + Math.round(Number.isFinite(num) ? num : 0).toLocaleString('en-US');
}

// Formatter for US Dollars (USD) - Conversion rate: 1 USD = 3700 UGX
export function formatUSD(amountUGX) {
  const num = Number(amountUGX);
  const usd = (Number.isFinite(num) ? num : 0) / 3700;
  return '$' + usd.toFixed(2);
}

export default function ProductCard({ product, onAddToBag }) {
  const {
    id,
    name,
    price,
    sale_price,
    stock_quantity,
    images = [],
    image,
    material
  } = product;

  // Active images list: strictly images added by admin (no default fallback padding)
  const rawImages = (Array.isArray(images) && images.length > 0)
    ? images
    : (image ? [image] : []);

  const activeImages = rawImages.filter(img => img && typeof img === 'string' && img.trim() !== '');
  if (activeImages.length === 0) {
    activeImages.push('/images/logo-image.png');
  }

  const [cardImageIdx, setCardImageIdx] = useState(0);

  // Automatic slideshow effect on product cards across home & listing pages
  useEffect(() => {
    if (activeImages.length <= 1) return;
    const timer = setInterval(() => {
      setCardImageIdx(prev => (prev + 1) % activeImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeImages.length]);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Consistent rating and review count per product
  const rating = '4.9';
  const safeId = String(id || 'dainty_item');
  const reviewCount = ((safeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1500) + 850).toLocaleString('en-US');

  const isSale = sale_price && sale_price < price;
  const activePrice = isSale ? sale_price : price;
  const isOutOfStock = stock_quantity <= 0;

  const handleCardClick = () => {
    navigateTo('product', { id });
  };

  const handleAddToBagClick = (e) => {
    e.stopPropagation();
    if (!isOutOfStock && onAddToBag) {
      onAddToBag(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1800);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(prev => !prev);
  };

  return (
    <div
      className="dainty-bestselling-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* 1. Image Studio Container with Slideshow */}
      <div className="dainty-bestselling-img-box" style={{ position: 'relative' }}>
        {/* Top-left Star Rating & Review Count */}
        <div className="dainty-bestselling-rating" title={`${rating} out of 5 stars (${reviewCount} reviews)`}>
          <Star size={13} className="star-icon" fill="#1c1917" stroke="#1c1917" />
          <span className="rating-score">{rating}</span>
          <span className="rating-count">({reviewCount})</span>
        </div>

        {/* Top-right Heart Wishlist Button */}
        <button
          className={`dainty-bestselling-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            size={18}
            className="heart-icon"
            fill={isWishlisted ? '#1c1917' : 'none'}
            color="#1c1917"
            strokeWidth={1.8}
          />
        </button>

        {/* Full-bleed Product Image filling the entire container with Slideshow */}
        <img
          src={activeImages[cardImageIdx] || '/images/vi.jpeg'}
          alt={name}
          className="dainty-bestselling-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/vi.jpeg';
          }}
        />

        {/* Slideshow Chevrons on Card */}
        {activeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCardImageIdx(prev => (prev - 1 + activeImages.length) % activeImages.length);
              }}
              style={{
                position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)', border: '1px solid #e8e2d7', borderRadius: '50%',
                width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 5, fontSize: '12px', fontWeight: 'bold', color: '#1c1917',
                opacity: 0.8, transition: 'opacity 0.2s'
              }}
              title="Previous Photo"
            >
              ❮
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCardImageIdx(prev => (prev + 1) % activeImages.length);
              }}
              style={{
                position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)', border: '1px solid #e8e2d7', borderRadius: '50%',
                width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 5, fontSize: '12px', fontWeight: 'bold', color: '#1c1917',
                opacity: 0.8, transition: 'opacity 0.2s'
              }}
              title="Next Photo"
            >
              ❯
            </button>

            {/* Card Dot Indicators */}
            <div style={{
              position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '4px', zIndex: 5, background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: '10px'
            }}>
              {activeImages.map((_, i) => (
                <span
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCardImageIdx(i);
                  }}
                  style={{
                    width: cardImageIdx === i ? '12px' : '4px', height: '4px', borderRadius: '2px',
                    background: cardImageIdx === i ? '#f5e6a5' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Hover / Tap Quick Add to Bag Bar */}
        <div className="dainty-bestselling-quick-action">
          <button
            className={`dainty-bestselling-add-btn ${isAdded ? 'added' : ''}`}
            onClick={handleAddToBagClick}
            disabled={isOutOfStock}
            type="button"
            aria-label={`Add ${name} to bag`}
          >
            <ShoppingBag size={14} />
            <span>{isOutOfStock ? 'Sold Out' : isAdded ? 'Added to Bag! ✓' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>

      {/* 2. Text Info Block */}
      <div className="dainty-bestselling-info">
        {/* Product Name */}
        <h3 className="dainty-bestselling-name" title={name}>
          {name}
        </h3>

        {/* Brand / Atelier Subtitle */}
        <p className="dainty-bestselling-sub">
          by DAINTY Atelier · {material || '18K Gold Plated'}
        </p>

        {/* Pricing in UGX and USD */}
        <div className="dainty-bestselling-price-row">
          <span className="bestselling-price-ugx">{formatUGX(activePrice)}</span>
          {isSale && (
            <span className="bestselling-price-slashed">{formatUGX(price)}</span>
          )}
          <span className="bestselling-price-usd">({formatUSD(activePrice)})</span>
        </div>
      </div>
    </div>
  );
}
