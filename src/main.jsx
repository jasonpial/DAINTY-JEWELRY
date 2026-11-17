import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error.'
    };
  }

  componentDidCatch(error, info) {
    console.error('DAINTY App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#faf8f5',
          fontFamily: 'sans-serif',
          color: '#1c1917'
        }}>
          <div style={{
            maxWidth: '460px',
            width: '100%',
            background: '#ffffff',
            border: '1px solid #e7e3dc',
            borderRadius: '14px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 16px 36px rgba(62, 39, 35, 0.08)'
          }}>
            <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', marginBottom: '0.5rem', color: '#3e2723' }}>
              DAINTY Boutique
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#57534e', marginBottom: '1.25rem' }}>
              We encountered a display issue loading your session. Click below to refresh cleanly.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#1c1917',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reload Store
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('dainty_ecommerce_products');
                    sessionStorage.clear();
                  } catch {}
                  window.location.hash = '#/';
                  window.location.reload();
                }}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '9999px',
                  border: '1px solid #b38728',
                  background: '#ffffff',
                  color: '#8a640f',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reset Session &amp; Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>
);
