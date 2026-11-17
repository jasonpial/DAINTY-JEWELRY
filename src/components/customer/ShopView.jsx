import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getProducts, categories } from '../../db';
import { navigateTo } from '../../Router';
import { priceRanges } from './FilterSidebar';
import { Sparkles, SlidersHorizontal, RotateCcw } from 'lucide-react';

// Advanced Local Search Engine supporting collection parameters
function searchAndFilterProducts(products, query, routeParams, filters, activeSubcat) {
  let list = [...products];

  // 1. Category Filter (toggled by Shape boxes or url)
  if (routeParams.category) {
    list = list.filter(p => p.category_id === routeParams.category);
  }

  // 2. Subcategory Filter
  const subcat = activeSubcat || routeParams.subcategory;
  if (subcat) {
    list = list.filter(p => p.subcategory_id === subcat);
  }

  // 3. Collection Filter
  if (routeParams.collection) {
    const coll = routeParams.collection;
    if (coll === 'new_arrivals') {
      list = list.filter(p => p.new_arrival);
    } else if (coll === 'best_sellers') {
      list = list.filter(p => p.best_seller);
    } else if (coll === 'trending') {
      list = list.filter(p => p.featured);
    } else if (coll === 'premium') {
      list = list.filter(p => p.limited_edition || p.price >= 200000);
    } else if (coll === 'limited') {
      list = list.filter(p => p.limited_edition);
    } else if (coll === 'sale') {
      list = list.filter(p => p.sale_price && p.sale_price < p.price);
    }
  }

  // 4. URL Attribute Filters
  if (routeParams.gender) {
    list = list.filter(p => p.gender === routeParams.gender);
  }
  if (routeParams.occasion) {
    list = list.filter(p => p.occasion === routeParams.occasion);
  }
  if (routeParams.material) {
    list = list.filter(p => p.material && p.material.toLowerCase().includes(routeParams.material.toLowerCase()));
  }
  if (routeParams.piercing) {
    const pTarget = routeParams.piercing.toLowerCase();
    list = list.filter(p => {
      const pField = (p.piercing_location || p.piercing || p.subcategory_id || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const pTags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
      if (pTarget === 'body jewelry') {
        return p.category_id === 'body' || pField.includes('body') || pDesc.includes('body') || pTags.includes('body');
      }
      if (pTarget.includes('helix') || pTarget.includes('cartilage')) {
        return pField.includes('helix') || pField.includes('cartilage') || pName.includes('helix') || pName.includes('cartilage') || pDesc.includes('cartilage') || pTags.includes('cartilage');
      }
      if (pTarget.includes('lobe')) {
        return pField.includes('lobe') || pName.includes('lobe') || pDesc.includes('lobe') || pTags.includes('lobe') || p.category_id === 'earrings';
      }
      return pField.includes(pTarget) || pName.includes(pTarget) || pDesc.includes(pTarget) || pTags.includes(pTarget);
    });
  }

  // 5. Multi-select Filters
  if (filters.material && filters.material.length > 0) {
    list = list.filter(p => p.material && filters.material.includes(p.material));
  }
  if (filters.gender && filters.gender.length > 0) {
    list = list.filter(p => p.gender && filters.gender.includes(p.gender));
  }
  if (filters.occasion && filters.occasion.length > 0) {
    list = list.filter(p => p.occasion && filters.occasion.includes(p.occasion));
  }

  // Custom Price Input Ranges
  if (filters.customPriceMin !== '') {
    list = list.filter(p => (p.sale_price || p.price) >= Number(filters.customPriceMin));
  }
  if (filters.customPriceMax !== '') {
    list = list.filter(p => (p.sale_price || p.price) <= Number(filters.customPriceMax));
  }

  // Preset Price Range Filters
  if (filters.priceRanges && filters.priceRanges.length > 0) {
    list = list.filter(p => {
      const activePrice = p.sale_price || p.price;
      return filters.priceRanges.some(rangeId => {
        const range = priceRanges.find(r => r.id === rangeId);
        if (!range) return false;
        return activePrice >= range.min && activePrice <= range.max;
      });
    });
  }

  // 6. Search Bar Queries
  if (query) {
    const q = query.toLowerCase();

    // Parse "under XXXXX"
    let maxPriceLimit = null;
    const underMatch = q.match(/under\s+(\d+[\d,]*)(k)?/i);
    if (underMatch) {
      let numStr = underMatch[1].replace(/,/g, '');
      let num = parseInt(numStr, 10);
      const isK = underMatch[2];
      if (isK) num *= 1000;
      maxPriceLimit = num;
    }

    let cleanQ = q;
    if (underMatch) {
      cleanQ = q.replace(underMatch[0], '').trim();
    }

    list = list.filter(product => {
      const activePrice = product.sale_price || product.price;
      if (maxPriceLimit && activePrice > maxPriceLimit) {
        return false;
      }

      if (!cleanQ) return true;

      const words = cleanQ.split(/\s+/).filter(w => w.length > 0);
      return words.every(word => {
        return (
          (product.name && product.name.toLowerCase().includes(word)) ||
          (product.description && product.description.toLowerCase().includes(word)) ||
          (product.category_id && product.category_id.toLowerCase().includes(word)) ||
          (product.subcategory_id && product.subcategory_id.toLowerCase().includes(word)) ||
          (product.material && product.material.toLowerCase().includes(word)) ||
          (product.color && product.color.toLowerCase().includes(word)) ||
          (product.gender && product.gender.toLowerCase().includes(word)) ||
          (product.occasion && product.occasion.toLowerCase().includes(word))
        );
      });
    });
  }

  // Ensure newest creations appear first
  return list.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });
}

export default function ShopView({ routeParams, onAddToBag }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    material: [],
    priceRanges: [],
    gender: [],
    occasion: [],
    customPriceMin: '',
    customPriceMax: ''
  });

  // Load products list and subscribe to real-time database changes
  useEffect(() => {
    const loadData = () => {
      const data = getProducts();
      setProducts(data);
    };
    loadData();
    setActiveSubcat(null);

    window.addEventListener('storage', loadData);
    window.addEventListener('dainty_products_changed', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('dainty_products_changed', loadData);
    };
  }, [routeParams.category, routeParams.collection, routeParams.gender, routeParams.occasion, routeParams.material]);

  // Sync filtered list
  useEffect(() => {
    const list = searchAndFilterProducts(
      products,
      routeParams.q || '',
      routeParams,
      filters,
      activeSubcat
    );
    setFilteredProducts(list);
  }, [products, routeParams, filters, activeSubcat]);

  // Handle category tab change
  const handleCategoryTab = (catId) => {
    if (catId === 'all') {
      navigateTo('shop', {});
    } else {
      navigateTo('shop', { category: catId });
    }
    setActiveSubcat(null);
  };

  const handleResetFilters = () => {
    setFilters({
      material: [],
      priceRanges: [],
      gender: [],
      occasion: [],
      customPriceMin: '',
      customPriceMax: ''
    });
    setActiveSubcat(null);
    navigateTo('shop', {});
  };

  const getPageTitle = () => {
    if (routeParams.q) return `Search: "${routeParams.q}"`;
    if (routeParams.material && routeParams.category) {
      const cat = categories.find(c => c.id === routeParams.category);
      return `${routeParams.material} · ${cat ? cat.name : routeParams.category}`;
    }
    if (routeParams.category) {
      const cat = categories.find(c => c.id === routeParams.category);
      return cat ? cat.name : routeParams.category;
    }
    if (routeParams.collection) {
      const map = {
        new_arrivals: 'New Arrivals',
        best_sellers: 'Best Sellers',
        trending: 'Trending Pieces',
        premium: 'Premium Collection',
        sale: 'Special Offers'
      };
      return map[routeParams.collection] || 'Collection';
    }
    if (routeParams.piercing) return `${routeParams.piercing} Piercing Jewelry`;
    if (routeParams.gender) return `${routeParams.gender}'s Jewelry`;
    if (routeParams.occasion) return `${routeParams.occasion} Collection`;
    if (routeParams.material) return `${routeParams.material} Series`;
    return 'COLLECTIONS';
  };

  const currentCategory = routeParams.category || 'all';

  return (
    <div className="dainty-shop-view dainty-home-container">
      {/* 1. Collection Header matching attached photo */}
      <div className="dainty-collection-page-header">
        <div className="dainty-section-header-centered">
          <span className="dainty-eyebrow-text">
            <Sparkles size={13} className="eyebrow-icon" />
            Kampala High Jewelry
          </span>
          <h1 className="dainty-page-title">{getPageTitle()}</h1>
          <div className="dainty-title-accent-line"></div>
          <p className="dainty-page-subtitle">
            Tarnish-resistant, water-friendly 18K gold-plated studs, chains, promise rings, and bracelets.
          </p>
        </div>

        {/* 2. Interactive Category Tabs Bar */}
        <div className="dainty-category-tabs-scroll">
          <div className="dainty-category-tabs-inner">
            <button
              className={`dainty-cat-tab-btn ${currentCategory === 'all' && !routeParams.collection ? 'active' : ''}`}
              onClick={() => handleCategoryTab('all')}
            >
              All Series
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`dainty-cat-tab-btn ${currentCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryTab(cat.id)}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Filter and Count Toolbar */}
        <div className="dainty-catalog-toolbar">
          <div className="toolbar-count">
            Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'piece' : 'pieces'}
          </div>

          <div className="toolbar-actions">
            {(routeParams.category || routeParams.collection || routeParams.q || routeParams.material) && (
              <button className="toolbar-reset-btn" onClick={handleResetFilters}>
                <RotateCcw size={13} />
                <span>Reset View</span>
              </button>
            )}
            <button
              className="toolbar-filter-btn"
              onClick={() => setShowFiltersModal(!showFiltersModal)}
            >
              <SlidersHorizontal size={14} />
              <span>Filter By Price / Occasion</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Drawer / Accordion */}
        {showFiltersModal && (
          <div className="dainty-filters-drawer animate-fade-in">
            <div className="filters-drawer-grid">
              {/* Occasion */}
              <div>
                <h4 className="drawer-col-title">Occasion</h4>
                <div className="drawer-tags-wrap">
                  {['Everyday', 'Wedding', 'Engagement', 'Birthday', 'Gift', "Valentine's"].map((occ) => (
                    <button
                      key={occ}
                      className={`drawer-chip ${routeParams.occasion === occ ? 'active' : ''}`}
                      onClick={() => navigateTo('shop', { ...routeParams, occasion: routeParams.occasion === occ ? undefined : occ })}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <h4 className="drawer-col-title">Material</h4>
                <div className="drawer-tags-wrap">
                  {['Gold-Plated', 'Stainless Steel', 'Titanium', 'Sterling Silver'].map((mat) => (
                    <button
                      key={mat}
                      className={`drawer-chip ${routeParams.material === mat ? 'active' : ''}`}
                      onClick={() => navigateTo('shop', { ...routeParams, material: routeParams.material === mat ? undefined : mat })}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <h4 className="drawer-col-title">Recipient</h4>
                <div className="drawer-tags-wrap">
                  {['Women', 'Men', 'Unisex'].map((g) => (
                    <button
                      key={g}
                      className={`drawer-chip ${routeParams.gender === g ? 'active' : ''}`}
                      onClick={() => navigateTo('shop', { ...routeParams, gender: routeParams.gender === g ? undefined : g })}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. The 4-Column Desktop / 2-Column Mobile Grid matching photo */}
      <div className="dainty-catalog-grid-wrap">
        {filteredProducts.length > 0 ? (
          <div className="dainty-responsive-grid-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToBag={onAddToBag}
              />
            ))}
          </div>
        ) : (
          <div className="dainty-empty-catalog">
            <Sparkles size={36} className="empty-icon" />
            <h3 className="empty-title">No Jewelry Matches Your Selection</h3>
            <p className="empty-text">
              We couldn't find items with those exact filters. Reset your filters to explore our full handcrafted collection.
            </p>
            <button className="btn-primary" onClick={handleResetFilters}>
              Explore Full Collection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
