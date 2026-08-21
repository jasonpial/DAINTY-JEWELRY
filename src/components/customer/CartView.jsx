import { useState } from 'react';
import { ShoppingBag, MessageSquareText, ShieldCheck, ArrowLeft, CreditCard, Smartphone, Check, HelpCircle } from 'lucide-react';
import { formatUGX, formatUSD } from './ProductCard';
import { navigateTo } from '../../Router';
import { saveOrder } from '../../db';

export default function CartView({ cart, _onUpdateQty, _onRemoveItem, onClearCart }) {
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'momo_cod'
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [secureSave, setSecureSave] = useState(true);
  
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [loading, setLoading] = useState(false);

  const cartSubtotal = cart.reduce((acc, item) => {
    const activePrice = item.sale_price || item.price;
    return acc + (activePrice * item.quantity);
  }, 0);

  // Compute invoice calculations matching screenshot columns
  const discountAmount = cartSubtotal * (discountPercentage / 100);
  const creditAmount = cartSubtotal > 0 ? cartSubtotal * 0.01 : 0; // 1% credit rebate
  const deliveryFee = cartSubtotal > 0 ? 10000 : 0; // Flat 10,000 UGX delivery fee
  const cartTotal = Math.max(0, cartSubtotal - discountAmount - creditAmount + deliveryFee);
  
  // Tax (10% GST/VAT Inclusive)
  const gstInclusiveAmount = cartTotal > 0 ? (cartTotal * 0.10) : 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    // Format card number with spaces for high fidelity
    let formattedVal = value;
    if (name === 'number') {
      formattedVal = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
    } else if (name === 'expiry') {
      formattedVal = value.replace(/\//g, '').replace(/(\d{2})/g, '$1/').trim().substring(0, 5);
      if (formattedVal.endsWith('/')) {
        formattedVal = formattedVal.slice(0, -1);
      }
    } else if (name === 'cvc') {
      formattedVal = value.replace(/\D/g, '').substring(0, 3);
    }
    setCardData(prev => ({ ...prev, [name]: formattedVal }));
  };

  const handleApplyCoupon = (code, percentage) => {
    setCouponCode(code);
    setDiscountPercentage(percentage);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      // Structure checkout parameters
      const items = cart.map(item => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        color: item.selectedColor,
        price: item.sale_price || item.price
      }));

      const newOrder = saveOrder({
        ...checkoutData,
        payment_method: paymentMethod === 'card' ? 'Debit/Credit Card' : 'Mobile Money / COD',
        card_details: paymentMethod === 'card' ? {
          card_number: cardData.number.replace(/\d(?=\d{4})/g, '*'), // Mask card number for security
          cardholder_name: checkoutData.name
        } : null,
        items,
        total_amount: cartTotal,
        discount_applied: discountAmount,
        coupon_code: couponCode
      });

      setLoading(false);
      setOrderPlaced(newOrder);
      onClearCart();
    }, 1500);
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
      alert('Please fill in your Name, Phone, and Delivery Address first to compile the WhatsApp order details!');
      return;
    }

    const number = '+256700000000';
    let itemDetails = '';
    cart.forEach((item, index) => {
      const activePrice = item.sale_price || item.price;
      itemDetails += `${index + 1}. *${item.name}* (${item.selectedColor}) - Qty: ${item.quantity} x ${formatUGX(activePrice)}\n`;
    });

    const text = `Hello DAINTY STUDS AND CHAINS! I would like to place a new order:

*ORDER ITEMS:*
${itemDetails}
*Subtotal:* ${formatUGX(cartSubtotal)}
*Discount (${discountPercentage}%):* -${formatUGX(discountAmount)}
*Credit Rebate:* -${formatUGX(creditAmount)}
*Delivery Fee:* ${formatUGX(deliveryFee)}
*Total Amount:* ${formatUGX(cartTotal)} (${formatUSD(cartTotal)})

*CUSTOMER INFORMATION:*
- *Name:* ${checkoutData.name}
- *Phone:* ${checkoutData.phone}
- *Email:* ${checkoutData.email || 'N/A'}
- *Delivery Address:* ${checkoutData.address}
- *Payment Mode:* ${paymentMethod === 'card' ? 'Debit/Credit Card' : 'Mobile Money / Cash on Delivery'}
- *Notes:* ${checkoutData.notes || 'None'}

Please confirm receipt and guide me on payment details!`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${number}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // If order is placed successfully, show congratulations message
  if (orderPlaced) {
    return (
      <div style={{ maxWidth: '600px', margin: '6rem auto', padding: '3rem 2rem', textAlign: 'center', background: '#ffffff', border: '1px solid #eae6e1', borderRadius: '12px', color: '#1c1917', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} className="animate-fade-in">
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(194, 139, 83, 0.15)', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 1.5rem auto' }}>
          <ShieldCheck size={36} style={{ color: 'var(--color-gold-dark)' }} />
        </div>
        <h2 style={{ fontSize: '1.8rem', color: '#1c1917', marginBottom: '0.8rem' }}>Order Placed Successfully!</h2>
        <p style={{ fontSize: '0.95rem', color: '#44403c', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Thank you for choosing **DAINTY STUDS AND CHAINS**. Your order ID is **#${orderPlaced.id}**. We will contact you on **${orderPlaced.customer_phone}** shortly to confirm delivery schedules.
        </p>
        <div style={{ padding: '1rem', background: '#f7f5f2', borderRadius: '6px', textAlign: 'left', marginBottom: '2rem', fontSize: '0.85rem', color: '#1c1917', border: '1px solid #eae6e1' }}>
          <strong>Payment Mode:</strong> {orderPlaced.payment_method} <br />
          <strong>Total Paid:</strong> {formatUGX(orderPlaced.total_amount)} <br />
          <strong>Delivery to:</strong> {orderPlaced.delivery_address}
        </div>
        <button className="btn-primary" onClick={() => navigateTo('shop')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  // If cart is empty, show empty state
  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '6rem auto', padding: '4rem 2rem', textAlign: 'center', background: '#ffffff', border: '1px solid #eae6e1', borderRadius: '12px' }} className="animate-fade-in">
        <ShoppingBag size={48} style={{ color: 'var(--color-gold-primary)', marginBottom: '1.5rem' }} />
        <h3 style={{ fontSize: '1.4rem', color: '#1c1917', marginBottom: '0.5rem', fontWeight: 700 }}>Your Bag is Empty</h3>
        <p style={{ fontSize: '0.9rem', color: '#78716c', marginBottom: '2rem' }}>
          You haven't added any jewelry products to your bag yet. Explore our signature collection today.
        </p>
        <button className="btn-primary" onClick={() => navigateTo('shop')}>
          Start Exploring Shop
        </button>
      </div>
    );
  }
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ background: 'transparent', padding: '2.5rem 0' }}>
      <style>{`
        .product-review-badge,
        span.product-review-badge {
          color: #ffffff !important;
          background-color: #1c1917 !important;
          border-color: #1c1917 !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>
      <div className="checkout-layout-grid animate-fade-in">
        
        {/* Left Column: Product Review & Summary */}
        <div className="checkout-left-col">
          <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('shop'); }} className="checkout-back-link">
            <ArrowLeft size={15} /> Back to shop
          </a>

          {/* Product Review Card */}
          <div className="product-review-card">
            <div className="product-review-header">
              <h3>Product Review</h3>
              <span className="product-review-badge" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#1c1917', color: '#ffffff', border: '1px solid #1c1917', borderRadius: '20px', padding: '0.2rem 0.5rem' }}>{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</span>
            </div>

            {/* Cart Product List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cart.map(item => {
                const activePrice = item.sale_price || item.price;
                return (
                  <div key={`${item.id}_${item.selectedColor}`} className="checkout-product-item">
                    <img src={item.images[0]} alt={item.name} className="checkout-prod-img" />
                    <div className="checkout-prod-details">
                      <h4 className="checkout-prod-name">{item.name}</h4>
                      <div className="checkout-prod-meta">
                        Color: {item.selectedColor} | SKU: {item.sku}
                      </div>
                    </div>
                    <div className="checkout-prod-price-box">
                      <div className="checkout-prod-price">{formatUGX(activePrice)}</div>
                      <div className="checkout-prod-qty">Qty: {item.quantity}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Section */}
            <div style={{ marginTop: '1.8rem', borderTop: '1px solid #eae6e1', paddingTop: '1.5rem' }}>
              <span className="method-label">Promo / Coupon Code</span>
              <div className="coupon-input-group">
                <input 
                  type="text" 
                  className="coupon-input" 
                  placeholder="Enter coupon code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button 
                  type="button" 
                  className="coupon-btn"
                  style={{ backgroundColor: '#1c1917', color: '#ffffff', border: '1px solid #1c1917' }}
                  onClick={() => {
                    const cleanCode = couponCode.trim().toUpperCase();
                    if (cleanCode === 'DAINTY5') handleApplyCoupon('DAINTY5', 5);
                    else if (cleanCode === 'DAINTY10') handleApplyCoupon('DAINTY10', 10);
                    else if (cleanCode === 'DAINTY15') handleApplyCoupon('DAINTY15', 15);
                    else if (cleanCode === '') handleApplyCoupon('', 0);
                    else alert('Invalid coupon code! Try DAINTY5, DAINTY10, or DAINTY15.');
                  }}
                >
                  Apply
                </button>
              </div>
              <div className="coupon-chips-wrapper">
                <button 
                  type="button" 
                  className={`coupon-chip ${couponCode === 'DAINTY5' ? 'active' : ''}`}
                  style={couponCode === 'DAINTY5' ? { backgroundColor: '#1c1917', color: '#ffffff', borderColor: '#1c1917' } : {}}
                  onClick={() => handleApplyCoupon('DAINTY5', 5)}
                >
                  5% OFF
                </button>
                <button 
                  type="button" 
                  className={`coupon-chip ${couponCode === 'DAINTY10' ? 'active' : ''}`}
                  style={couponCode === 'DAINTY10' ? { backgroundColor: '#1c1917', color: '#ffffff', borderColor: '#1c1917' } : {}}
                  onClick={() => handleApplyCoupon('DAINTY10', 10)}
                >
                  10% OFF
                </button>
                <button 
                  type="button" 
                  className={`coupon-chip ${couponCode === 'DAINTY15' ? 'active' : ''}`}
                  style={couponCode === 'DAINTY15' ? { backgroundColor: '#1c1917', color: '#ffffff', borderColor: '#1c1917' } : {}}
                  onClick={() => handleApplyCoupon('DAINTY15', 15)}
                >
                  15% OFF
                </button>
              </div>
            </div>

            {/* Summary details */}
            <div className="checkout-invoice-box">
              <div className="checkout-invoice-row">
                <span>Subtotal</span>
                <span>{formatUGX(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="checkout-invoice-row discount">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>-{formatUGX(discountAmount)}</span>
                </div>
              )}
              {creditAmount > 0 && (
                <div className="checkout-invoice-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Credit (1%) <HelpCircle size={12} title="1% credit loyalty rebate automatically applied" />
                  </span>
                  <span>-{formatUGX(creditAmount)}</span>
                </div>
              )}
              <div className="checkout-invoice-row">
                <span>GST (10%) <span style={{ fontSize: '0.72rem', color: '#a8a29e' }}>(Inclusive)</span></span>
                <span>{formatUGX(gstInclusiveAmount)}</span>
              </div>
              <div className="checkout-invoice-row">
                <span>Delivery Fee</span>
                <span>{formatUGX(deliveryFee)}</span>
              </div>
              <div className="checkout-invoice-row total">
                <span>Total</span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                  <span>{formatUGX(cartTotal)}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#78716c', marginTop: '0.1rem' }}>
                    {formatUSD(cartTotal)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & policy links */}
          <div className="checkout-left-footer">
            <a href="#/policy">Privacy</a>
            <a href="#/policy">Policy</a>
          </div>
        </div>

        {/* Right Column: Checkout Form (Rounded shadow payment-card) */}
        <div className="payment-card">
          
          {/* Progress Steps Tracker */}
          <div className="checkout-steps-tracker">
            <div className="checkout-step completed">
              <span className="step-icon-checked"><Check size={16} strokeWidth={3} /></span>
              <span>Information</span>
            </div>
            <div className="step-divider"></div>
            <div className="checkout-step active">
              <span className="step-number" style={{ backgroundColor: '#1c1917', color: '#ffffff', border: '1px solid #1c1917' }}>2</span>
              <span>Payment</span>
            </div>
            <div className="step-divider"></div>
            <div className="checkout-step">
              <span className="step-number">3</span>
              <span>Completed</span>
            </div>
          </div>

          <h3 className="payment-title">Enter Payment Details</h3>

          {/* Select payment method tabs */}
          <span className="method-label">Select method</span>
          <div className="payment-method-selector">
            <button 
              type="button" 
              className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <span className="payment-tab-icon"><CreditCard size={18} /></span>
              <span className="payment-tab-title">Debit / Credit Card</span>
            </button>
            <button 
              type="button" 
              className={`payment-tab-btn ${paymentMethod === 'momo_cod' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('momo_cod')}
            >
              <span className="payment-tab-icon"><Smartphone size={18} /></span>
              <span className="payment-tab-title">Mobile Money / COD</span>
            </button>
          </div>

          {/* Billing Form */}
          <form onSubmit={handleCheckoutSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#1c1917' }}>Full Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={checkoutData.name}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="Duran Clayton"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#1c1917' }}>Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                value={checkoutData.phone}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="e.g. +256 700 000 000"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#1c1917' }}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={checkoutData.email}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#1c1917' }}>Delivery Address *</label>
              <textarea 
                name="address" 
                required 
                rows="2"
                value={checkoutData.address}
                onChange={handleInputChange}
                className="form-textarea" 
                placeholder="Street / Apartment / Kampala District / Landmark details"
              />
            </div>

            {/* Payment Mode Specific Inputs */}
            {paymentMethod === 'card' ? (
              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
                <div className="form-group">
                  <label className="form-label" style={{ color: '#1c1917' }}>Card Information *</label>
                  <div className="form-input-icon-wrapper">
                    <span className="form-input-icon"><CreditCard size={16} /></span>
                    <input 
                      type="text" 
                      name="number" 
                      required={paymentMethod === 'card'}
                      value={cardData.number}
                      onChange={handleCardInputChange}
                      className="form-input form-input-with-icon" 
                      placeholder="**** **** 1234 1234"
                    />
                  </div>
                </div>

                <div className="card-fields-grid">
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="expiry" 
                      required={paymentMethod === 'card'}
                      value={cardData.expiry}
                      onChange={handleCardInputChange}
                      className="form-input" 
                      placeholder="09/28"
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="password" 
                      name="cvc" 
                      required={paymentMethod === 'card'}
                      value={cardData.cvc}
                      onChange={handleCardInputChange}
                      className="form-input" 
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '0.8rem 1rem', background: '#fcfaf7', border: '1px dashed var(--color-border-gold)', borderRadius: '6px', margin: '1rem 0', fontSize: '0.82rem', color: '#57534e' }} className="animate-fade-in">
                🚀 <strong>Cash on Delivery (COD) / Mobile Money payment method active.</strong> <br />
                We will dispatch your order and collect cash, or initiate Mobile Money transfer to <strong>+256 700 000 000</strong> upon parcel delivery.
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ color: '#1c1917' }}>Order Notes (Optional)</label>
              <textarea 
                name="notes" 
                rows="1"
                value={checkoutData.notes}
                onChange={handleInputChange}
                className="form-textarea" 
                placeholder="Special instructions e.g. color variant choices, gift wraps, custom card scripts"
              />
            </div>

            {/* Checkbox */}
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.6rem', marginTop: '1.2rem' }}>
              <input 
                type="checkbox" 
                id="secure-save-check"
                checked={secureSave}
                onChange={(e) => setSecureSave(e.target.checked)}
                style={{ marginTop: '0.2rem', cursor: 'pointer' }}
              />
              <label htmlFor="secure-save-check" style={{ cursor: 'pointer', select: 'none' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1c1917', display: 'block' }}>
                  Securely save my information for 1-click checkout
                </span>
                <span className="checkout-save-info-note">
                  Pay faster on Dainty, Inc. and everywhere your link is accepted.
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.8rem', alignItems: 'center' }}>
              <button 
                type="submit" 
                className="checkout-pay-btn" 
                disabled={loading}
                style={{ width: '210px', maxWidth: '100%', justifyContent: 'center', backgroundColor: '#1c1917', color: '#ffffff', border: '1px solid #1c1917' }}
              >
                {loading ? 'Processing Order...' : 'Pay now'}
              </button>
              
              <button 
                type="button" 
                className="btn-whatsapp" 
                onClick={handleWhatsAppCheckout}
                style={{ width: '210px', maxWidth: '100%', padding: '0.65rem 1rem', fontSize: '0.82rem', justifyContent: 'center', borderRadius: '30px' }}
              >
                <MessageSquareText size={18} /> Checkout via WhatsApp
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
