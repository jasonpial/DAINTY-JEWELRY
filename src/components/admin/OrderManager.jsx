import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../db';
import { formatUGX } from '../customer/ProductCard';
import { Truck, RefreshCw, ClipboardList, PhoneCall } from 'lucide-react';

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const reloadOrders = () => {
    setOrders(getOrders().reverse()); // Show newest first
  };

  useEffect(() => {
    reloadOrders();

    // Cross-tab real-time sync for order listings!
    const handleStorageChange = () => {
      reloadOrders();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    if (updated) {
      reloadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1.1fr 0.9fr' : '1fr', gap: '2rem' }} className="animate-fade-in">
      
      {/* Orders List Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Customer Orders ({orders.length})</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Fulfill orders placed via direct site or WhatsApp checkouts.</span>
          </div>
          <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={reloadOrders}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map(o => (
                  <tr 
                    key={o.id} 
                    onClick={() => setSelectedOrder(o)}
                    style={{ cursor: 'pointer', background: selectedOrder && selectedOrder.id === o.id ? 'var(--color-bg-tertiary)' : 'inherit' }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--color-gold-dark)' }}>#{o.id}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(o.created_at).toLocaleDateString()} <br />
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                    <td>{o.customer_phone}</td>
                    <td>{o.items.reduce((acc, i) => acc + i.quantity, 0)} pcs</td>
                    <td style={{ fontWeight: 600 }}>{formatUGX(o.total_amount)}</td>
                    <td>
                      <span className={`admin-badge ${o.status.toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={o.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        style={{ padding: '0.3rem 0.5rem', border: '1px solid var(--color-border-gold)', borderRadius: '4px', background: '#fff', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No customer orders logged in the database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Detail Sidebar Panel */}
      {selectedOrder && (
        <div className="admin-card animate-fade-in" style={{ height: 'fit-content', border: '1px solid var(--color-gold-primary)' }}>
          <div className="admin-card-header" style={{ background: 'var(--gradient-gold-metallic)', color: 'black' }}>
            <h3 style={{ color: 'black', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={16} style={{ color: 'black' }} /> Order #{selectedOrder.id}
            </h3>
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Customer Details */}
            <div style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.2rem', marginBottom: '1.2rem' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>Customer Profile</h4>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-brown-primary)' }}>{selectedOrder.customer_name}</p>
              
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <PhoneCall size={12} style={{ color: 'var(--color-gold-primary)' }} />
                  <a href={`tel:${selectedOrder.customer_phone}`} style={{ fontWeight: 600 }}>{selectedOrder.customer_phone}</a>
                </div>
                {selectedOrder.customer_email && <span>Email: {selectedOrder.customer_email}</span>}
              </div>
            </div>

            {/* Delivery address */}
            <div style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.2rem', marginBottom: '1.2rem' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Delivery Address</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--color-border-light)' }}>
                {selectedOrder.delivery_address}
              </p>
              {selectedOrder.notes && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.85rem' }}>
                  <strong>Notes:</strong> <span style={{ color: 'var(--color-text-secondary)' }}>{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.2rem', marginBottom: '1.2rem' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>Ordered Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-brown-primary)' }}>{item.name}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Color Selection: {item.color}</div>
                    </div>
                    <span style={{ fontWeight: 600 }}>
                      {item.quantity} x {formatUGX(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.2rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>{formatUGX(selectedOrder.total_amount - 10000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery (Kampala/UG)</span>
                <span>{formatUGX(10000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-brown-primary)', marginTop: '0.4rem' }}>
                <span>Total Amount Due</span>
                <span>{formatUGX(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div>
              <span className="form-label" style={{ marginBottom: '0.6rem' }}>Update Order Fulfillments</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, 'Shipped')}
                  className="btn-secondary" 
                  style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
                  disabled={selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered'}
                >
                  <Truck size={14} /> Ship Order
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, 'Delivered')}
                  className="btn-primary" 
                  style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
                  disabled={selectedOrder.status === 'Delivered'}
                >
                  Deliver Order
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
