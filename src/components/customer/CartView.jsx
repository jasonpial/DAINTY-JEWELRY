import { useState } from 'react';
import { Trash2, ShoppingBag, MessageSquareText, ShieldCheck, ArrowLeft } from 'lucide-react';
import { formatUGX } from './ProductCard';
import { navigateTo } from '../../Router';
import { saveOrder } from '../../db';

export default function CartView({ cart, onUpdateQty, onRemoveItem, onClearCart }) {
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [loading, setLoading] = useState(false);

  const cartSubtotal = cart.reduce((acc, item) => {
    const activePrice = item.sale_price || item.price;
    return acc + (activePrice * item.quantity);
  }, 0);

  const deliveryFee = cartSubtotal > 0 ? 10000 : 0; // Flat 10,000 UGX delivery fee
  const cartTotal = cartSubtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
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
        items,
        total_amount: cartTotal
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
*Delivery Fee:* ${formatUGX(deliveryFee)}
*Total Amount:* ${formatUGX(cartTotal)}

*CUSTOMER INFORMATION:*
- *Name:* ${checkoutData.name}
- *Phone:* ${checkoutData.phone}
- *Email:* ${checkoutData.email || 'N/A'}
- *Delivery Address:* ${checkoutData.address}
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
          <strong>Total Paid (On Delivery):</strong> {formatUGX(orderPlaced.total_amount)} <br />
          <strong>Delivery to:</strong> {orderPlaced.delivery_address}
        </div>
        <button className="btn-primary" onClick={() => navigateTo('shop')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'transparent', padding: '3rem 0' }}>
      <div className="cart-layout">
        
        {/* Cart List */}
        <div className="cart-items-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #eae6e1', paddingBottom: '0.8rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#1c1917' }}>Your Shopping Bag</h2>
            <button 
              onClick={() => navigateTo('shop')}
              style={{ background: 'none', border: 'none', color: 'var(--color-gold-dark)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <ArrowLeft size={14} /> Back to shop
            </button>
          </div>

          {cart.length > 0 ? (
            cart.map(item => {
              const activePrice = item.sale_price || item.price;
              return (
                <div key={`${item.id}_${item.selectedColor}`} className="cart-item-row animate-fade-in">
                  <img src={item.images[0]} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h3 className="cart-item-name" style={{ color: '#1c1917' }}>{item.name}</h3>
                    <div className="cart-item-meta" style={{ color: '#78716c' }}>
                      <span>Color: {item.selectedColor}</span> | <span>SKU: {item.sku}</span>
                    </div>
                    <div className="cart-item-qty">
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.selectedColor, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.4rem', color: '#1c1917' }}>{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.selectedColor, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 600, color: '#1c1917', display: 'block', fontSize: '0.95rem' }}>
                      {formatUGX(activePrice * item.quantity)}
                    </span>
                    <button 
                      onClick={() => onRemoveItem(item.id, item.selectedColor)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', marginTop: '0.5rem' }}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '6rem 2rem', textAlign: 'center', background: '#fcfbfa', borderRadius: '8px', border: '1px solid #eae6e1' }}>
              <ShoppingBag size={48} style={{ color: '#a8a29e', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#1c1917', marginBottom: '0.5rem' }}>Your Bag is Empty</h3>
              <p style={{ fontSize: '0.85rem', color: '#78716c', marginBottom: '1.5rem' }}>
                You haven't added any jewelry products to your bag yet.
              </p>
              <button className="btn-primary" onClick={() => navigateTo('shop')}>
                Start Exploring Shop
              </button>
            </div>
          )}
        </div>

        {/* Checkout Forms Panel (styled via className in index.css) */}
        <div className="cart-checkout-panel animate-fade-in">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #eae6e1', paddingBottom: '0.8rem', marginBottom: '1.5rem', color: '#1c1917' }}>Order Checkout</h3>
          
          <div className="checkout-summary-row" style={{ color: '#44403c' }}>
            <span>Subtotal</span>
            <span>{formatUGX(cartSubtotal)}</span>
          </div>
          <div className="checkout-summary-row" style={{ color: '#44403c' }}>
            <span>Delivery Fee</span>
            <span>{formatUGX(deliveryFee)}</span>
          </div>
          <div className="checkout-summary-row total" style={{ borderTop: '1px solid #eae6e1', color: '#1c1917' }}>
            <span>Total UGX</span>
            <span>{formatUGX(cartTotal)}</span>
          </div>

          {cart.length > 0 && (
            <form onSubmit={handleCheckoutSubmit} style={{ marginTop: '2rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#1c1917' }}>Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={checkoutData.name}
                  onChange={handleInputChange}
                  className="form-input" 
                  placeholder="Enter your name"
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
                  rows="3"
                  value={checkoutData.address}
                  onChange={handleInputChange}
                  className="form-textarea" 
                  placeholder="Street / Apartment / Kampala District / Landmark details"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#1c1917' }}>Order Notes (Optional)</label>
                <textarea 
                  name="notes" 
                  rows="2"
                  value={checkoutData.notes}
                  onChange={handleInputChange}
                  className="form-textarea" 
                  placeholder="Special instructions e.g. color variant choices, gift wraps, custom card scripts"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '2rem' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading} 
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading ? 'Processing Order...' : 'Confirm Cash on Delivery'}
                </button>
                <button 
                  type="button" 
                  className="btn-whatsapp" 
                  onClick={handleWhatsAppCheckout}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <MessageSquareText size={18} /> Checkout via WhatsApp
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
