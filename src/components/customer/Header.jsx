import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, ChevronDown, Heart, Lock } from 'lucide-react';
import { navigateTo } from '../../Router';
import { categories } from '../../db';

export default function Header({ cartCount, currentRoute }) {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'shop', 'collection', 'shop_by', or null
  const headerRef = useRef(null);

  const handleCategoryClick = (catId) => {
    navigateTo('shop', { category: catId });
    setActiveDropdown(null);
  };

  const handleCollectionClick = (collId) => {
    navigateTo('shop', { collection: collId });
    setActiveDropdown(null);
  };

  const handleShopByClick = (type, val) => {
    navigateTo('shop', { [type]: val });
    setActiveDropdown(null);
  };

  const activePage = currentRoute.page;

  // Toggle active dropdown state on click/tap
  const toggleDropdown = (name, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Close dropdowns when clicking anywhere outside the header
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className="site-header-container" ref={headerRef}>
      {/* Row 1: Logo, Search Bar, and Right Actions */}
      <div className="header-middle-row">
        <a href="#" className="header-logo-link" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>
          <img 
            src="/images/logo-image.png" 
            alt="DAINTY" 
            className="brand-logo-img" 
          />
        </a>

        {/* Unified Search Bar (situated between Logo and Actions) */}
        <div className="header-search-bar">
          <select 
            className="search-category-select" 
            defaultValue="all"
            onChange={(e) => {
              const val = e.target.value;
              if (val !== 'all') {
                navigateTo('shop', { category: val });
              }
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Enter your search key..." 
            className="search-input" 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigateTo('shop', { q: e.target.value.trim() });
              }
            }}
          />
          <button 
            className="search-btn"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling;
              if (input && input.value.trim()) {
                navigateTo('shop', { q: input.value.trim() });
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
        </div>

        {/* Actions Container */}
        <div className="header-middle-right-actions">
          {/* Wishlist Button (hidden on desktop, visible on mobile) */}
          <button 
            className="middle-wishlist-btn" 
            onClick={() => navigateTo('shop', { collection: 'best_sellers' })} 
            title="Wishlist"
          >
            <Heart size={20} />
          </button>

          {/* Cart Button (hidden on desktop, visible on mobile) */}
          <button 
            className="middle-cart-btn cart-gold-btn" 
            onClick={() => navigateTo('cart')} 
            title="Shopping Bag"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge-gold">{cartCount}</span>}
          </button>

          {/* Admin Padlock Lock */}
          <button 
            className="header-lock-btn" 
            onClick={() => navigateTo('admin')}
            title="Admin Portal Login"
          >
            <Lock size={18} />
          </button>
        </div>
      </div>

      {/* Row 2: Gold Navigation Row (visible on desktop and mobile) */}
      <div className="header-nav-row-gold">
        <div className="nav-row-inner">
          <div className="nav-links-left">
            <a 
              href="#" 
              className={`gold-nav-item ${activePage === 'home' ? 'active' : ''}`} 
              onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
            >
              HOME
            </a>
            
            {/* SHOP Dropdown */}
            <div className="gold-nav-dropdown">
              <a 
                href="#/shop" 
                className={`gold-nav-item ${activePage === 'shop' && currentRoute.params.category ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('shop', e)}
              >
                SHOP <ChevronDown size={11} style={{ marginLeft: 2 }} />
              </a>
              <div className={`dropdown-menu ${activeDropdown === 'shop' ? 'show' : ''}`}>
                {categories.map(cat => (
                  <a 
                    key={cat.id} 
                    href={`#/shop?category=${cat.id}`}
                    className="dropdown-item"
                    onClick={(e) => { e.preventDefault(); handleCategoryClick(cat.id); }}
                  >
                    {cat.icon} {cat.name}
                  </a>
                ))}
              </div>
            </div>

            {/* COLLECTION Dropdown */}
            <div className="gold-nav-dropdown">
              <a 
                href="#/shop" 
                className={`gold-nav-item ${activePage === 'shop' && currentRoute.params.collection ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('collection', e)}
              >
                COLLECTION <ChevronDown size={11} style={{ marginLeft: 2 }} />
              </a>
              <div className={`dropdown-menu ${activeDropdown === 'collection' ? 'show' : ''}`}>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('new_arrivals'); }}>✨ New Arrivals</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('best_sellers'); }}>🔥 Best Sellers</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('trending'); }}>📈 Trending</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('premium'); }}>👑 Premium Collection</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('limited'); }}>💎 Limited Edition</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('sale'); }}>🏷️ Sale & Offers</a>
              </div>
            </div>

            {/* SHOP BY Dropdown */}
            <div className="gold-nav-dropdown">
              <a 
                href="#/shop" 
                className={`gold-nav-item ${activePage === 'shop' && (currentRoute.params.gender || currentRoute.params.occasion) ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('shop_by', e)}
              >
                SHOP BY <ChevronDown size={11} style={{ marginLeft: 2 }} />
              </a>
              <div className={`dropdown-menu ${activeDropdown === 'shop_by' ? 'show' : ''}`}>
                <div style={{ padding: '0.4rem 1.2rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-gold-dark)', borderBottom: '1px solid var(--color-border-light)' }}>BY GENDER</div>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('gender', 'Women'); }}>Women</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('gender', 'Men'); }}>Men</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('gender', 'Unisex'); }}>Unisex</a>
                <div style={{ padding: '0.4rem 1.2rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-gold-dark)', borderBottom: '1px solid var(--color-border-light)', marginTop: '0.4rem' }}>BY OCCASION</div>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', 'Wedding'); }}>Wedding</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', 'Engagement'); }}>Engagement</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', 'Birthday'); }}>Birthday</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', 'Gift'); }}>Gifts & Hampers</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', "Valentine's"); }}>Valentine's</a>
              </div>
            </div>

            <a 
              href="#" 
              className={`gold-nav-item ${activePage === 'contact' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}
            >
              CONTACT
            </a>
          </div>

          {/* Desktop-only Gold Row Right Actions (hidden on mobile layout) */}
          <div className="nav-links-right-gold">
            <button 
              className="gold-nav-icon-btn" 
              onClick={() => navigateTo('shop', { collection: 'best_sellers' })} 
              title="Wishlist"
            >
              <Heart size={20} />
            </button>
            <button 
              className="gold-nav-icon-btn cart-gold-btn" 
              onClick={() => navigateTo('cart')} 
              title="Shopping Bag"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge-gold">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
