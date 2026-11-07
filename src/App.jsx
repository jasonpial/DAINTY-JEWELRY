import { useState, useEffect } from 'react';
import { useHashRoute, navigateTo, goBack } from './Router';
import { initDB, getAdminCredentials } from './db';
import Header from './components/customer/Header';
import ChatWidget from './components/customer/ChatWidget';
import HomeView from './components/customer/HomeView';
import ShopView from './components/customer/ShopView';
import ProductDetailView from './components/customer/ProductDetailView';
import CartView from './components/customer/CartView';
import ContactView from './components/customer/ContactView';
import AdminPortal from './components/admin/AdminPortal';
import { Mail, Phone, MapPin, Clock, ChevronLeft } from 'lucide-react';

function App() {
  const route = useHashRoute();
  
  // Initialize Database on mount
  useEffect(() => {
    initDB();
  }, []);

  // Global Cart/Shopping Bag State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('dainty_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('dainty_admin_auth') === 'true';
  });

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('dainty_cart', JSON.stringify(newCart));
  };

  const handleAddToBag = (product) => {
    const qty = product.quantity || 1;
    const colorSelection = product.selectedColor || product.color || 'Gold';
    
    const existingIdx = cart.findIndex(
      item => item.id === product.id && item.selectedColor === colorSelection
    );
    let newCart = [...cart];
    
    if (existingIdx !== -1) {
      newCart[existingIdx].quantity += qty;
    } else {
      newCart.push({
        ...product,
        selectedColor: colorSelection,
        quantity: qty
      });
    }
    
    saveCart(newCart);
    
    // Success Toast Popup
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 2rem;
      background: var(--gradient-gold-metallic);
      color: #000000;
      border: 1px solid var(--color-gold-light);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-size: 0.85rem;
      z-index: 10000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    `;
    toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Added ${qty}x ${product.name} to bag!`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  const handleUpdateQty = (productId, color, newQty) => {
    let newCart = [...cart];
    const idx = newCart.findIndex(item => item.id === productId && item.selectedColor === color);
    if (idx !== -1) {
      if (newQty <= 0) {
        newCart.splice(idx, 1);
      } else {
        newCart[idx].quantity = newQty;
      }
      saveCart(newCart);
    }
  };

  const handleRemoveItem = (productId, color) => {
    const newCart = cart.filter(item => !(item.id === productId && item.selectedColor === color));
    saveCart(newCart);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAdminView = route.page === 'admin';

  return (
    <div className="app-container">
      {/* 1. Header (Hides in admin dashboard to preserve clean fullscreen panel feel) */}
      {!isAdminView && (
        <>
          <Header cartCount={cartCount} currentRoute={route} />
          {/* Universal Back Navigation Bar across every customer view */}
          <div className="universal-back-nav-bar">
            <button
              type="button"
              onClick={() => goBack('home')}
              className="dainty-back-btn"
              title="Go Back to Previous Page"
              aria-label="Go Back to Previous Page"
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2 text-gray-500 font-serif italic text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b38728]"></span>
              <span>DAINTY Atelier Kampala · 18K Gold Plated Jewelry</span>
            </div>
          </div>
        </>
      )}

      {/* Floating Back Navigation Button for customer storefront views */}
      {!isAdminView && (
        <button
          type="button"
          onClick={() => goBack('home')}
          className="dainty-floating-back-btn"
          title="Go Back to Previous Page"
          aria-label="Go Back to Previous Page"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          <span>Back</span>
        </button>
      )}

      {/* 2. Main Page Render */}
      <main className="main-content">
        {route.page === 'home' && (
          <HomeView onAddToBag={handleAddToBag} />
        )}
        
        {route.page === 'shop' && (
          <ShopView routeParams={route.params} onAddToBag={handleAddToBag} />
        )}

        {route.page === 'product' && (
          <ProductDetailView routeParams={route.params} onAddToBag={handleAddToBag} />
        )}

        {route.page === 'cart' && (
          <CartView 
            cart={cart} 
            onUpdateQty={handleUpdateQty} 
            onRemoveItem={handleRemoveItem} 
            onClearCart={handleClearCart} 
          />
        )}

        {route.page === 'contact' && (
          <ContactView />
        )}

        {route.page === 'admin' && (
          !isAdminLoggedIn ? (
            <AdminLoginOnboarding onLoginSuccess={() => setIsAdminLoggedIn(true)} />
          ) : (
            <AdminPortal onLogout={() => {
              sessionStorage.removeItem('dainty_admin_auth');
              setIsAdminLoggedIn(false);
            }} />
          )
        )}
      </main>

      {/* 3. Floating live chat messaging widget (Hides on admin dashboard) */}
      {!isAdminView && (
        <ChatWidget />
      )}

      {/* 4. Footer (Directly Inspired by four.jpeg with Metallic Gold Background & Pure Black Text) */}
      {!isAdminView && (
        <footer className="dainty-site-footer">
          <div className="dainty-footer-content-wrap">
            <div className="dainty-footer-grid">

              {/* Column 1: Luxdiamond-style Brand Column */}
              <div className="dainty-footer-col brand-col">
                <div className="dainty-footer-brand-header">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="brand-diamond-icon">
                    <path d="M6 3h12l4 6-10 12L2 9z" />
                    <path d="M2 9h20" />
                    <path d="M10 3l-2 6 4 12 4-12-2-6" />
                  </svg>
                  <h3 className="dainty-footer-brand-title">DAINTY</h3>
                </div>
                <p className="dainty-footer-brand-desc">
                  Uganda&apos;s premier destination for 18K gold-plated studs, tarnish-resistant chains, promise rings, and luxury jewelry sets. Handcrafted with precision for everyday elegance.
                </p>
              </div>

              {/* Column 2: Company */}
              <div className="dainty-footer-col">
                <h4 className="dainty-footer-heading">Company</h4>
                <ul className="dainty-footer-contact-list">
                  <li>
                    <Phone size={16} className="contact-icon" />
                    <a href="tel:+256788227027">+256 788 227027</a>
                  </li>
                  <li>
                    <Mail size={16} className="contact-icon" />
                    <a href="mailto:info@daintystuds.com">info@daintystuds.com</a>
                  </li>
                  <li>
                    <MapPin size={16} className="contact-icon" />
                    <span>Plot 45, Acacia Ave, Kampala, Uganda</span>
                  </li>
                  <li>
                    <Clock size={16} className="contact-icon" />
                    <span>9:00 AM – 7:30 PM (Mon – Sat)</span>
                  </li>
                </ul>
              </div>

              {/* Column 3: Informations */}
              <div className="dainty-footer-col">
                <h4 className="dainty-footer-heading">Informations</h4>
                <ul className="dainty-footer-links">
                  <li><a href="#/contact" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}>FAQ</a></li>
                  <li><a href="#/contact" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}>Customer Care</a></li>
                  <li><a href="#/contact" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}>Terms &amp; Conditions</a></li>
                  <li><a href="#/shop?collection=best_sellers" onClick={(e) => { e.preventDefault(); navigateTo('shop', { collection: 'best_sellers' }); }}>Testimonials</a></li>
                  <li><a href="#/shop" onClick={(e) => { e.preventDefault(); navigateTo('shop'); }}>Delivery &amp; Exchanges</a></li>
                </ul>
              </div>

              {/* Column 4: Social Media */}
              <div className="dainty-footer-col">
                <h4 className="dainty-footer-heading">Social Media</h4>
                <ul className="dainty-footer-social-list">
                  <li>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      <span>Facebook Page</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                      <span>Official Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://wa.me/256788227027" target="_blank" rel="noopener noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      <span>WhatsApp Direct Order</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-icon">
                        <line x1="12" y1="4" x2="12" y2="20" />
                        <path d="M18 10a6 6 0 0 0-12 0c0 3 2 5.5 5 6.5" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>Official Pinterest</span>
                    </a>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Bottom Bar Aligned Container */}
          <div className="dainty-footer-bottom-bar">
            <div className="dainty-footer-bottom-inner">
              <span className="bottom-copyright">
                © {new Date().getFullYear()} DAINTY STUDS &amp; CHAINS. All Rights Reserved. Handcrafted in Kampala.
              </span>
              <div className="bottom-shortcuts">
                <a
                  href="#/cart"
                  onClick={(e) => { e.preventDefault(); navigateTo('cart'); }}
                  className="bottom-shortcut-link"
                  title="Shopping Bag"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <span>Bag ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})</span>
                </a>
                <a
                  href="#/admin"
                  onClick={(e) => { e.preventDefault(); navigateTo('admin'); }}
                  className="bottom-shortcut-link"
                  title="Admin Console"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>Portal</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// Simple Admin Login Page Component
function AdminLoginOnboarding({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const creds = getAdminCredentials();
    if (username.trim() === creds.username && password === creds.password) {
      sessionStorage.setItem('dainty_admin_auth', 'true');
      onLoginSuccess();
    } else {
      setError('Invalid username or password credentials!');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', background: 'var(--color-bg-secondary)', padding: '3rem 2rem' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px', background: 'white', border: '1px solid var(--color-border-gold)', borderRadius: '8px', padding: '2.5rem', boxShadow: 'var(--shadow-premium)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-gold-accent)', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 1rem auto', color: 'var(--color-gold-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-brown-primary)' }}>Admin Dashboard</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Restricted access. Please authenticate.</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.65rem 0.8rem', borderRadius: '4px', fontSize: '0.78rem', marginBottom: '1.2rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.72rem' }}>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input" 
            placeholder="Username"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.72rem' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input" 
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Log In to Console
        </button>

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => goBack('home')}
            style={{ background: 'none', border: 'none', color: '#8a640f', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            ← Return to Store
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
