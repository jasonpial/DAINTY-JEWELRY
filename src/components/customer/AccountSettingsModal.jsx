/**
 * DAINTY STUDS & CHAINS — AccountSettingsModal (Customer Dashboard)
 * E-commerce customer dashboard enabling users to manage their account details, bag, favorites, and order history.
 */

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Lock, Save, LogOut, CheckCircle2, ShoppingBag, Heart, Package, Shield } from 'lucide-react';
import { getActiveUser, updateActiveUser, logoutUser } from '../../services/authManager';
import { signOutUser, syncProfileUpdateToFirestore } from '../../services/auth';
import { formatUGX } from './ProductCard';
import { getOrders } from '../../db';

export default function AccountSettingsModal({ isOpen, onClose, cart = [], onLogout }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'bag' | 'favorites' | 'orders'
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
      // Load user orders
      const allOrders = getOrders();
      const filtered = allOrders.filter(o => 
        (activeUser.email && o.email?.toLowerCase() === activeUser.email.toLowerCase()) ||
        (activeUser.phone && o.phone === activeUser.phone)
      );
      setUserOrders(filtered);
    }
  }, [activeUser?.id, isOpen]);

  if (!isOpen) return null;

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

  const bagCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(28, 25, 23, 0.65)',
        backdropFilter: 'blur(6px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="account-settings-modal-card"
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          padding: '1.5rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          textAlign: 'left'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#78716c',
            padding: '0.25rem',
            zIndex: 10
          }}
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Header & User Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.15rem', borderBottom: '1px solid #eae6e1', paddingBottom: '0.9rem', paddingRight: '1.5rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--gradient-gold-metallic, linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%))', color: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(179,135,40,0.2)', flexShrink: 0 }}>
            {activeUser?.name ? activeUser.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1c1917', fontFamily: 'serif', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Welcome back, {activeUser?.name || 'Valued Patron'}
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#78716c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeUser?.email || 'DAINTY Member Account'} · Kampala, Uganda
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs (single-row horizontal scroll) */}
        <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1.25rem', borderBottom: '1px solid #f0ece4', paddingBottom: '0.6rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '20px',
              border: activeTab === 'profile' ? '1px solid #b38728' : '1px solid #e7e3dc',
              background: activeTab === 'profile' ? '#faf6ec' : '#fff',
              color: activeTab === 'profile' ? '#b38728' : '#44403c',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <User size={13} /> Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bag')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '20px',
              border: activeTab === 'bag' ? '1px solid #b38728' : '1px solid #e7e3dc',
              background: activeTab === 'bag' ? '#faf6ec' : '#fff',
              color: activeTab === 'bag' ? '#b38728' : '#44403c',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <ShoppingBag size={13} /> My Bag ({bagCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '20px',
              border: activeTab === 'orders' ? '1px solid #b38728' : '1px solid #e7e3dc',
              background: activeTab === 'orders' ? '#faf6ec' : '#fff',
              color: activeTab === 'orders' ? '#b38728' : '#44403c',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Package size={13} /> Orders ({userOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '20px',
              border: activeTab === 'favorites' ? '1px solid #b38728' : '1px solid #e7e3dc',
              background: activeTab === 'favorites' ? '#faf6ec' : '#fff',
              color: activeTab === 'favorites' ? '#b38728' : '#44403c',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Heart size={13} /> Wishlist
          </button>
        </div>

        {/* Tab 1: Profile & Credentials */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            {success && (
              <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.84rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} />
                <span>Profile and credentials updated successfully!</span>
              </div>
            )}

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '1.25rem', fontSize: '0.84rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#44403c', marginBottom: '0.3rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#44403c', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#44403c', marginBottom: '0.3rem' }}>
                  Mobile Money Phone Number (Uganda)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0740979898"
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#44403c', marginBottom: '0.3rem' }}>
                  Default Delivery Address
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Kampala, Uganda"
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              {activeUser?.provider !== 'google' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#44403c', marginBottom: '0.3rem' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#78716c' }} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current password"
                      style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', border: '1px solid #d6d3d1', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '0.75rem', background: '#1c1917', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Save size={16} /> Save Changes
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser();
                    logoutUser();
                    if (onLogout) onLogout();
                    onClose();
                  }}
                  style={{ padding: '0.75rem 1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: My Bag */}
        {activeTab === 'bag' && (
          <div className="animate-fade-in">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1c1917', marginBottom: '0.75rem' }}>
              Your Active Shopping Bag ({bagCount} items)
            </h4>
            {cart.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#78716c', background: '#faf8f5', borderRadius: '8px' }}>
                <ShoppingBag size={32} style={{ color: '#b38728', margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Your bag is currently empty.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <img src={item.images?.[0] || '/images/logo-image.png'} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1917' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#78716c' }}>Color: {item.selectedColor} · Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b38728' }}>
                      {formatUGX((item.sale_price || item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Order History */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1c1917', marginBottom: '0.75rem' }}>
              Order History ({userOrders.length})
            </h4>
            {userOrders.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#78716c', background: '#faf8f5', borderRadius: '8px' }}>
                <Package size={32} style={{ color: '#b38728', margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>No orders placed with this account yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                {userOrders.map(order => (
                  <div key={order.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1c1917' }}>Order #{order.id}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>{order.status || 'Confirmed'}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Date: {new Date(order.created_at || Date.now()).toLocaleDateString()} · Total: <strong style={{ color: '#1c1917' }}>{formatUGX(order.total_amount)}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      Payment: {order.payment_method}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Wishlist / Favorites */}
        {activeTab === 'favorites' && (
          <div className="animate-fade-in">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1c1917', marginBottom: '0.75rem' }}>
              Your Saved Wishlist & Favorites
            </h4>
            <div style={{ padding: '2rem', textAlign: 'center', color: '#78716c', background: '#faf8f5', borderRadius: '8px' }}>
              <Heart size={32} style={{ color: '#b38728', margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Explore our shop and click the heart icon on any jewelry piece to save items to your wishlist.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
