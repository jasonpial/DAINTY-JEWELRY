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
      <div style={{ maxWidth: '600px', margin: '5rem auto', padding: '3.5rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #eae6e1', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
        <Shield size={48} style={{ color: '#b38728', margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'serif', fontWeight: 800, color: '#1c1917', marginBottom: '0.5rem' }}>
          Account Sign In Required
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#78716c', marginBottom: '1.75rem', lineHeight: '1.6' }}>
          Please choose an account or sign in to view your DAINTY profile, saved bag, and order history.
        </p>
        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {onOpenAuth && (
            <button type="button" className="btn-primary" onClick={onOpenAuth}>
              Sign In / Choose Account
            </button>
          )}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '30px', border: '1px solid #d6d3d1', background: '#fff', color: '#1c1917', fontWeight: 700, cursor: 'pointer' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <button
        type="button"
        onClick={() => navigateTo('home')}
        style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#78716c', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Store
      </button>

      {/* Profile Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #2c2724 100%)', color: '#fff', borderRadius: '16px', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--gradient-gold-metallic, linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%))', color: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.8rem', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            {activeUser.name ? activeUser.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d4af37', fontWeight: 700, marginBottom: '0.2rem' }}>
              DAINTY Verified Patron
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'serif', fontWeight: 800 }}>
              {activeUser.name}
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#d6d3d1' }}>
              {activeUser.email} {activeUser.phone ? `• ${activeUser.phone}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          style={{ padding: '0.7rem 1.4rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        {/* Sidebar Nav */}
        <div style={{ background: '#ffffff', border: '1px solid #e7e3dc', borderRadius: '12px', padding: '1rem', height: 'fit-content', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'profile' ? '#1c1917' : 'transparent',
                color: activeTab === 'profile' ? '#fff' : '#1c1917',
                fontWeight: 700,
                fontSize: '0.85rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={17} /> Account Details
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bag')}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'bag' ? '#1c1917' : 'transparent',
                color: activeTab === 'bag' ? '#fff' : '#1c1917',
                fontWeight: 700,
                fontSize: '0.85rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              <ShoppingBag size={17} /> Shopping Bag ({bagCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'orders' ? '#1c1917' : 'transparent',
                color: activeTab === 'orders' ? '#fff' : '#1c1917',
                fontWeight: 700,
                fontSize: '0.85rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Package size={17} /> Order History ({userOrders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wishlist')}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'wishlist' ? '#1c1917' : 'transparent',
                color: activeTab === 'wishlist' ? '#fff' : '#1c1917',
                fontWeight: 700,
                fontSize: '0.85rem',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart size={17} /> Saved Wishlist
            </button>
          </div>
        </div>

        {/* Main Content Panel */}
        <div style={{ background: '#ffffff', border: '1px solid #e7e3dc', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.4rem' }}>
                Profile &amp; Account Settings
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#78716c', marginBottom: '1.75rem' }}>
                Update your personal credentials, secure password, and delivery address.
              </p>

              {success && (
                <div style={{ padding: '0.85rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle2 size={18} />
                  <span>Account profile and credentials successfully updated!</span>
                </div>
              )}

              {error && (
                <div style={{ padding: '0.85rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403c', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.6rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403c', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.6rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403c', marginBottom: '0.35rem' }}>
                    Mobile Money Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0740979898"
                      style={{ width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.6rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403c', marginBottom: '0.35rem' }}>
                    Delivery Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Kampala, Uganda"
                      style={{ width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.6rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {activeUser.provider !== 'google' && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#44403c', marginBottom: '0.35rem' }}>
                      Secure Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                        style={{ width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.6rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    style={{ padding: '0.85rem 2rem', background: '#1c1917', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  >
                    <Save size={16} /> Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'bag' && (
            <div>
              <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.4rem' }}>
                Your Active Shopping Bag ({bagCount} items)
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#78716c', marginBottom: '1.75rem' }}>
                Items currently curated in your personal shopping bag.
              </p>

              {cart.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#faf8f5', borderRadius: '12px', border: '1px solid #e8e2d7' }}>
                  <ShoppingBag size={42} style={{ color: '#b38728', margin: '0 auto 0.75rem auto' }} />
                  <p style={{ fontSize: '0.9rem', color: '#78716c', marginBottom: '1.25rem' }}>Your shopping bag is empty.</p>
                  <button className="btn-primary" onClick={() => navigateTo('shop')}>
                    Explore Shop Catalog
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <img src={item.images?.[0] || '/images/logo-image.png'} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1c1917' }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Color: {item.selectedColor} · Quantity: {item.quantity}</div>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#b38728' }}>
                        {formatUGX((item.sale_price || item.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
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
              <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.4rem' }}>
                Order History ({userOrders.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#78716c', marginBottom: '1.75rem' }}>
                Track your past purchases and Mobile Money payments.
              </p>

              {userOrders.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#faf8f5', borderRadius: '12px', border: '1px solid #e8e2d7' }}>
                  <Package size={42} style={{ color: '#b38728', margin: '0 auto 0.75rem auto' }} />
                  <p style={{ fontSize: '0.9rem', color: '#78716c', margin: 0 }}>No past orders found for this account.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {userOrders.map(order => (
                    <div key={order.id} style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1c1917' }}>Order #{order.id}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: '#dcfce7', color: '#15803d', borderRadius: '12px' }}>
                          {order.status || 'Confirmed'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        Date: {new Date(order.created_at || Date.now()).toLocaleDateString()} · Total Amount: <strong style={{ color: '#1c1917' }}>{formatUGX(order.total_amount)}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        Payment Method: {order.payment_method}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.4rem' }}>
                Saved Wishlist &amp; Favorites
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#78716c', marginBottom: '1.75rem' }}>
                Jewelry pieces you have saved for later.
              </p>

              <div style={{ padding: '3rem', textAlign: 'center', background: '#faf8f5', borderRadius: '12px', border: '1px solid #e8e2d7' }}>
                <Heart size={42} style={{ color: '#b38728', margin: '0 auto 0.75rem auto' }} />
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
