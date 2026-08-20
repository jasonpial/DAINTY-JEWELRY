import { useState, useEffect } from 'react';
import HeroSlideshow from './HeroSlideshow';
import ProductCard from './ProductCard';
import { getProducts, categories, subcategories } from '../../db';
import { navigateTo } from '../../Router';
import { priceRanges } from './FilterSidebar';
import { Sparkles, Eye, ShoppingBag, SlidersHorizontal, RotateCcw } from 'lucide-react';

// Advanced Local Search Engine supporting horizontal parameters
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
    list = list.filter(p => p.material.toLowerCase().includes(routeParams.material.toLowerCase()));
  }

  // 5. Dashboard Filters (Multi-select)
  if (filters.material && filters.material.length > 0) {
    list = list.filter(p => filters.material.includes(p.material));
  }

  if (filters.gender && filters.gender.length > 0) {
    list = list.filter(p => filters.gender.includes(p.gender));
  }

  if (filters.occasion && filters.occasion.length > 0) {
    list = list.filter(p => filters.occasion.includes(p.occasion));
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
          product.name.toLowerCase().includes(word) ||
          product.description.toLowerCase().includes(word) ||
          product.category_id.toLowerCase().includes(word) ||
          product.subcategory_id.toLowerCase().includes(word) ||
          product.material.toLowerCase().includes(word) ||
          product.color.toLowerCase().includes(word) ||
          product.gender.toLowerCase().includes(word) ||
          product.occasion.toLowerCase().includes(word)
        );
      });
    });
  }

  return list;
}

export default function ShopView({ routeParams, onAddToBag }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [searchVal, setSearchVal] = useState(routeParams.q || '');
  
  // Custom Min/Max price states (temp values before apply)
  const [priceMinInput, setPriceMinInput] = useState('');
  const [priceMaxInput, setPriceMaxInput] = useState('');

  // Local state filters
  const [filters, setFilters] = useState({
    material: [],
    priceRanges: [],
    gender: [],
    occasion: [],
    customPriceMin: '',
    customPriceMax: ''
  });

  // Load products list
  useEffect(() => {
    const data = getProducts();
    setProducts(data);
    setActiveSubcat(null);
  }, [routeParams.category, routeParams.collection, routeParams.gender, routeParams.occasion, routeParams.material]);

  // Sync search input
  useEffect(() => {
    setSearchVal(routeParams.q || '');
  }, [routeParams.q]);

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

  // Handle category shape toggle
  const handleCategorySelect = (catId) => {
    if (routeParams.category === catId) {
      // Toggle off to show full collection
      navigateTo('shop', { ...routeParams, category: undefined });
    } else {
      navigateTo('shop', { ...routeParams, category: catId });
    }
    setActiveSubcat(null);
  };

  // Toggle filter chip options
  const handleToggleFilter = (group, value) => {
    const current = filters[group] || [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter(v => v !== value);
    } else {
      updated = [...current, value];
    }
    setFilters(prev => ({ ...prev, [group]: updated }));
  };

  // Apply inputs and filters
  const handleApplyHorizontalFilters = () => {
    setFilters(prev => ({
      ...prev,
      customPriceMin: priceMinInput,
      customPriceMax: priceMaxInput
    }));
    if (searchVal.trim()) {
      navigateTo('shop', { ...routeParams, q: searchVal.trim() || undefined });
    }
  };

  // Reset all horizontal filters
  const handleResetFilters = () => {
    setFilters({
      material: [],
      priceRanges: [],
      gender: [],
      occasion: [],
      customPriceMin: '',
      customPriceMax: ''
    });
    setPriceMinInput('');
    setPriceMaxInput('');
    setActiveSubcat(null);
    setSearchVal('');
    navigateTo('shop', {});
  };

  const getPageTitle = () => {
    if (routeParams.q) return `Search Results for "${routeParams.q}"`;
    if (routeParams.category) {
      return routeParams.category.charAt(0).toUpperCase() + routeParams.category.slice(1);
    }
    if (routeParams.collection) {
      const parts = routeParams.collection.split('_');
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    if (routeParams.gender) return `${routeParams.gender}'s Jewelry`;
    if (routeParams.occasion) return `${routeParams.occasion} Collection`;
    if (routeParams.material) return `${routeParams.material} Jewelry`;
    return 'Full Collection';
  };

  // Check subcategory options mapping for active category
  const activeSubcats = routeParams.category 
    ? subcategories.filter(sub => sub.categoryId === routeParams.category)
    : [];

  const shouldShowHero = !routeParams.category && 
                       !routeParams.collection && 
                       !routeParams.gender && 
                       !routeParams.occasion && 
                       !routeParams.q;

  return (
    <div className="shop-view">
      {/* Category or Default Slideshow Hero */}
      {shouldShowHero && (
        <HeroSlideshow 
          category={routeParams.category} 
          collection={routeParams.collection} 
        />
      )}

      {/* Horizontal Dashboard-style layout below the Hero */}
      <div className="shop-layout" style={{ marginTop: shouldShowHero ? '3rem' : '1.5rem' }}>
        


        {/* Clean White Catalogue Grid Section (corresponds to BEST SELLER layout) */}
        <div className="shop-content-horizontal">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.8rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-luxury)', color: 'var(--color-brown-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {getPageTitle()}
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'creation' : 'creations'} found
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid animate-fade-in">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToBag={onAddToBag} 
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: '6rem 2rem', textAlign: 'center', background: '#faf8f5', borderRadius: '8px', border: '1px dashed var(--color-border-gold)', margin: '2rem 0' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-brown-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>No Products Found</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                We couldn't find any products matching your specific combinations. Try resetting filters or using simpler search words.
              </p>
              <button className="btn-primary" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
