/**
 * DAINTY STUDS & CHAINS — ProfileView Page
 * Dedicated full website page for customer account management, order history, shopping bag, and wishlist.
 */

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, LogOut, CheckCircle2, ShoppingBag, Package, Heart, Shield, ArrowLeft } from 'lucide-react';
import { getActiveUser, updateActiveUser, logoutUser } from '../../services/authManager';
import { signOutUser, syncProfileUpdateToFirestore } from '../../services/auth';
import { formatUGX } from './ProductCard';
import { getOrders } from '../../db';
import { navigateTo } from '../../Router';

export default function ProfileView({ cart = [], onLogout, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'bag' | 'orders' | 'wishlist'
  const activeUser = getActiveUser();
  const [formData, setFormData] = useState({
    name: activeUser?.name || '',
    email: activeUser?.email || '',
    phone: activeUser?.phone || '',
    address: activeUser?.address || '',
    password: activeUser?.password || ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    if (activeUser) {
      setFormData({
        name: activeUser.name || '',
        email: activeUser.email || '',
        phone: activeUser.phone || '',
        address: activeUser.address || '',
        password: activeUser.password || ''
      });
      const allOrders = getOrders();
      const filtered = allOrders.filter(o => 
        (activeUser.email && o.email?.toLowerCase() === activeUser.email.toLowerCase()) ||
        (activeUser.phone && o.phone === activeUser.phone)
      );
      setUserOrders(filtered);
    }
  }, [activeUser?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        throw new Error('Name and email are required.');
      }
      await syncProfileUpdateToFirestore({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      });
      updateActiveUser(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    logoutUser();
    if (onLogout) onLogout();
    navigateTo('home');
  };

  const bagCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (!activeUser) {
    return (
      <div className="profile-signin-card">
        <Shield size={44} style={{ color: '#b38728', margin: '0 auto 1rem auto' }} />
        <h2 className="profile-signin-title">
          Account Sign In Required
        </h2>
        <p className="profile-signin-desc">
          Please choose an account or sign in to view your DAINTY profile, saved bag, and order history.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {onOpenAuth && (
            <button type="button" className="btn-primary" onClick={onOpenAuth}>
              Sign In / Choose Account
            </button>
          )}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            style={{ padding: '0.7rem 1.35rem', borderRadius: '30px', border: '1px solid #d6d3d1', background: '#fff', color: '#1c1917', fontWeight: 700, cursor: 'pointer', fontSize: '0.84rem' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrap">
      <button
        type="button"
        onClick={() => navigateTo('home')}
        className="profile-back-btn"
      >
        <ArrowLeft size={16} /> Back to Store
      </button>

      {/* Profile Header Banner */}
      <div className="profile-hero-banner">
        <div className="profile-hero-user">
          <div className="profile-hero-avatar">
            {activeUser.name ? activeUser.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="profile-hero-kicker">
              DAINTY Verified Patron
            </div>
            <h1 className="profile-hero-title">
              {activeUser.name}
            </h1>
            <p className="profile-hero-meta">
              {activeUser.email} {activeUser.phone ? `• ${activeUser.phone}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="profile-signout-btn"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="profile-dashboard-grid">
        {/* Sidebar Nav (Horizontal pill row on mobile, sidebar stack on desktop) */}
        <div className="profile-sidebar-card">
          <div className="profile-tabs-list">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={16} /> <span>Account Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bag')}
              className={`profile-tab-btn ${activeTab === 'bag' ? 'active' : ''}`}
            >
              <ShoppingBag size={16} /> <span>Shopping Bag ({bagCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <Package size={16} /> <span>Order History ({userOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wishlist')}
              className={`profile-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <Heart size={16} /> <span>Saved Wishlist</span>
            </button>
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="profile-content-panel">
          {activeTab === 'profile' && (
            <div>
              <h2 className="profile-panel-heading">
                Profile &amp; Account Settings
              </h2>
              <p className="profile-panel-sub">
                Update your personal credentials, secure password, and delivery address.
              </p>

              {success && (
                <div style={{ padding: '0.85rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle2 size={18} />
                  <span>Account profile and credentials successfully updated!</span>
                </div>
              )}

              {error && (
                <div style={{ padding: '0.85rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="profile-form-grid">
                <div className="profile-form-full">
                  <label className="profile-field-label">
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="profile-field-input"
                      required
                    />
                  </div>
                </div>

                <div className="profile-form-full">
                  <label className="profile-field-label">
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="profile-field-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="profile-field-label">
                    Mobile Money Phone
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0740979898"
                      className="profile-field-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="profile-field-label">
                    Delivery Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Kampala, Uganda"
                      className="profile-field-input"
                    />
                  </div>
                </div>

                {activeUser.provider !== 'google' && (
                  <div className="profile-form-full">
                    <label className="profile-field-label">
                      Secure Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                        className="profile-field-input"
                      />
                    </div>
                  </div>
                )}

                <div className="profile-form-full" style={{ marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="profile-save-btn"
                  >
                    <Save size={16} /> Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'bag' && (
            <div>
              <h2 className="profile-panel-heading">
                Your Active Shopping Bag ({bagCount} items)
              </h2>
              <p className="profile-panel-sub">
                Items currently curated in your personal shopping bag.
              </p>

              {cart.length === 0 ? (
                <div style={{ padding: '2.25rem 1.25rem', textAlign: 'center', background: '#faf8f5', borderRadius: '12px', border: '1px solid #e8e2d7' }}>
                  <ShoppingBag size={40} style={{ color: '#b38728', margin: '0 auto 0.75rem auto' }} />
                  <p style={{ fontSize: '0.9rem', color: '#78716c', marginBottom: '1.25rem' }}>Your shopping bag is empty.</p>
                  <button className="btn-primary" onClick={() => navigateTo('shop')}>
                    Explore Shop Catalog
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} className="profile-bag-item">
                      <img src={item.images?.[0] || '/images/logo-image.png'} alt={item.name} className="profile-bag-thumb" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1c1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Color: {item.selectedColor} · Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#b38728', flexShrink: 0 }}>
                        {formatUGX((item.sale_price || item.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                    <button className="btn-primary" onClick={() => navigateTo('cart')}>
                      Proceed to Checkout ({bagCount} items)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="profile-panel-heading">
                Order History ({userOrders.length})
              </h2>
              <p className="profile-panel-sub">
                Track your past purchases and Mobile Money payments.
              </p>

              {userOrders.length === 0 ? (
                <div style={{ padding: '2.25rem 1.25rem', textAlign: 'center', background: '#faf8f5', borderRadius: '12px', border: '1px solid #e8e2d7' }}>
                  <Package size={40} style={{ color: '#b38728', margin: '0 auto 0.75rem auto' }} />
                  <p style={{ fontSize: '0.9rem', color: '#78716c', margin: 0 }}>No past orders found for this account.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {userOrders.map(order => (
                    <div key={order.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1c1917' }}>Order #{order.id}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: '#dcfce7', color: '#15803d', borderRadius: '12px' }}>
                          {order.status || 'Confirmed'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.45rem' }}>
                        Date: {new Date(order.created_at || Date.now()).toLocaleDateString()} · Total: <strong style={{ color: '#1c1917' }}>{formatUGX(order.total_amount)}</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Payment: {order.payment_method}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="profile-panel-heading">
                Saved Wishlist &amp; Favorites
              </h2>
              <p className="profile-panel-sub">
                Jewelry pieces you have saved for later.
              </p>

              <div style={{ padding: '2.25rem 1.25rem', textAlign: 'center', background: '#faf8f5', borderRadius: '12px', border: '1px solid #e8e2d7' }}>
                <Heart size={40} style={{ color: '#b38728', margin: '0 auto 0.75rem auto' }} />
                <p style={{ fontSize: '0.9rem', color: '#78716c', marginBottom: '1.25rem' }}>Explore our catalog and bookmark your favorite gold-plated items.</p>
                <button className="btn-primary" onClick={() => navigateTo('shop', { collection: 'best_sellers' })}>
                  View Best Sellers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
