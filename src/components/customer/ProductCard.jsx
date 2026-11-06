import { useState } from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
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
    stock_quantity,
    images = [],
    material
  } = product;

  // Filter out empty strings or invalid images
  const validImages = (images && images.length > 0)
    ? images.filter(img => img && img.trim() !== '')
    : ['/images/hero_necklaces.png'];

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Consistent rating and review count per product
  const rating = '4.9';
  const reviewCount = ((id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1500) + 850).toLocaleString('en-US');

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
      {/* 1. Image Studio Container Matching three_364bc333.jpg */}
      <div className="dainty-bestselling-img-box">
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

        {/* Full-bleed Product Image filling the entire container */}
        <img
          src={validImages[0]}
          alt={name}
          className="dainty-bestselling-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/hero_rings.png';
          }}
        />

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

      {/* 2. Text Info Block (Matching three_364bc333.jpg) */}
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
