/**
 * DAINTY STUDS & CHAINS — AuthModal Component
 * Styled after the classic sliding sign-in/sign-up mockup card, customized with DAINTY metallic gold theme.
 */

import { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { registerUser, loginUser } from '../../services/authManager';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin', onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
          throw new Error('Please fill in your name, email, and password.');
        }
        registerUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address
        });
        setSuccessMsg('Account created successfully! Welcome to DAINTY.');
      } else {
        if (!formData.email.trim() || !formData.password) {
          throw new Error('Please enter your email/phone and password.');
        }
        loginUser({
          emailOrPhone: formData.email,
          password: formData.password
        });
        setSuccessMsg('Signed in successfully! Welcome back.');
      }

      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

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
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.3s ease forwards'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        .auth-container-card {
          width: 100%;
          max-width: 820px;
          min-height: 520px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.25);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: row;
        }
        .auth-form-panel {
          flex: 1;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          animation: slideIn 0.4s ease;
        }
        .auth-overlay-panel {
          width: 42%;
          background: var(--gradient-gold-metallic, linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%));
          color: #1c1917;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.08);
        }
        .auth-input-group {
          width: 100%;
          max-width: 320px;
          margin-bottom: 0.85rem;
          position: relative;
        }
        .auth-input {
          width: 100%;
          padding: 0.7rem 0.9rem 0.7rem 2.4rem;
          background: #f7f5f2;
          border: 1px solid #e7e3dc;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #1c1917;
          outline: none;
          transition: all 0.2s ease;
        }
        .auth-input:focus {
          border-color: #b38728;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(179, 135, 40, 0.15);
        }
        .auth-input-icon {
          position: absolute;
          left: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          color: #78716c;
        }
        .auth-btn-primary {
          width: 100%;
          max-width: 320px;
          padding: 0.75rem;
          background: #1c1917;
          color: #ffffff;
          border: none;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          margin-top: 0.75rem;
          transition: all 0.2s ease;
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        .auth-btn-primary:hover {
          background: #b38728;
          color: #000000;
          transform: translateY(-1px);
        }
        .auth-btn-outline {
          padding: 0.6rem 2rem;
          background: transparent;
          border: 2px solid #1c1917;
          color: #1c1917;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .auth-btn-outline:hover {
          background: #1c1917;
          color: #ffffff;
        }
        .social-icons-row {
          display: flex;
          gap: 0.75rem;
          margin: 1rem 0;
        }
        .social-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #d6d3d1;
          background: #fff;
          color: #1c1917;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .social-icon-btn:hover {
          border-color: #b38728;
          color: #b38728;
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .auth-container-card { flex-direction: column; max-width: 440px; }
          .auth-overlay-panel { width: 100%; padding: 2rem 1.5rem; }
          .auth-form-panel { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="auth-container-card">
        {/* Close Button */}
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
            zIndex: 10,
            padding: '0.3rem'
          }}
          title="Close"
        >
          <X size={22} />
        </button>

        {/* Form Panel (Sign In or Sign Up) */}
        <div className="auth-form-panel">
          <h2 style={{ fontFamily: 'serif', fontSize: '1.8rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.4rem' }}>
            {isSignUp ? 'Create Account' : 'Sign in to DAINTY'}
          </h2>

          <div className="social-icons-row">
            <button type="button" className="social-icon-btn" title="Sign in with Facebook">f</button>
            <button type="button" className="social-icon-btn" title="Sign in with Google">G+</button>
            <button type="button" className="social-icon-btn" title="Sign in with LinkedIn">in</button>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#78716c', marginBottom: '1.25rem' }}>
            {isSignUp ? 'or use your email for registration' : 'or use your account credentials'}
          </p>

          {successMsg ? (
            <div style={{ padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0' }}>
              <CheckCircle2 size={22} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{successMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {isSignUp && (
                <div className="auth-input-group">
                  <User size={15} className="auth-input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="auth-input"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="auth-input-group">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="text"
                  name="email"
                  placeholder="Email Address or Phone"
                  value={formData.email}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
              </div>

              {isSignUp && (
                <div className="auth-input-group">
                  <Phone size={15} className="auth-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Mobile Money Phone (e.g. 0740979898)"
                    value={formData.phone}
                    onChange={handleChange}
                    className="auth-input"
                  />
                </div>
              )}

              <div className="auth-input-group">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
              </div>

              {isSignUp && (
                <div className="auth-input-group">
                  <MapPin size={15} className="auth-input-icon" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Delivery Address (Kampala / Uganda)"
                    value={formData.address}
                    onChange={handleChange}
                    className="auth-input"
                  />
                </div>
              )}

              {!isSignUp && (
                <div style={{ width: '100%', maxWidth: '320px', textAlign: 'right', marginBottom: '0.5rem' }}>
                  <a
                    href="#forgot"
                    onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email.'); }}
                    style={{ fontSize: '0.75rem', color: '#78716c', textDecoration: 'none' }}
                  >
                    Forgot your password?
                  </a>
                </div>
              )}

              {error && (
                <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, margin: '0.4rem 0', maxWidth: '320px', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? 'Processing…' : (isSignUp ? 'SIGN UP' : 'SIGN IN')}
              </button>
            </form>
          )}
        </div>

        {/* Right Overlay Panel (Sliding Switcher) */}
        <div className="auth-overlay-panel">
          <h2 style={{ fontFamily: 'serif', fontSize: '1.9rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.75rem' }}>
            {isSignUp ? 'Welcome Back!' : 'Hello, Friend!'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#3e2723', lineHeight: '1.6', marginBottom: '1.75rem', maxWidth: '280px' }}>
            {isSignUp
              ? 'To keep connected with DAINTY Stugs & Chains please login with your personal info.'
              : 'Enter your personal details and start your luxury jewelry shopping journey with us.'}
          </p>
          <button
            type="button"
            className="auth-btn-outline"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMsg('');
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
