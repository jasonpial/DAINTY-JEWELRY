import { useState, useEffect } from 'react';
import { useHashRoute, navigateTo } from './Router';
import { initDB } from './db';
import Header from './components/customer/Header';
import ChatWidget from './components/customer/ChatWidget';
import HomeView from './components/customer/HomeView';
import ShopView from './components/customer/ShopView';
import ProductDetailView from './components/customer/ProductDetailView';
import CartView from './components/customer/CartView';
import ContactView from './components/customer/ContactView';
import AdminPortal from './components/admin/AdminPortal';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

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
      background: var(--color-brown-primary);
      color: var(--color-gold-light);
      border: 1px solid var(--color-gold-primary);
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
        <Header cartCount={cartCount} currentRoute={route} />
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
            <AdminPortal />
          )
        )}
      </main>

      {/* 3. Floating live chat messaging widget (Hides on admin dashboard) */}
      {!isAdminView && (
        <ChatWidget />
      )}

      {/* 4. Footer (Hides in admin dashboard to prevent duplication) */}
      {!isAdminView && (
        <footer className="site-footer" style={{ color: '#e7e5e4', paddingTop: '4rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>
            
            {/* Branding Column */}
            <div>
              <h3 style={{ color: 'white', fontFamily: 'var(--font-luxury)', fontSize: '1.4rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                DAINTY
              </h3>
              <span style={{ color: 'var(--color-gold-primary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.3em', display: 'block', marginBottom: '1.2rem' }}>
                STUDS & CHAINS
              </span>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.7', color: '#d6d3d1' }}>
                Premium handcrafted copper-gold plated studs, chains, wedding bands, and couple jewelry sets. Durable, tarnish-resistant pieces for everyday wear.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 style={{ color: 'white', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>Collections</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li><a href="#/shop?collection=new_arrivals" style={{ color: '#e7e5e4' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#e7e5e4'}>New Arrivals</a></li>
                <li><a href="#/shop?collection=best_sellers" style={{ color: '#e7e5e4' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#e7e5e4'}>Best Sellers</a></li>
                <li><a href="#/shop?collection=premium" style={{ color: '#e7e5e4' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#e7e5e4'}>Premium Collection</a></li>
                <li><a href="#/shop?collection=sale" style={{ color: '#e7e5e4' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#e7e5e4'}>Special Offers & Sales</a></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 style={{ color: 'white', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>Shop By Occasion</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li><a href="#/shop?occasion=Wedding" style={{ color: '#e7e5e4' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#e7e5e4'}>Bridal & Wedding</a></li>
                <li><a href="#/shop?occasion=Engagement" style={{ color: '#e7e5e4' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#e7e5e4'}>Engagement Rings</a></li>
                <li><a href="#/shop?occasion=Birthday" style={{ color: '#e7e5e4' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#e7e5e4'}>Birthday Gifts</a></li>
                <li><a href="#/shop?occasion=Gift" style={{ color: '#e7e5e4' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#e7e5e4'}>Gift Vouchers</a></li>
              </ul>
            </div>

            {/* Contact details */}
            <div>
              <h4 style={{ color: 'white', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>Contact Info</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#e7e5e4' }}>
                  <MapPin size={14} style={{ color: 'var(--color-gold-primary)' }} /> Plot 45, Acacia Ave, Kampala
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#e7e5e4' }}>
                  <Phone size={14} style={{ color: 'var(--color-gold-primary)' }} /> +256 700 000000
                </li>
                <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#e7e5e4' }}>
                  <Mail size={14} style={{ color: 'var(--color-gold-primary)' }} /> info@daintystuds.com
                </li>
              </ul>
            </div>

          </div>

          {/* Socials & Copyright with Padlock & Shopping Bag footer shortcuts */}
          <div style={{ borderTop: '1px solid #272522', padding: '1.5rem 2rem', background: '#12100f' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.8rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', color: '#e7e5e4' }}>
                <span>© {new Date().getFullYear()} DAINTY STUDS AND CHAINS. All Rights Reserved. Designed in White & Copper Gold.</span>
                
                {/* Left side padlock and shopping bag shortcut icon group */}
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', borderLeft: '1px solid #272522', paddingLeft: '1rem' }}>
                  <a 
                    href="#/cart" 
                    onClick={(e) => { e.preventDefault(); navigateTo('cart'); }} 
                    style={{ color: '#d6d3d1', display: 'flex', alignItems: 'center' }} 
                    onMouseOver={e => e.currentTarget.style.color = 'var(--color-gold-primary)'} 
                    onMouseOut={e => e.currentTarget.style.color = '#d6d3d1'} 
                    title="Shopping Bag"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </a>
                  <a 
                    href="#/admin" 
                    onClick={(e) => { e.preventDefault(); navigateTo('admin'); }} 
                    style={{ color: '#d6d3d1', display: 'flex', alignItems: 'center' }} 
                    onMouseOver={e => e.currentTarget.style.color = 'var(--color-gold-primary)'} 
                    onMouseOut={e => e.currentTarget.style.color = '#d6d3d1'} 
                    title="Admin Console Login"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="https://instagram.com" style={{ color: '#d6d3d1', display: 'flex', alignItems: 'center' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-gold-primary)'} onMouseOut={e => e.currentTarget.style.color = '#d6d3d1'} title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://facebook.com" style={{ color: '#d6d3d1', display: 'flex', alignItems: 'center' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-gold-primary)'} onMouseOut={e => e.currentTarget.style.color = '#d6d3d1'} title="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
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
    if (username === 'admin' && password === 'admin123') {
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
            placeholder="admin"
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
          Log In
        </button>

        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '4px', fontSize: '0.72rem', color: 'var(--color-text-secondary)', textAlign: 'center', border: '1px solid var(--color-border-light)' }}>
          <strong>Default Login Tip:</strong> <br />
          User: <code style={{ background: '#e7e5e4', padding: '1px 3px', borderRadius: '2px' }}>admin</code> | Pass: <code style={{ background: '#e7e5e4', padding: '1px 3px', borderRadius: '2px' }}>admin123</code>
        </div>
      </form>
    </div>
  );
}

export default App;
