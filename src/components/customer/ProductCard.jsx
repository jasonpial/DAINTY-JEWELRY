import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [slideshowInterval] = useState(() => Math.floor(Math.random() * (5000 - 2400 + 1)) + 2400);

  const cardRef = useRef(null);

  useEffect(() => {
    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }, slideshowInterval);

    return () => clearInterval(interval);
  }, [validImages.length, slideshowInterval]);

  const isSale = sale_price && sale_price < price;
  const isOutOfStock = stock_quantity <= 0;

  // Badge text determination matching screenshot
  let badgeText = null;
  if (new_arrival) badgeText = 'NEW';
  else if (best_seller) badgeText = 'BEST SELLER';
  else if (clearance) badgeText = 'SALE';
  else if (limited_edition) badgeText = 'LIMITED';

  const handleDetailsClick = () => {
    navigateTo('product', { id });
  };

  const handleAddToBagClick = (e) => {
    e.stopPropagation();
    if (!isOutOfStock && onAddToBag) {
      onAddToBag(product);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(prev => !prev);
  };

  return (
    <div 
      ref={cardRef}
      className="dainty-product-card"
      onClick={handleDetailsClick} 
    >
      {/* Warm beige image wrapper box */}
      <div className="dainty-card-img-box">
        {/* Top-left Pill Badge */}
        {badgeText && (
          <span className="dainty-card-badge">{badgeText}</span>
        )}

        {/* Top-right Wishlist Heart Button */}
        <button 
          className={`dainty-card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          type="button"
        >
          <Heart size={15} fill={isWishlisted ? "#b91c1c" : "none"} color={isWishlisted ? "#b91c1c" : "#222222"} strokeWidth={2} />
        </button>

        {/* Auto-slideshow Product Images */}
        {validImages.map((imgUrl, index) => (
          <img 
            key={index}
            src={imgUrl} 
            alt={`${name} view ${index + 1}`} 
            className="dainty-card-img" 
            style={{ 
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: index === currentImageIndex ? 2 : 1
            }}
            loading="lazy" 
          />
        ))}
      </div>

      {/* Content below image container */}
      <div className="dainty-card-body">
        <h3 className="dainty-card-title" title={name}>{name}</h3>
        
        <div className="dainty-card-price">
          {isSale ? (
            <div className="price-container">
              <span className="price-active">{formatUGX(sale_price)}</span>
              <span className="price-slashed">{formatUGX(price)}</span>
            </div>
          ) : (
            <span className="price-active">{formatUGX(price)}</span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="dainty-card-actions">
          <button 
            className="dainty-btn-cart-text"
            onClick={handleAddToBagClick}
            disabled={isOutOfStock}
            type="button"
          >
            {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>
          
          <button 
            className="dainty-btn-cart-icon"
            onClick={handleAddToBagClick}
            disabled={isOutOfStock}
            title="Add to Cart"
            type="button"
          >
            <ShoppingBag size={16} color="#ffffff" />
          </button>
        </div>
      </div>
    </div>
  );
}
