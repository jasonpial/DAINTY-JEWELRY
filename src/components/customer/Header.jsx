import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, ChevronDown, ChevronRight, Heart, Lock, X } from 'lucide-react';
import { navigateTo } from '../../Router';
import { categories } from '../../db';

// The two primary material groups
const MATERIALS = [
  {
    id: 'Stainless Steel',
    label: 'Stainless Steel',
    icon: '⚙️',
    sub: 'Crystal flatbacks, studs & chains',
  },
  {
    id: 'Titanium',
    label: 'Titanium',
    icon: '💫',
    sub: 'Rings, couples & sets',
  },
];

export default function Header({ cartCount, currentRoute }) {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'shop_by' | null
  const [expandedMaterial, setExpandedMaterial] = useState(null); // 'Stainless Steel' | 'Titanium' | null
  const headerRef = useRef(null);

  const activePage = currentRoute.page;

  // Toggle main dropdown
  const toggleDropdown = (name, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (activeDropdown === name) {
      setActiveDropdown(null);
      setExpandedMaterial(null);
    } else {
      setActiveDropdown(name);
      setExpandedMaterial(null);
    }
  };

  // Click a material card — expand its category list (don't navigate yet)
  const handleMaterialExpand = (materialId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMaterial(expandedMaterial === materialId ? null : materialId);
  };

  // Click a category under an expanded material → navigate with both filters
  const handleCategorySelect = (materialId, categoryId, e) => {
    e.preventDefault();
    navigateTo('shop', { material: materialId, category: categoryId });
    setActiveDropdown(null);
    setExpandedMaterial(null);
  };

  // Gender / Occasion quick filters
  const handleShopByClick = (type, val) => {
    navigateTo('shop', { [type]: val });
    setActiveDropdown(null);
    setExpandedMaterial(null);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setExpandedMaterial(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const shopByActive =
    activePage === 'shop' &&
    (currentRoute.params.material || currentRoute.params.gender || currentRoute.params.occasion);

  return (
    <header className="site-header-container" ref={headerRef}>
      {/* ── Row 1: Logo, Search Bar, Right Actions ── */}
      <div className="header-middle-row">
        <a href="#" className="header-logo-link" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>
          <img src="/images/logo-image.png" alt="DAINTY" className="brand-logo-img" />
        </a>

        {/* Search Bar */}
        <div className="header-search-bar">
          <select
            className="search-category-select"
            defaultValue="all"
            onChange={(e) => {
              const val = e.target.value;
              if (val !== 'all') navigateTo('shop', { category: val });
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
              if (e.key === 'Enter' && e.target.value.trim())
                navigateTo('shop', { q: e.target.value.trim() });
            }}
          />
          <button
            className="search-btn"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling;
              if (input && input.value.trim()) navigateTo('shop', { q: input.value.trim() });
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="header-middle-right-actions">
          <button className="middle-wishlist-btn" onClick={() => navigateTo('shop', { collection: 'best_sellers' })} title="Wishlist">
            <Heart size={20} />
          </button>
          <button className="middle-cart-btn cart-gold-btn" onClick={() => navigateTo('cart')} title="Shopping Bag">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge-gold">{cartCount}</span>}
          </button>
          <button className="header-lock-btn" onClick={() => navigateTo('admin')} title="Admin Portal Login">
            <Lock size={18} />
          </button>
        </div>
      </div>

      {/* ── Row 2: Gold Navigation Row ── */}
      <div className="header-nav-row-gold">
        <div className="nav-row-inner">
          <div className="nav-links-left">

            {/* HOME */}
            <a
              href="#"
              className={`gold-nav-item ${activePage === 'home' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
            >
              HOME
            </a>

            {/* SHOP BY — two-step material → category dropdown */}
            <div className="gold-nav-dropdown">
              <a
                href="#/shop"
                className={`gold-nav-item ${shopByActive ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('shop_by', e)}
              >
                SHOP BY <ChevronDown size={11} style={{ marginLeft: 2 }} />
              </a>

              <div className={`dropdown-menu shop-by-menu ${activeDropdown === 'shop_by' ? 'show' : ''}`}>

                {/* ═══ STEP 1: Material Selection ═══ */}
                <div className="dropdown-section-label">BY MATERIAL — Choose a collection</div>

                {MATERIALS.map((mat) => (
                  <div key={mat.id}>
                    {/* Material row — click to expand categories */}
                    <button
                      className={`dropdown-material-item dropdown-material-btn ${expandedMaterial === mat.id ? 'material-expanded' : ''}`}
                      onClick={(e) => handleMaterialExpand(mat.id, e)}
                      type="button"
                    >
                      <span className="dropdown-material-icon">{mat.icon}</span>
                      <span className="dropdown-material-text">
                        <strong>{mat.label}</strong>
                        <small>{mat.sub}</small>
                      </span>
                      <ChevronRight
                        size={13}
                        className="material-chevron"
                        style={{
                          transform: expandedMaterial === mat.id ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          marginLeft: 'auto',
                          flexShrink: 0,
                          opacity: 0.6,
                        }}
                      />
                    </button>

                    {/* ═══ STEP 2: Category list (expands under the selected material) ═══ */}
                    {expandedMaterial === mat.id && (
                      <div className="material-categories-panel">
                        <div className="material-categories-header">
                          {mat.icon} {mat.label} — Pick a Category
                        </div>

                        {/* Full Collection shortcut */}
                        <a
                          href="#"
                          className="material-cat-item material-cat-all"
                          onClick={(e) => { e.preventDefault(); navigateTo('shop', { material: mat.id }); setActiveDropdown(null); setExpandedMaterial(null); }}
                        >
                          ✨ Full Collection
                        </a>

                        {/* All 9 categories */}
                        {categories.map((cat) => (
                          <a
                            key={cat.id}
                            href="#"
                            className="material-cat-item"
                            onClick={(e) => handleCategorySelect(mat.id, cat.id, e)}
                          >
                            <span className="material-cat-icon">{cat.icon}</span>
                            <span>{cat.name}</span>
                            <span className="material-cat-arrow">▸</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* ═══ BY GENDER ═══ */}
                <div className="dropdown-section-label" style={{ marginTop: '0.4rem' }}>BY GENDER</div>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('gender', 'Women'); }}>Women</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('gender', 'Men'); }}>Men</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('gender', 'Unisex'); }}>Unisex</a>

                {/* ═══ BY OCCASION ═══ */}
                <div className="dropdown-section-label" style={{ marginTop: '0.4rem' }}>BY OCCASION</div>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', 'Wedding'); }}>Wedding</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', 'Engagement'); }}>Engagement</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', 'Birthday'); }}>Birthday</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', 'Gift'); }}>Gifts &amp; Hampers</a>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleShopByClick('occasion', "Valentine's"); }}>Valentine's</a>
              </div>
            </div>

            {/* CONTACT */}
            <a
              href="#"
              className={`gold-nav-item ${activePage === 'contact' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}
            >
              CONTACT
            </a>
          </div>

          {/* Desktop Right Actions */}
          <div className="nav-links-right-gold">
            <button className="gold-nav-icon-btn" onClick={() => navigateTo('shop', { collection: 'best_sellers' })} title="Wishlist">
              <Heart size={20} />
            </button>
            <button className="gold-nav-icon-btn cart-gold-btn" onClick={() => navigateTo('cart')} title="Shopping Bag">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge-gold">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
