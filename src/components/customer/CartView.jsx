import { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag, MessageSquareText, ShieldCheck, ArrowLeft,
  Check, HelpCircle, Loader2, CheckCircle2,
  XCircle, AlertTriangle, Clock, RefreshCw, Info, Smartphone,
  Trash2, Plus, Minus, Users, X
} from 'lucide-react';
import { formatUGX, formatUSD } from './ProductCard';
import { navigateTo } from '../../Router';
import { saveOrder } from '../../db';
import { getSavedShoppers, createNewShopper, getUserCart } from '../../services/cartManager';
import {
  processFullPayment,
  detectMobileNetwork,
  generateOrderReference,
  getRelworxStatus,
  getMerchantNumber,
} from '../../services/relworxPayments';

// ─── Logo asset paths (served from /public) ─────────────────
const MTN_LOGO    = '/mtn_logo.png';
const AIRTEL_LOGO = '/airtel_logo.png';

// ─────────────────────────────────────────────────────────────
// Payment Status Modal
// ─────────────────────────────────────────────────────────────
function PaymentStatusModal({ status, pollAttempt, maxPolls, phone, network, errorMessage, onClose, onRetry, onWhatsAppCheckout }) {
  const progressPct = status === 'polling' ? Math.min(100, (pollAttempt / maxPolls) * 100) : 100;
  const isMTN = network === 'MTN';

  const config = {
    polling: {
      icon: <Loader2 size={34} style={{ color: '#c59b27', animation: 'spin 1.2s linear infinite' }} />,
      title: 'Waiting for Payment…',
      subtitle: `A USSD prompt was sent to ${phone}. Check your phone screen and enter your Mobile Money PIN to approve.`,
      color: '#c59b27', bg: 'rgba(197,155,39,0.08)',
    },
    successful: {
      icon: <CheckCircle2 size={34} style={{ color: '#16a34a' }} />,
      title: 'Payment Confirmed! 🎉',
      subtitle: 'Your mobile money payment was received successfully. Your order is now confirmed.',
      color: '#16a34a', bg: 'rgba(22,163,74,0.08)',
    },
    failed: {
      icon: <XCircle size={34} style={{ color: '#dc2626' }} />,
      title: 'Payment Failed',
      subtitle: errorMessage
        ? `${errorMessage} The request has ended. No further prompts will be sent to your phone unless you try again.`
        : 'The payment was not completed (declined, cancelled, or insufficient balance). No further prompts will be sent to your phone unless you try again.',
      color: '#dc2626', bg: 'rgba(220,38,38,0.08)',
    },
    timeout: {
      icon: <Clock size={34} style={{ color: '#d97706' }} />,
      title: 'Payment Timed Out',
      subtitle: 'No PIN authorization received within 60 seconds. You may retry or checkout instantly via WhatsApp.',
      color: '#d97706', bg: 'rgba(217,119,6,0.08)',
    },
    not_configured: {
      icon: <AlertTriangle size={34} style={{ color: '#b38728' }} />,
      title: 'Relworx Gateway Setup Required',
      subtitle: errorMessage || 'Relworx payment credentials need to be configured in the Admin Portal under Settings or in your Hostinger server environment.',
      color: '#b38728', bg: 'rgba(197,155,39,0.12)',
    },
  };

  const c = config[status] || config.polling;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', animation: 'fadeIn 0.25s ease',
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '20px', padding: '2.5rem 2rem',
        maxWidth: '420px', width: '100%', textAlign: 'center',
        boxShadow: '0 40px 100px rgba(0,0,0,0.3)', border: '1px solid #f0ece4',
      }}>
        {/* Network logo at top during polling */}
        {status === 'polling' && network && network !== 'UNKNOWN' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
            <img
              src={isMTN ? MTN_LOGO : AIRTEL_LOGO}
              alt={isMTN ? 'MTN Mobile Money' : 'Airtel Money'}
              style={{
                height: '44px', objectFit: 'contain', borderRadius: '8px',
                padding: isMTN ? '4px 12px' : '6px 10px',
                background: isMTN ? '#FFCC00' : '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            />
          </div>
        )}
        {/* Icon ring */}
        <div style={{
          width: '68px', height: '68px', borderRadius: '50%', background: c.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.4rem auto',
        }}>
          {c.icon}
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1c1917', marginBottom: '0.6rem' }}>{c.title}</h3>
        <p style={{ fontSize: '0.84rem', color: '#78716c', lineHeight: '1.65', marginBottom: '1.2rem' }}>{c.subtitle}</p>

        {/* Actionable guidance if API key is not mapped to the business account in Relworx */}
        {errorMessage && errorMessage.toLowerCase().includes('authorized to access this business account') && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px',
            padding: '0.85rem 1rem', textAlign: 'left', marginBottom: '1.3rem',
            fontSize: '0.78rem', color: '#92400e', lineHeight: '1.55'
          }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem', color: '#78350f', fontSize: '0.82rem' }}>
              How to fix this in Relworx:
            </strong>
            <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
              <li>Log into <strong>payments.relworx.com</strong></li>
              <li>Go to <strong>Organizations</strong> &rarr; Click <strong>View</strong> on DAINTY STUDS AND CHAINS</li>
              <li>Click <strong>API Keys</strong> &rarr; Click <strong>Edit</strong> on your API key</li>
              <li>Under <strong>Business account</strong>, select/check <strong>REL11AE925B85</strong></li>
              <li>Click <strong>Update</strong> to save, then try again</li>
            </ol>
          </div>
        )}

        {/* Actionable guidance if server IP is not whitelisted in Relworx */}
        {errorMessage && errorMessage.toLowerCase().includes('authorized ip access') && (
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px',
            padding: '0.85rem 1rem', textAlign: 'left', marginBottom: '1.3rem',
            fontSize: '0.78rem', color: '#1e40af', lineHeight: '1.55'
          }}>
            <strong style={{ display: 'block', marginBottom: '0.35rem', color: '#1e3a8a', fontSize: '0.82rem' }}>
              How to fix "No Authorized IP Access" in Relworx:
            </strong>
            <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
              <li>Log into <strong>payments.relworx.com</strong></li>
              <li>Go to <strong>Organizations &rarr; Business Accounts &rarr; REL11AE925B85</strong></li>
              <li>Click <strong>Edit Business Account</strong></li>
              <li>In the <strong>API Authorized IPs</strong> field, enter: <code style={{ background: '#fff', padding: '1px 5px', borderRadius: '4px', border: '1px solid #bfdbfe', fontWeight: 700 }}>151.106.96.51</code></li>
              <li>Click <strong>Update</strong> to save, then click Try Again</li>
            </ol>
          </div>
        )}

        {/* Progress bar during polling */}
        {status === 'polling' && (
          <div style={{ marginBottom: '1.4rem' }}>
            <div style={{ height: '6px', borderRadius: '3px', background: '#f0ece4', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #c59b27, #e6c756)',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.7rem', color: '#a8a29e', marginTop: '0.4rem' }}>
              Checking {pollAttempt} / {maxPolls} · every 5 seconds
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {(status === 'failed' || status === 'timeout' || status === 'not_configured') && onRetry && (
            <button onClick={onRetry} style={{
              background: 'linear-gradient(135deg,#1c1917,#3c3530)', color: '#fff',
              border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              <RefreshCw size={15} /> Try Again
            </button>
          )}
          {status !== 'polling' && onWhatsAppCheckout && (
            <button onClick={onWhatsAppCheckout} style={{
              background: '#25D366', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '0.75rem 1.5rem', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              <MessageSquareText size={16} /> Complete Order via WhatsApp
            </button>
          )}
          {status !== 'polling' && onClose && (
            <button onClick={onClose} style={{
              background: '#f7f5f2', color: '#44403c', border: '1px solid #e7e5e0',
              borderRadius: '10px', padding: '0.7rem 1.5rem', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600,
            }}>
              {status === 'successful' ? 'View My Order' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main CartView Component
// ─────────────────────────────────────────────────────────────
export default function CartView({
  cart = [],
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  currentShopper,
  onSwitchShopper,
  onIdentifyShopper
}) {
  // Selected network: null | 'MTN' | 'AIRTEL'
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  const [checkoutData, setCheckoutData] = useState({
    name: currentShopper?.name && !currentShopper?.isGuest ? currentShopper.name : '',
    phone: currentShopper?.phone || '',
    email: currentShopper?.email || '',
    address: '',
    notes: ''
  });
  const [momoPhone, setMomoPhone]       = useState(currentShopper?.phone || '');
  const [couponCode, setCouponCode]     = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError]   = useState('');
  const [relworxServerConfigured, setRelworxServerConfigured] = useState(true);
  const [pollAttempt, setPollAttempt]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [orderPlaced, setOrderPlaced]     = useState(null);
  const [secureSave, setSecureSave]       = useState(true);
  const [showShopperModal, setShowShopperModal] = useState(false);
  const [newShopperName, setNewShopperName]     = useState('');
  const [newShopperPhone, setNewShopperPhone]   = useState('');
  const savedShoppers = getSavedShoppers();
  const MAX_POLLS = 12;
  const abortRef  = useRef(false);
  const isSubmittingRef = useRef(false);
  const activeAbortControllerRef = useRef(null);

  // Keep billing phone and name updated if currentShopper changes
  useEffect(() => {
    if (currentShopper?.phone && !checkoutData.phone) {
      setCheckoutData(prev => ({
        ...prev,
        phone: currentShopper.phone,
        name: prev.name || (currentShopper.name && !currentShopper.isGuest ? currentShopper.name : '')
      }));
      setMomoPhone(currentShopper.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShopper]);

  // Check Relworx configuration on mount
  useEffect(() => {
    getRelworxStatus().then(status => {
      if (status && status.configured !== undefined) {
        setRelworxServerConfigured(status.configured);
      }
    }).catch(() => {});
  }, []);

  // When billing phone is filled, pre-fill the momo phone
  useEffect(() => {
    if (checkoutData.phone && !momoPhone) setMomoPhone(checkoutData.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutData.phone]);

  // ── Pricing ──────────────────────────────────────────────
  const cartSubtotal   = cart.reduce((acc, item) => acc + ((item.sale_price || item.price) * item.quantity), 0);
  const discountAmount = cartSubtotal * (discountPercentage / 100);
  const creditAmount   = cartSubtotal > 0 ? cartSubtotal * 0.01 : 0;
  const deliveryFee    = cartSubtotal > 0 ? 10000 : 0;
  const cartTotal      = Math.max(0, cartSubtotal - discountAmount - creditAmount + deliveryFee);
  const gstInclusive   = cartTotal > 0 ? cartTotal * 0.10 : 0;
  const cartCount      = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
    if (name === 'phone' && value.trim().length >= 10 && onIdentifyShopper) {
      onIdentifyShopper(value.trim(), checkoutData.name, checkoutData.email);
    }
  };

  const handleApplyCoupon = (code, pct) => { setCouponCode(code); setDiscountPercentage(pct); };
  
  const resetModal = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    abortRef.current = true;
    isSubmittingRef.current = false;
    setPaymentStatus(null);
    setPaymentError('');
    setPollAttempt(0);
    setLoading(false);
  };

  // ── WhatsApp fallback ────────────────────────────────────
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
      alert('Please fill in your Name, Phone, and Delivery Address first!');
      return;
    }
    const number = '+256788227027';
    let itemDetails = '';
    cart.forEach((item, i) => {
      const p = item.sale_price || item.price;
      itemDetails += `${i + 1}. *${item.name}* (${item.selectedColor}) - Qty: ${item.quantity} x ${formatUGX(p)}\n`;
    });
    const text = `Hello DAINTY STUDS AND CHAINS! I'd like to place an order:\n\n*ORDER ITEMS:*\n${itemDetails}\n*Subtotal:* ${formatUGX(cartSubtotal)}\n*Discount:* -${formatUGX(discountAmount)}\n*Credit Rebate:* -${formatUGX(creditAmount)}\n*Delivery:* ${formatUGX(deliveryFee)}\n*TOTAL:* ${formatUGX(cartTotal)} (${formatUSD(cartTotal)})\n\n*CUSTOMER:*\n- Name: ${checkoutData.name}\n- Phone: ${checkoutData.phone}\n- Email: ${checkoutData.email || 'N/A'}\n- Address: ${checkoutData.address}\n- Network: ${selectedNetwork || 'N/A'}\n- Notes: ${checkoutData.notes || 'None'}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── Relworx MoMo Submit ──────────────────────────────────
  const handleMobileMoneyCheckout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (cart.length === 0) return;
    
    // Strict Guard: Prevent double-click or multiple simultaneous prompts
    if (isSubmittingRef.current || loading) {
      return;
    }

    if (!selectedNetwork) { alert('Please select a payment network — MTN or Airtel.'); return; }

    const phoneToUse = momoPhone || checkoutData.phone;
    if (!phoneToUse) { alert('Please enter your Mobile Money number.'); return; }

    // Validate the phone matches the selected network
    const { msisdn, network: detected } = detectMobileNetwork(phoneToUse);
    if (detected === 'UNKNOWN') {
      alert('Could not detect your network. Enter a valid Uganda MTN or Airtel number (e.g. +256 701 234 567).');
      return;
    }

    // Cancel any active previous session
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const abortCtrl = new AbortController();
    activeAbortControllerRef.current = abortCtrl;

    isSubmittingRef.current = true;
    abortRef.current = false;
    setLoading(true);
    setPaymentStatus('polling');
    setPaymentError('');
    setPollAttempt(0);

    const orderRef = generateOrderReference();

    try {
      const result = await processFullPayment(
        { msisdn, amount: Math.round(cartTotal), reference: orderRef, description: `DAINTY Order – ${checkoutData.name}` },
        (status, attempt, reason) => {
          if (abortRef.current || abortCtrl.signal.aborted) return;
          setPollAttempt(attempt);
          if (status === 'failed') {
            abortCtrl.abort();
            setPaymentStatus('failed');
            if (reason) setPaymentError(reason);
          } else if (status === 'successful' || status === 'timeout') {
            setPaymentStatus(status);
          }
        },
        abortCtrl.signal
      );

      if (abortRef.current || abortCtrl.signal.aborted) return;
      setPaymentStatus(result.status);

      if (result.status === 'successful') {
        const newOrder = saveOrder({
          ...checkoutData,
          payment_method: `Mobile Money – ${selectedNetwork} (via Relworx)`,
          momo_phone: msisdn,
          momo_network: selectedNetwork,
          relworx_reference: orderRef,
          relworx_internal_reference: result.internal_reference,
          items: cart.map(item => ({
            product_id: item.id, name: item.name,
            quantity: item.quantity, color: item.selectedColor,
            price: item.sale_price || item.price,
          })),
          total_amount: cartTotal,
          discount_applied: discountAmount,
          coupon_code: couponCode,
        });
        onClearCart();
        setOrderPlaced(newOrder);
      } else if (result.status === 'failed') {
        setPaymentError(result.message || 'Payment was declined, cancelled, or has insufficient balance.');
      }
    } catch (err) {
      if (abortRef.current || abortCtrl.signal.aborted) return;
      console.error('[Relworx]', err);
      const msg = err.message || 'Payment initiation failed.';
      setPaymentError(msg);
      const isConfigIssue = msg.toLowerCase().includes('not configured') || msg.toLowerCase().includes('credentials') || msg.toLowerCase().includes('api key');
      setPaymentStatus(isConfigIssue ? 'not_configured' : 'failed');
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // ── Shopper Modal Renderer ───────────────────────────────
  const renderShopperModal = () => {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowShopperModal(false);
        }}
      >
        <div
          className="bg-white rounded-xl shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto"
          style={{ width: '100%', maxWidth: '500px', background: '#ffffff', borderRadius: '12px', padding: '1.75rem', position: 'relative', textAlign: 'left', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
        >
          <button
            type="button"
            onClick={() => setShowShopperModal(false)}
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#78716c', cursor: 'pointer', padding: '0.25rem' }}
            title="Close modal"
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fcebc5', color: '#7a5009', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1c1917', fontFamily: 'serif' }}>Separate Shopping Bags</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#78716c' }}>
                Each shopper can curate, manage, and checkout their own private bag separately.
              </p>
            </div>
          </div>

          {/* Current Active Bag */}
          <div style={{ background: '#faf8f5', border: '1px solid #e8e2d7', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1917' }}>
                {currentShopper?.name || 'Active Bag'}
              </span>
              <span style={{ background: '#1c1917', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                Active Now
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#78716c' }}>
              {currentShopper?.phone ? `Phone: ${currentShopper.phone} • ` : ''}
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in this bag
            </p>
          </div>

          {/* Switch to another saved shopper bag */}
          {savedShoppers.filter(s => s.id !== currentShopper?.id).length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#44403c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Switch to Another Bag on this Device
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                {savedShoppers.filter(s => s.id !== currentShopper?.id).map(shopper => {
                  const bagItems = getUserCart(shopper.id);
                  const count = bagItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
                  return (
                    <div
                      key={shopper.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{shopper.name || 'Shopper'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {shopper.phone || 'Guest'} • {count} {count === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchShopper) onSwitchShopper(shopper);
                          setShowShopperModal(false);
                        }}
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}
                      >
                        Open Bag
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Load / Create Separate Bag by Phone or Name */}
          <div style={{ borderTop: '1px solid #eae6e1', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#44403c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Load or Create a Separate Bag
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#44403c', marginBottom: '0.25rem' }}>
                  Customer / Shopper Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. David Pius, Sarah, Brenda"
                  value={newShopperName}
                  onChange={(e) => setNewShopperName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.8rem', border: '1px solid #d6d3d1', borderRadius: '6px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#44403c', marginBottom: '0.25rem' }}>
                  Mobile Money Phone Number (Uganda)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0740979898 or 0788227027"
                  value={newShopperPhone}
                  onChange={(e) => setNewShopperPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.8rem', border: '1px solid #d6d3d1', borderRadius: '6px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    const phone = newShopperPhone.trim();
                    const name = newShopperName.trim();
                    if (phone && onIdentifyShopper) {
                      onIdentifyShopper(phone, name, '');
                      setShowShopperModal(false);
                      setNewShopperName('');
                      setNewShopperPhone('');
                    } else if (name) {
                      const created = createNewShopper(name, phone, '');
                      if (onSwitchShopper) onSwitchShopper(created);
                      setShowShopperModal(false);
                      setNewShopperName('');
                      setNewShopperPhone('');
                    } else {
                      alert('Please provide a name or phone number for the new bag.');
                    }
                  }}
                  style={{ flex: 1, padding: '0.6rem 1rem', background: '#1c1917', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Load / Create Bag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fresh = createNewShopper('Guest Patron', '', '');
                    if (onSwitchShopper) onSwitchShopper(fresh);
                    setShowShopperModal(false);
                  }}
                  style={{ padding: '0.6rem 0.85rem', background: '#f5f5f4', color: '#44403c', border: '1px solid #d6d3d1', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Start Blank Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Order Success ────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="animate-fade-in" style={{
        maxWidth: '560px', margin: '5rem auto', padding: '3rem 2rem',
        textAlign: 'center', background: '#ffffff',
        border: '1px solid #eae6e1', borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(22,163,74,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto',
        }}>
          <CheckCircle2 size={36} style={{ color: '#16a34a' }} />
        </div>
        <h2 style={{ fontSize: '1.7rem', color: '#1c1917', marginBottom: '0.6rem', fontWeight: 800 }}>Order Confirmed! 🎉</h2>
        <p style={{ fontSize: '0.9rem', color: '#44403c', marginBottom: '1.5rem', lineHeight: '1.7' }}>
          Thank you for shopping at <strong>DAINTY STUDS AND CHAINS</strong>. Order <strong>#{orderPlaced.id}</strong>{' '}
          is confirmed. We'll reach you at <strong>{orderPlaced.customer_phone}</strong> shortly.
        </p>
        <div style={{
          padding: '1rem', background: '#f7f5f2', borderRadius: '8px',
          textAlign: 'left', marginBottom: '2rem', fontSize: '0.83rem',
          color: '#1c1917', border: '1px solid #eae6e1', lineHeight: '1.8',
        }}>
          <strong>Payment:</strong> {orderPlaced.payment_method}<br />
          <strong>Total Paid:</strong> {formatUGX(orderPlaced.total_amount)}<br />
          <strong>Delivery to:</strong> {orderPlaced.delivery_address}
        </div>
        <button className="btn-primary" onClick={() => navigateTo('shop')}>Continue Shopping</button>
      </div>
    );
  }

  // ── Empty Cart ───────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="animate-fade-in" style={{
        maxWidth: '560px', margin: '5rem auto', padding: '3.5rem 2rem',
        textAlign: 'center', background: '#ffffff',
        border: '1px solid #eae6e1', borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 0.85rem', background: '#faf8f5',
          border: '1px solid #e8e2d7', borderRadius: '20px',
          fontSize: '0.78rem', color: '#78716c', marginBottom: '1.5rem'
        }}>
          <Users size={14} style={{ color: '#b38728' }} />
          <span>Shopping Bag for: <strong style={{ color: '#1c1917' }}>{currentShopper?.name || 'Guest Client'}</strong></span>
        </div>

        <div>
          <ShoppingBag size={48} style={{ color: 'var(--color-gold-primary)', margin: '0 auto 1.25rem auto' }} />
          <h3 style={{ fontSize: '1.4rem', color: '#1c1917', marginBottom: '0.5rem', fontWeight: 700 }}>Your Bag is Empty</h3>
          <p style={{ fontSize: '0.9rem', color: '#78716c', marginBottom: '2rem' }}>
            No jewelry currently in this bag. You can explore our collection or switch to another shopper's bag.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigateTo('shop')}>Start Exploring Shop</button>
        </div>
      </div>
    );
  }

  // ── Main checkout ────────────────────────────────────────
  return (
    <div style={{ background: 'transparent', padding: '2.5rem 0' }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)} }

        .product-review-badge {
          color:#fff !important; background-color:#1c1917 !important;
          border-color:#1c1917 !important; -webkit-text-fill-color:#fff !important;
        }
        .relworx-brand-badge {
          display:inline-flex; align-items:center; gap:0.4rem;
          padding:0.22rem 0.65rem; background:rgba(197,155,39,0.10);
          border:1px solid rgba(197,155,39,0.3); border-radius:20px;
          font-size:0.67rem; font-weight:700; color:#9a7b20;
          letter-spacing:0.04em; text-transform:uppercase;
        }

        /* ── Network selector buttons ─────────────── */
        .network-selector-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-bottom: 0.5rem;
        }
        .network-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          cursor: pointer;
          border: 2.5px solid transparent;
          padding: 0;
          overflow: hidden;
          transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
          height: 80px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .network-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
        }
        .network-btn.mtn {
          border-color: rgba(255,200,0,0.35);
          background: linear-gradient(135deg, #fffdf0 0%, #fff9d6 100%);
        }
        .network-btn.mtn:hover, .network-btn.mtn.selected {
          border-color: #FFCC00;
          background: linear-gradient(135deg, #fffbe0 0%, #fff3a0 100%);
        }
        .network-btn.airtel {
          border-color: rgba(220,38,38,0.20);
          background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
        }
        .network-btn.airtel:hover, .network-btn.airtel.selected {
          border-color: #dc2626;
          background: linear-gradient(135deg, #fff0f0 0%, #ffd6d6 100%);
        }
        .network-btn.selected {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.12);
        }
        .network-btn.selected::after {
          content: '✓';
          position: absolute;
          top: 6px; right: 8px;
          font-size: 0.72rem;
          font-weight: 900;
          color: #fff;
          width: 18px; height: 18px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .network-btn.mtn.selected::after  { background: #c9a000; }
        .network-btn.airtel.selected::after { background: #dc2626; }

        .network-btn img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 10px 18px;
          transition: transform 0.22s ease;
        }
        .network-btn.mtn img   { padding: 14px 22px; }
        .network-btn.airtel img { padding: 14px 20px; }
        .network-btn:hover img  { transform: scale(1.04); }

        /* ── Checkout form fields slide-in ────────── */
        .checkout-fields-wrapper {
          animation: slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        /* ── MoMo number box ─────────────────────── */
        .momo-box {
          background: linear-gradient(135deg, #fdf9f0, #faf6ec);
          border: 1.5px solid rgba(197,155,39,0.4);
          border-radius: 12px;
          padding: 1.2rem;
          margin: 1.2rem 0 0 0;
        }
        .momo-box-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.85rem;
        }
        .momo-box-label {
          display: flex; align-items: center; gap: 0.45rem;
          font-size: 0.82rem; font-weight: 800; color: #1c1917;
        }
        .momo-input:focus {
          border-color: #c59b27 !important;
          box-shadow: 0 0 0 3px rgba(197,155,39,0.15) !important;
        }
        .momo-tip {
          font-size: 0.71rem; color: #78716c;
          margin-top: 0.45rem;
          display: flex; align-items: flex-start; gap: 0.3rem; line-height: 1.5;
        }
        .network-confirm-bar {
          margin-top: 0.7rem; padding: 0.5rem 0.85rem;
          border-radius: 8px; font-size: 0.75rem; font-weight: 600;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .selected-network-chip {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.15rem 0.5rem 0.15rem 0.2rem;
          border-radius: 20px; font-size: 0.67rem; font-weight: 800;
        }
      `}</style>

      {/* Payment Status Modal */}
      {paymentStatus && (
        <PaymentStatusModal
          status={paymentStatus}
          pollAttempt={pollAttempt}
          maxPolls={MAX_POLLS}
          phone={momoPhone || checkoutData.phone}
          network={selectedNetwork}
          errorMessage={paymentError}
          onClose={() => { abortRef.current = true; resetModal(); }}
          onRetry={resetModal}
          onWhatsAppCheckout={handleWhatsAppCheckout}
        />
      )}

      <div className="checkout-layout-grid animate-fade-in">

        {/* ══════════════════════════════════════════
            LEFT — Cart Summary
        ══════════════════════════════════════════ */}
        <div className="checkout-left-col">
          <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop'); }} className="checkout-back-link">
            <ArrowLeft size={15} /> Back to shop
          </a>

          {/* Shopper / Bag Identity Banner */}
          <div className="shopper-bag-header-banner">
            <div className="shopper-bag-info">
              <div className="shopper-bag-avatar">
                {(currentShopper?.name || 'G')[0].toUpperCase()}
              </div>
              <div>
                <h4 className="shopper-bag-title">
                  <span>Shopping Bag: {currentShopper?.name || 'Guest Client'}</span>
                  <span className="shopper-bag-badge">
                    {currentShopper?.phone ? currentShopper.phone : 'Personal Bag'}
                  </span>
                </h4>
                <p className="shopper-bag-subtitle">
                  Isolated, private bag · {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>

          <div className="product-review-card">
            <div className="product-review-header">
              <h3>Product Review</h3>
              <span className="product-review-badge"
                style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#1c1917', color: '#fff', border: '1px solid #1c1917', borderRadius: '20px', padding: '0.2rem 0.5rem' }}>
                {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* Interactive Items List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cart.map(item => {
                const activePrice = item.sale_price || item.price;
                const lineTotal = activePrice * item.quantity;
                return (
                  <div key={`${item.id}_${item.selectedColor}`} className="checkout-product-item">
                    <img src={item.images[0]} alt={item.name} className="checkout-prod-img" />
                    
                    <div className="checkout-prod-details">
                      <h4 className="checkout-prod-name">{item.name}</h4>
                      <div className="checkout-prod-meta">
                        Color: <strong style={{ color: '#1c1917' }}>{item.selectedColor}</strong> | SKU: {item.sku}
                      </div>
                      <div className="checkout-prod-unit-price">
                        {formatUGX(activePrice)}
                        {item.quantity > 1 && <span className="unit-label">({formatUGX(activePrice)} each)</span>}
                      </div>
                    </div>

                    <div className="checkout-prod-actions-box">
                      {/* Quantity Stepper */}
                      <div className="checkout-qty-stepper" role="group" aria-label="Item quantity controls">
                        <button
                          type="button"
                          className="checkout-qty-btn minus"
                          onClick={() => onUpdateQty && onUpdateQty(item.id, item.selectedColor, item.quantity - 1)}
                          title={item.quantity === 1 ? "Remove item from bag on second thought" : "Decrease quantity"}
                          aria-label="Decrease quantity"
                        >
                          {item.quantity === 1 ? <Trash2 size={13} style={{ color: '#dc2626' }} /> : <Minus size={13} />}
                        </button>
                        <span className="checkout-qty-val" aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          className="checkout-qty-btn plus"
                          onClick={() => onUpdateQty && onUpdateQty(item.id, item.selectedColor, item.quantity + 1)}
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="checkout-prod-total-price">
                        {formatUGX(lineTotal)}
                      </div>

                      {/* Explicit Remove / Delete Button */}
                      <button
                        type="button"
                        className="checkout-item-delete-btn"
                        onClick={() => onRemoveItem && onRemoveItem(item.id, item.selectedColor)}
                        title="Remove piece from bag on second thought"
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Entire Bag Option if multiple items */}
            {cart.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed #eae6e1' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remove all items from this shopping bag?')) {
                      if (onClearCart) onClearCart();
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#b91c1c', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.5rem' }}
                >
                  <Trash2 size={12} /> Clear all items from this bag
                </button>
              </div>
            )}

            {/* Coupon */}
            <div style={{ marginTop: '1.8rem', borderTop: '1px solid #eae6e1', paddingTop: '1.5rem' }}>
              <span className="method-label">Promo / Coupon Code</span>
              <div className="coupon-input-group">
                <input type="text" className="coupon-input" placeholder="Enter coupon code"
                  value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                <button type="button" className="coupon-btn"
                  style={{ backgroundColor: '#1c1917', color: '#fff', border: '1px solid #1c1917' }}
                  onClick={() => {
                    const c = couponCode.trim().toUpperCase();
                    if (c === 'DAINTY5')  handleApplyCoupon('DAINTY5', 5);
                    else if (c === 'DAINTY10') handleApplyCoupon('DAINTY10', 10);
                    else if (c === 'DAINTY15') handleApplyCoupon('DAINTY15', 15);
                    else if (c === '') handleApplyCoupon('', 0);
                    else alert('Invalid coupon! Try DAINTY5, DAINTY10, or DAINTY15.');
                  }}>Apply
                </button>
              </div>
              <div className="coupon-chips-wrapper">
                {[['DAINTY5', 5, '5% OFF'], ['DAINTY10', 10, '10% OFF'], ['DAINTY15', 15, '15% OFF']].map(([code, pct, label]) => (
                  <button key={code} type="button"
                    className={`coupon-chip ${couponCode === code ? 'active' : ''}`}
                    style={couponCode === code ? { backgroundColor: '#1c1917', color: '#fff', borderColor: '#1c1917' } : {}}
                    onClick={() => handleApplyCoupon(code, pct)}>{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice */}
            <div className="checkout-invoice-box">
              <div className="checkout-invoice-row"><span>Subtotal</span><span>{formatUGX(cartSubtotal)}</span></div>
              {discountAmount > 0 && (
                <div className="checkout-invoice-row discount">
                  <span>Discount ({discountPercentage}%)</span><span>-{formatUGX(discountAmount)}</span>
                </div>
              )}
              {creditAmount > 0 && (
                <div className="checkout-invoice-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Credit (1%) <HelpCircle size={12} title="1% loyalty credit rebate" />
                  </span>
                  <span>-{formatUGX(creditAmount)}</span>
                </div>
              )}
              <div className="checkout-invoice-row">
                <span>GST (10%) <span style={{ fontSize: '0.72rem', color: '#a8a29e' }}>(Inclusive)</span></span>
                <span>{formatUGX(gstInclusive)}</span>
              </div>
              <div className="checkout-invoice-row"><span>Delivery Fee</span><span>{formatUGX(deliveryFee)}</span></div>
              <div className="checkout-invoice-row total">
                <span>Total</span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                  <span>{formatUGX(cartTotal)}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#78716c', marginTop: '0.1rem' }}>{formatUSD(cartTotal)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="checkout-left-footer">
            <a href="#/policy">Privacy</a>
            <a href="#/policy">Policy</a>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — Payment Form
        ══════════════════════════════════════════ */}
        <div className="payment-card">

          {/* Steps */}
          <div className="checkout-steps-tracker">
            <div className="checkout-step completed">
              <span className="step-icon-checked"><Check size={16} strokeWidth={3} /></span>
              <span>Information</span>
            </div>
            <div className="step-divider" />
            <div className="checkout-step active">
              <span className="step-number" style={{ backgroundColor: '#1c1917', color: '#fff', border: '1px solid #1c1917' }}>2</span>
              <span>Payment</span>
            </div>
            <div className="step-divider" />
            <div className="checkout-step">
              <span className="step-number">3</span>
              <span>Completed</span>
            </div>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <h3 className="payment-title" style={{ margin: 0 }}>Mobile Money Payment</h3>
            <span className="relworx-brand-badge">
              <ShieldCheck size={11} /> Powered by Relworx
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#78716c', marginBottom: '1.4rem', lineHeight: '1.55' }}>
            Choose your mobile money operator below to pay securely. A USSD prompt will be sent to your phone for approval.
          </p>

          {/* ── NETWORK SELECTOR — logo-only clickable buttons ── */}
          <span className="method-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
            Select Payment Network
          </span>
          <div className="network-selector-grid">
            {/* MTN Button */}
            <button
              type="button"
              className={`network-btn mtn ${selectedNetwork === 'MTN' ? 'selected' : ''}`}
              onClick={() => setSelectedNetwork(selectedNetwork === 'MTN' ? null : 'MTN')}
              aria-label="Pay with MTN Mobile Money"
              aria-pressed={selectedNetwork === 'MTN'}
              title="MTN Mobile Money"
            >
              <img src={MTN_LOGO} alt="MTN Mobile Money" />
            </button>

            {/* Airtel Button */}
            <button
              type="button"
              className={`network-btn airtel ${selectedNetwork === 'AIRTEL' ? 'selected' : ''}`}
              onClick={() => setSelectedNetwork(selectedNetwork === 'AIRTEL' ? null : 'AIRTEL')}
              aria-label="Pay with Airtel Money"
              aria-pressed={selectedNetwork === 'AIRTEL'}
              title="Airtel Money"
            >
              <img src={AIRTEL_LOGO} alt="Airtel Money" />
            </button>
          </div>

          {/* Selection hint */}
          {!selectedNetwork && (
            <p style={{ fontSize: '0.75rem', color: '#a8a29e', textAlign: 'center', marginTop: '0.6rem', marginBottom: '0.5rem' }}>
              👆 Tap your network operator logo to continue
            </p>
          )}

          {/* Selected network chip */}
          {selectedNetwork && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', marginBottom: '0.2rem' }}>
              <span className="selected-network-chip" style={{
                background: selectedNetwork === 'MTN' ? 'rgba(255,204,0,0.18)' : 'rgba(220,38,38,0.10)',
                border: `1.5px solid ${selectedNetwork === 'MTN' ? 'rgba(255,204,0,0.6)' : 'rgba(220,38,38,0.35)'}`,
                color: selectedNetwork === 'MTN' ? '#7a5a00' : '#b91c1c',
              }}>
                <img
                  src={selectedNetwork === 'MTN' ? MTN_LOGO : AIRTEL_LOGO}
                  alt={selectedNetwork}
                  style={{
                    height: '16px', objectFit: 'contain', borderRadius: '3px',
                    padding: selectedNetwork === 'MTN' ? '1px 4px' : '1px 3px',
                    background: selectedNetwork === 'MTN' ? '#FFCC00' : '#fff',
                    border: '1px solid rgba(0,0,0,0.07)',
                  }}
                />
                {selectedNetwork === 'MTN' ? 'MTN Mobile Money selected' : 'Airtel Money selected'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNetwork(null)}
                style={{
                  fontSize: '0.68rem', color: '#a8a29e',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textDecoration: 'underline', padding: 0,
                }}
              >
                Change
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════
              FORM — only shown when a network is selected
          ════════════════════════════════════════════ */}
          {selectedNetwork && (
            <form onSubmit={handleMobileMoneyCheckout} className="checkout-fields-wrapper">
              <div style={{ borderTop: '1px solid #eae6e1', marginTop: '1.4rem', paddingTop: '1.4rem' }}>

                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" style={{ color: '#1c1917' }}>Full Name *</label>
                  <input type="text" name="name" required className="form-input"
                    value={checkoutData.name} onChange={handleInputChange} placeholder="Amara Nakato" />
                </div>

                {/* Billing Phone */}
                <div className="form-group">
                  <label className="form-label" style={{ color: '#1c1917' }}>Billing Phone *</label>
                  <input type="tel" name="phone" required className="form-input"
                    value={checkoutData.phone} onChange={handleInputChange}
                    placeholder="e.g. +256 701 234 567" />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label" style={{ color: '#1c1917' }}>Email Address</label>
                  <input type="email" name="email" className="form-input"
                    value={checkoutData.email} onChange={handleInputChange}
                    placeholder="name@example.com" />
                </div>

                {/* Delivery Address */}
                <div className="form-group">
                  <label className="form-label" style={{ color: '#1c1917' }}>Delivery Address *</label>
                  <textarea name="address" required rows="2" className="form-textarea"
                    value={checkoutData.address} onChange={handleInputChange}
                    placeholder="Street / Apartment / District / Landmark" />
                </div>

                {/* ── Mobile Money Number ──────────────── */}
                <div className="momo-box">
                  <div className="momo-box-header">
                    <div className="momo-box-label">
                      <Smartphone size={15} style={{ color: '#c59b27' }} />
                      Mobile Money Number
                    </div>
                    {/* Inline network logo in the box header */}
                    <img
                      src={selectedNetwork === 'MTN' ? MTN_LOGO : AIRTEL_LOGO}
                      alt={selectedNetwork}
                      style={{
                        height: '24px', objectFit: 'contain', borderRadius: '5px',
                        padding: selectedNetwork === 'MTN' ? '2px 7px' : '2px 5px',
                        background: selectedNetwork === 'MTN' ? '#FFCC00' : '#fff',
                        border: '1px solid rgba(0,0,0,0.08)',
                      }}
                    />
                  </div>

                  {/* Receiving account info */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.4rem 0.7rem', borderRadius: '6px', marginBottom: '0.7rem',
                    background: selectedNetwork === 'MTN' ? 'rgba(255,204,0,0.12)' : 'rgba(220,38,38,0.07)',
                    border: `1px solid ${selectedNetwork === 'MTN' ? 'rgba(255,204,0,0.35)' : 'rgba(220,38,38,0.2)'}`,
                    fontSize: '0.72rem', color: selectedNetwork === 'MTN' ? '#7a5a00' : '#991b1b',
                  }}>
                    <img
                      src={selectedNetwork === 'MTN' ? MTN_LOGO : AIRTEL_LOGO}
                      alt={selectedNetwork}
                      style={{
                        height: '16px', objectFit: 'contain', borderRadius: '3px',
                        padding: selectedNetwork === 'MTN' ? '1px 4px' : '1px 3px',
                        background: selectedNetwork === 'MTN' ? '#FFCC00' : '#fff',
                        border: '1px solid rgba(0,0,0,0.07)', flexShrink: 0,
                      }}
                    />
                    <span>
                      Paying to: <strong>{getMerchantNumber(selectedNetwork)}</strong>
                      {' '}· DAINTY Studs &amp; Chains
                    </span>
                  </div>

                  <input
                    type="tel"
                    className="form-input momo-input"
                    placeholder={selectedNetwork === 'MTN' ? '+256 77X XXX XXX' : '+256 70X XXX XXX'}
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    required
                    style={{ fontWeight: 600, letterSpacing: '0.05em' }}
                  />

                  <p className="momo-tip">
                    <Info size={11} style={{ flexShrink: 0, marginTop: '2px' }} />
                    Enter the number linked to your {selectedNetwork === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'} wallet.
                    This is where the USSD payment prompt will be sent.
                  </p>
                </div>

                {/* Order Notes */}
                <div className="form-group" style={{ marginTop: '1.2rem' }}>
                  <label className="form-label" style={{ color: '#1c1917' }}>Order Notes (Optional)</label>
                  <textarea name="notes" rows="1" className="form-textarea"
                    value={checkoutData.notes} onChange={handleInputChange}
                    placeholder="Special instructions, gift wrap, custom messages..." />
                </div>

                {/* Secure save */}
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.6rem', marginTop: '1rem' }}>
                  <input type="checkbox" id="secure-save-check" checked={secureSave}
                    onChange={(e) => setSecureSave(e.target.checked)}
                    style={{ marginTop: '0.2rem', cursor: 'pointer' }} />
                  <label htmlFor="secure-save-check" style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1c1917', display: 'block' }}>
                      Securely save my information for 1-click checkout
                    </span>
                    <span className="checkout-save-info-note">
                      Pay faster on Dainty, Inc. and everywhere your link is accepted.
                    </span>
                  </label>
                </div>

                {/* Server configuration notice if credentials are not detected */}
                {!relworxServerConfigured && (
                  <div style={{
                    marginTop: '1.2rem', padding: '0.85rem 1rem',
                    background: 'rgba(197,155,39,0.08)', border: '1.5px solid rgba(197,155,39,0.3)',
                    borderRadius: '10px', fontSize: '0.78rem', color: '#7a5a00',
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '0.1rem', color: '#b38728' }} />
                    <div>
                      <strong>Relworx Payment Setup:</strong>{' '}
                      Relworx gateway credentials can be set in the Admin Dashboard under Settings or in your Hostinger environment. You can also complete transactions directly via WhatsApp below.
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.8rem', alignItems: 'center' }}>
                  <button type="submit" className="checkout-pay-btn" disabled={loading}
                    style={{
                      width: '270px', maxWidth: '100%', justifyContent: 'center',
                      backgroundColor: '#1c1917', color: '#fff', border: '1px solid #1c1917',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                    {loading
                      ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                      : <><Smartphone size={16} /> Pay {formatUGX(cartTotal)} via {selectedNetwork === 'MTN' ? 'MTN MoMo' : 'Airtel Money'}</>
                    }
                  </button>

                  <button type="button" className="btn-whatsapp" onClick={handleWhatsAppCheckout}
                    style={{ width: '270px', maxWidth: '100%', padding: '0.65rem 1rem', fontSize: '0.82rem', justifyContent: 'center', borderRadius: '30px' }}>
                    <MessageSquareText size={18} /> Checkout via WhatsApp
                  </button>
                </div>

                {/* Security footer strip with logos */}
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  gap: '0.6rem', marginTop: '1.4rem', flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', color: '#a8a29e' }}>
                    <ShieldCheck size={12} style={{ color: '#c59b27' }} />256-bit SSL
                  </div>
                  <span style={{ color: '#d4cfc9', fontSize: '0.65rem' }}>·</span>
                  <img src={MTN_LOGO} alt="MTN Mobile Money"
                    style={{ height: '20px', objectFit: 'contain', borderRadius: '4px', padding: '2px 6px', background: '#FFCC00' }} />
                  <img src={AIRTEL_LOGO} alt="Airtel Money"
                    style={{ height: '20px', objectFit: 'contain', borderRadius: '4px', padding: '2px 4px', background: '#fff', border: '1px solid #f0ece4' }} />
                  <span style={{ color: '#d4cfc9', fontSize: '0.65rem' }}>·</span>
                  <span style={{ fontSize: '0.68rem', color: '#a8a29e' }}>Relworx Certified</span>
                </div>
              </div>
            </form>
          )}

          {/* WhatsApp only (no network selected) */}
          {!selectedNetwork && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button type="button" className="btn-whatsapp" onClick={handleWhatsAppCheckout}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.82rem', justifyContent: 'center', borderRadius: '30px' }}>
                <MessageSquareText size={18} /> Checkout via WhatsApp instead
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Shopper / Multi-User Bag Switcher Modal */}
      {showShopperModal && renderShopperModal()}
    </div>
  );
}
