/**
 * DAINTY STUDS & CHAINS — ProfileAuthModal Component
 * Sleek, gold-themed sign-in / sign-up modal featuring an explicit Account Chooser for returning users,
 * Email and True Google authentication options (`prompt: 'select_account'`), password reset,
 * and full interactivity leveraging src/services/auth.js.
 */

import { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, CheckCircle2, ChevronRight, UserPlus } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset } from '../../services/auth';
import { getSavedAccounts } from '../../services/authManager';

export default function ProfileAuthModal({ isOpen, onClose, initialMode = 'signin', onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const passwordInputRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const accounts = getSavedAccounts();
      setSavedAccounts(accounts);
      setIsSignUp(initialMode === 'signup');
      setShowAccountChooser(initialMode !== 'signup' && accounts.length > 0);
      setIsForgotPassword(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: ''
      });
      setResetEmail('');
      setError('');
      setLoading(false);
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSelectSavedAccount = (account) => {
    setError('');
    if (account.provider === 'google') {
      // Force Google's explicit account chooser so the user can pick/confirm any Google account
      handleGoogleSignIn();
      return;
    }
    // Pre-fill ONLY email and require explicit password entry (never auto-log in)
    setShowAccountChooser(false);
    setFormData({
      name: '',
      email: account.email,
      phone: '',
      password: '',
      address: ''
    });
    setTimeout(() => {
      if (passwordInputRef.current) passwordInputRef.current.focus();
    }, 60);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
          throw new Error('Please fill in your name, email, and password.');
        }
        await signUpWithEmail(
          formData.name,
          formData.email,
          formData.password,
          formData.phone,
          formData.address
        );
        setSuccessMsg('Account created successfully! Welcome to DAINTY.');
      } else {
        if (!formData.email.trim() || !formData.password) {
          throw new Error('Please enter your email and password.');
        }
        await signInWithEmail(formData.email, formData.password);
        setSuccessMsg('Signed in successfully! Welcome back.');
      }

      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 900);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 900);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      setSuccessMsg(`Password reset instructions sent to ${resetEmail}.`);
      setLoading(false);
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMsg('');
      }, 3500);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to send password reset email.');
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
        background: 'rgba(28, 25, 23, 0.7)',
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
        .profile-auth-card {
          width: 100%;
          max-width: 820px;
          min-height: 520px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: row;
        }
        .profile-auth-form-side {
          flex: 1;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          animation: slideIn 0.4s ease;
        }
        .profile-auth-gold-side {
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
        .profile-auth-input-group {
          width: 100%;
          max-width: 320px;
          margin-bottom: 0.85rem;
          position: relative;
        }
        .profile-auth-input {
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
        .profile-auth-input:focus {
          border-color: #b38728;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(179, 135, 40, 0.15);
        }
        .profile-auth-input-icon {
          position: absolute;
          left: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          color: #78716c;
        }
        .profile-auth-submit-btn {
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
        .profile-auth-submit-btn:hover {
          background: #b38728;
          color: #000000;
          transform: translateY(-1px);
        }
        .profile-auth-toggle-btn {
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
        .profile-auth-toggle-btn:hover {
          background: #1c1917;
          color: #ffffff;
        }
        .social-login-row {
          display: flex;
          gap: 0.85rem;
          margin: 1rem 0;
        }
        .social-login-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.55rem 1rem;
          border-radius: 30px;
          border: 1px solid #d6d3d1;
          background: #fff;
          color: #1c1917;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }
        .social-login-btn:hover {
          border-color: #b38728;
          background: #faf8f5;
          transform: translateY(-1px);
        }
        .account-chooser-list {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin: 0.75rem 0 1rem 0;
          max-height: 220px;
          overflow-y: auto;
        }
        .account-chooser-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.9rem;
          background: #faf8f5;
          border: 1px solid #e7e3dc;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }
        .account-chooser-item:hover {
          border-color: #b38728;
          background: #fffdf8;
          box-shadow: 0 4px 12px rgba(179,135,40,0.12);
        }
        @media (max-width: 768px) {
          .profile-auth-card { flex-direction: column; max-width: 440px; min-height: auto; max-height: 92vh; overflow-y: auto; }
          .profile-auth-gold-side { width: 100%; padding: 1.5rem 1.25rem; }
          .profile-auth-form-side { padding: 1.75rem 1.15rem 1.35rem 1.15rem; }
          .social-login-row { width: 100%; max-width: 320px; justify-content: center; gap: 0.6rem; }
          .social-login-btn { flex: 1; padding: 0.55rem 0.65rem; font-size: 0.76rem; }
        }
      `}</style>

      <div className="profile-auth-card">
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

        {/* Form Panel */}
        <div className="profile-auth-form-side">
          {isForgotPassword ? (
            <>
              <h2 style={{ fontFamily: 'serif', fontSize: '1.8rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.4rem' }}>
                Reset Password
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#78716c', marginBottom: '1.5rem' }}>
                Enter your account email and we&apos;ll send you instructions to reset your password.
              </p>

              {successMsg ? (
                <div style={{ padding: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0' }}>
                  <CheckCircle2 size={22} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{successMsg}</span>
                </div>
              ) : (
                <form onSubmit={handlePasswordResetSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="profile-auth-input-group">
                    <Mail size={15} className="profile-auth-input-icon" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="profile-auth-input"
                      required
                    />
                  </div>

                  {error && (
                    <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, margin: '0.4rem 0', maxWidth: '320px', textAlign: 'center' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="profile-auth-submit-btn" disabled={loading}>
                    {loading ? 'Sending Instructions…' : 'SEND RESET LINK'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: '#b38728', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem' }}
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}
            </>
          ) : !isSignUp && showAccountChooser && savedAccounts.length > 0 ? (
            <>
              <h2 style={{ fontFamily: 'serif', fontSize: '1.75rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.35rem' }}>
                Choose an Account
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#78716c', marginBottom: '0.75rem' }}>
                Select an account to sign in to DAINTY
              </p>

              {successMsg ? (
                <div style={{ padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0' }}>
                  <CheckCircle2 size={22} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{successMsg}</span>
                </div>
              ) : (
                <>
                  <div className="account-chooser-list">
                    {savedAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        className="account-chooser-item"
                        onClick={() => handleSelectSavedAccount(acc)}
                        disabled={loading}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #bf953f 0%, #b38728 100%)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          flexShrink: 0
                        }}>
                          {(acc.name || acc.email)[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {acc.name}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#78716c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {acc.email} · {acc.provider === 'google' ? 'Google' : 'Email'}
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: '#b38728', flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, margin: '0.3rem 0 0.6rem 0', maxWidth: '320px', textAlign: 'center' }}>
                      {error}
                    </div>
                  )}

                  <div className="social-login-row" style={{ marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      className="social-login-btn"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      title="Choose a Google Account"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.17 21.32 7.23 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.13 0 9.83 0 12s.43 3.87 1.18 5.39l4.09-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                      </svg>
                      <span>{loading ? 'Opening Chooser…' : 'Google Account'}</span>
                    </button>
                    <button
                      type="button"
                      className="social-login-btn"
                      onClick={() => {
                        setShowAccountChooser(false);
                        setFormData({ name: '', email: '', phone: '', password: '', address: '' });
                        setError('');
                        setTimeout(() => {
                          if (emailInputRef.current) emailInputRef.current.focus();
                        }, 60);
                      }}
                    >
                      <UserPlus size={16} style={{ color: '#b38728' }} />
                      <span>Use Another Account</span>
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: 'serif', fontSize: '1.8rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.4rem' }}>
                {isSignUp ? 'Create Account' : 'Sign in to DAINTY'}
              </h2>

              {/* Social Login Options with True Google & Email Icons */}
              <div className="social-login-row">
                <button
                  type="button"
                  className="social-login-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  title="Choose a Google Account"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.17 21.32 7.23 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.13 0 9.83 0 12s.43 3.87 1.18 5.39l4.09-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="social-login-btn"
                  onClick={() => {
                    if (emailInputRef.current) emailInputRef.current.focus();
                  }}
                  title="Sign in with Email"
                >
                  <Mail size={16} style={{ color: '#b38728' }} />
                  <span>Email</span>
                </button>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#78716c', marginBottom: '1.15rem' }}>
                {isSignUp ? 'or register with your email address' : 'enter your email & password or choose Google'}
              </p>

              {successMsg ? (
                <div style={{ padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0' }}>
                  <CheckCircle2 size={22} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{successMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {isSignUp && (
                    <div className="profile-auth-input-group">
                      <User size={15} className="profile-auth-input-icon" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="profile-auth-input"
                        required={isSignUp}
                      />
                    </div>
                  )}

                  <div className="profile-auth-input-group">
                    <Mail size={15} className="profile-auth-input-icon" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className="profile-auth-input"
                      required
                    />
                  </div>

                  {isSignUp && (
                    <div className="profile-auth-input-group">
                      <Phone size={15} className="profile-auth-input-icon" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Mobile Money Phone (e.g. 0740979898)"
                        value={formData.phone}
                        onChange={handleChange}
                        className="profile-auth-input"
                      />
                    </div>
                  )}

                  <div className="profile-auth-input-group">
                    <Lock size={15} className="profile-auth-input-icon" />
                    <input
                      ref={passwordInputRef}
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="profile-auth-input"
                      required
                    />
                  </div>

                  {isSignUp && (
                    <div className="profile-auth-input-group">
                      <MapPin size={15} className="profile-auth-input-icon" />
                      <input
                        type="text"
                        name="address"
                        placeholder="Delivery Address (Kampala / Uganda)"
                        value={formData.address}
                        onChange={handleChange}
                        className="profile-auth-input"
                      />
                    </div>
                  )}

                  {!isSignUp && (
                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', justifyContent: savedAccounts.length > 0 ? 'space-between' : 'flex-end', marginBottom: '0.5rem' }}>
                      {savedAccounts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setShowAccountChooser(true); setError(''); }}
                          style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#b38728', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                          ← Choose account
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                        style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#78716c', cursor: 'pointer', padding: 0 }}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  {error && (
                    <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, margin: '0.4rem 0', maxWidth: '320px', textAlign: 'center' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="profile-auth-submit-btn" disabled={loading}>
                    {loading ? 'Processing…' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Right Gold Overlay Panel (Sliding Switcher) */}
        <div className="profile-auth-gold-side">
          <h2 style={{ fontFamily: 'serif', fontSize: '1.9rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.75rem' }}>
            {isSignUp ? 'Welcome Back!' : 'Hello, Friend!'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#3e2723', lineHeight: '1.6', marginBottom: '1.75rem', maxWidth: '280px' }}>
            {isSignUp
              ? 'To keep connected with DAINTY please choose or login with your personal account.'
              : 'Enter your personal details and start your luxury handcrafted earrings journey with us.'}
          </p>
          <button
            type="button"
            className="profile-auth-toggle-btn"
            onClick={() => {
              const nextIsSignUp = !isSignUp;
              setIsSignUp(nextIsSignUp);
              setShowAccountChooser(!nextIsSignUp && savedAccounts.length > 0);
              setIsForgotPassword(false);
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
