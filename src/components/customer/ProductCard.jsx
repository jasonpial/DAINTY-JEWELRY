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
    images,
    new_arrival,
    best_seller,
    limited_edition,
    clearance
  } = product;

  const mainImage = images[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80';
  const hoverImage = images[1] || mainImage;
  const isSale = sale_price && sale_price < price;
  const isOutOfStock = stock_quantity <= 0;

  // Determine badge text
  let badgeText = '';
  if (new_arrival) badgeText = 'New';
  else if (best_seller) badgeText = 'Best Seller';
  else if (limited_edition) badgeText = 'Limited';
  else if (clearance) badgeText = 'Clearance';

  const handleDetailsClick = () => {
    navigateTo('product', { id });
  };

  const handleAddToBagClick = (e) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      onAddToBag(product);
    }
  };

  return (
    <div className="product-card" onClick={handleDetailsClick} style={{ cursor: 'pointer' }}>
      <div className="product-img-wrapper">
        {/* Badges */}
        {badgeText && <span className="product-badge">{badgeText}</span>}
        {isSale && <span className="product-sale-badge">Sale</span>}
        
        {/* Images */}
        <img src={mainImage} alt={name} className="product-img" loading="lazy" />
        <img src={hoverImage} alt={`${name} hover`} className="product-img-secondary" loading="lazy" />

        {/* Action overlay is now hidden in CSS, but removed here to avoid HTML clutter */}
      </div>

      <div className="product-info">
        <span className="product-info-cat">{category_id}</span>
        <h3 className="product-info-name" title={name}>{name}</h3>
        
        <div className="product-info-price" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {isSale ? (
            <div>
              <span className="price-sale" style={{ marginRight: '0.4rem' }}>{formatUGX(sale_price)}</span>
              <span className="price-original" style={{ fontSize: '0.8rem' }}>{formatUGX(price)}</span>
              <div className="price-usd">
                ~ {formatUSD(sale_price)} USD
              </div>
            </div>
          ) : (
            <div>
              <span className="price-regular">{formatUGX(price)}</span>
              <div className="price-usd">
                ~ {formatUSD(price)} USD
              </div>
            </div>
          )}
        </div>

        {/* Buttons permanently visible at the bottom of the card details area */}
        <div className="product-card-buttons">
          <button 
            className="card-btn-action-visible card-btn-details-visible"
            onClick={(e) => { e.stopPropagation(); handleDetailsClick(); }}
          >
            <Eye size={12} /> Details
          </button>
          
          {!isOutOfStock ? (
            <button 
              className="card-btn-action-visible card-btn-bag-visible"
              onClick={handleAddToBagClick}
            >
              <ShoppingBag size={12} /> Add to Bag
            </button>
          ) : (
            <button 
              className="card-btn-action-visible" 
              style={{ background: '#78716c', color: 'white', borderColor: '#78716c', cursor: 'not-allowed' }}
              disabled
              onClick={(e) => e.stopPropagation()}
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
