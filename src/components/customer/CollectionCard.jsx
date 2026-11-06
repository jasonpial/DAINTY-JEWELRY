import { ArrowRight } from 'lucide-react';
import { navigateTo } from '../../Router';

export default function CollectionCard({ title, subtitle, image, categoryId, collectionId, occasion, count }) {
  const handleClick = () => {
    if (categoryId) {
      navigateTo('shop', { category: categoryId });
    } else if (collectionId) {
      navigateTo('shop', { collection: collectionId });
    } else if (occasion) {
      navigateTo('shop', { occasion });
    } else {
      navigateTo('shop');
    }
  };

  return (
    <div
      className="dainty-photo-collection-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Studio Image Container */}
      <div className="dainty-photo-img-box">
        {subtitle && (
          <span className="dainty-photo-badge collection-tag">
            {subtitle}
          </span>
        )}
        <div className="dainty-photo-img-inner">
          <img
            src={image}
            alt={title}
            className="dainty-photo-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/hero_necklaces.png';
            }}
          />
        </div>
      </div>

      {/* Label Row: Title on the left, Arrow on the right */}
      <div className="dainty-photo-label-row collection-label-row">
        <div className="collection-title-wrap">
          <h3 className="dainty-photo-title" title={title}>
            {title}
          </h3>
          {count !== undefined && (
            <span className="collection-item-count">{count} {count === 1 ? 'item' : 'items'}</span>
          )}
        </div>
        <span className="dainty-photo-arrow" aria-hidden="true">
          <ArrowRight size={15} className="arrow-icon" />
        </span>
      </div>
    </div>
  );
}
