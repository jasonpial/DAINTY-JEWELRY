import { useState } from 'react';
import { ShoppingBag, Menu, X, ChevronDown, ShieldAlert, Gem, Lock } from 'lucide-react';
import { navigateTo } from '../../Router';
import { categories } from '../../db';

export default function Header({ cartCount, currentRoute }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (catId) => {
    navigateTo('shop', { category: catId });
    setMobileMenuOpen(false);
  };

  const handleCollectionClick = (collId) => {
    navigateTo('shop', { collection: collId });
    setMobileMenuOpen(false);
  };

  const handleShopByClick = (type, val) => {
    navigateTo('shop', { [type]: val });
    setMobileMenuOpen(false);
  };

  const activePage = currentRoute.page;

  const isShopParamsActive = currentRoute.page === 'shop' && (
    currentRoute.params.category ||
    currentRoute.params.collection ||
    currentRoute.params.gender ||
    currentRoute.params.occasion ||
    currentRoute.params.q
  );
  
  // Header is transparent, sits on dark-theme (on Hero slides) or light-theme (on white pages)
  const isHeroVisible = currentRoute.page === 'home' || (currentRoute.page === 'shop' && !isShopParamsActive);

  return (
    <header className="navbar transparent dark-theme">
      {/* Brand Logo with dynamic styles */}
      <a href="#" className="nav-brand" onClick={() => navigateTo('home')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.65rem' }}>
        <div className="gem-icon-wrapper">
          <Gem size={18} className="gem-icon-color" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="brand-logo-text">DAINTY</span>
          <span className="brand-logo-sub">STUDS & CHAINS</span>
        </div>
      </a>

      {/* Desktop Navigation Links */}
      <nav className="nav-links">
        <a 
          href="#" 
          className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
        >
          Home
        </a>

        {/* Shop Dropdown */}
        <div className="nav-dropdown">
          <a 
            href="#/shop" 
            className={`nav-item ${activePage === 'shop' && currentRoute.params.category ? 'active' : ''}`}
            onClick={(e) => e.preventDefault()}
          >
            Shop <ChevronDown size={12} style={{ marginLeft: 2 }} />
          </a>
          <div className="dropdown-menu">
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

        {/* Collections Dropdown */}
        <div className="nav-dropdown">
          <a 
            href="#/shop" 
            className={`nav-item ${activePage === 'shop' && currentRoute.params.collection ? 'active' : ''}`}
            onClick={(e) => e.preventDefault()}
          >
            Collections <ChevronDown size={12} style={{ marginLeft: 2 }} />
          </a>
          <div className="dropdown-menu">
            <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('new_arrivals'); }}>✨ New Arrivals</a>
            <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('best_sellers'); }}>🔥 Best Sellers</a>
            <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('trending'); }}>📈 Trending</a>
            <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('premium'); }}>👑 Premium Collection</a>
            <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('limited'); }}>💎 Limited Edition</a>
            <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleCollectionClick('sale'); }}>🏷️ Sale & Offers</a>
          </div>
        </div>

        {/* Shop By Dropdown */}
        <div className="nav-dropdown">
          <a 
            href="#/shop" 
            className={`nav-item ${activePage === 'shop' && (currentRoute.params.gender || currentRoute.params.occasion) ? 'active' : ''}`}
            onClick={(e) => e.preventDefault()}
          >
            Shop By <ChevronDown size={12} style={{ marginLeft: 2 }} />
          </a>
          <div className="dropdown-menu">
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
          className={`nav-item ${activePage === 'contact' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}
        >
          Contact
        </a>
      </nav>

      {/* Navigation Actions (Search, Cart, Mobile toggle) */}
      <div className="nav-actions">
        {/* Admin Padlock Icon shortcut in the header */}
        <button 
          className="cart-icon-btn" 
          onClick={() => navigateTo('admin')}
          title="Admin Portal Login"
          style={{ marginRight: '0.2rem' }}
        >
          <Lock size={19} />
        </button>

        {/* Shopping Cart Indicator */}
        <button 
          className="cart-icon-btn" 
          onClick={() => navigateTo('cart')}
          title="Shopping Bag"
        >
          <ShoppingBag size={21} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>

        {/* Mobile menu trigger */}
        <button 
          className="cart-icon-btn mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-fade-in">
          <a href="#" className={`mobile-nav-item ${activePage === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home'); setMobileMenuOpen(false); }}>Home</a>
          
          <div className="mobile-nav-section-title">Shop Categories</div>
          {categories.map(cat => (
            <a 
              key={cat.id} 
              href={`#/shop?category=${cat.id}`}
              className="mobile-nav-itemSub"
              onClick={(e) => { e.preventDefault(); handleCategoryClick(cat.id); }}
            >
              {cat.icon} {cat.name}
            </a>
          ))}
          
          <div className="mobile-nav-section-title">Collections</div>
          <a href="#" className="mobile-nav-itemSub" onClick={(e) => { e.preventDefault(); handleCollectionClick('new_arrivals'); }}>✨ New Arrivals</a>
          <a href="#" className="mobile-nav-itemSub" onClick={(e) => { e.preventDefault(); handleCollectionClick('best_sellers'); }}>🔥 Best Sellers</a>
          <a href="#" className="mobile-nav-itemSub" onClick={(e) => { e.preventDefault(); handleCollectionClick('sale'); }}>🏷️ Sale & Offers</a>
          
          <a href="#" className={`mobile-nav-item ${activePage === 'contact' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('contact'); setMobileMenuOpen(false); }}>Contact Us</a>
          
          <a href="#" className="mobile-nav-item" style={{ color: 'var(--color-gold-primary)', borderTop: '1px solid var(--color-border-light)', marginTop: '0.8rem', paddingTop: '0.8rem' }} onClick={(e) => { e.preventDefault(); navigateTo('admin'); setMobileMenuOpen(false); }}>🔑 Admin Gate</a>
        </div>
      )}
    </header>
  );
}
