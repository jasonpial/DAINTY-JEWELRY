import { useState, useEffect } from 'react';
import { getOrders, getProducts } from '../../db';
import { formatUGX } from '../customer/ProductCard';
import { DollarSign, ShoppingBag, ShieldAlert, Award, Package2 } from 'lucide-react';
import { navigateTo } from '../../Router';

export default function AdminDashboard({ onSelectTab }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setOrders(getOrders());
    setProducts(getProducts());
  }, []);

  // Compute metrics
  const totalOrders = orders.length;
  
  // Total Revenue: sum of all completed (delivered or shipped) orders, or just all orders
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total_amount, 0);

  const totalProducts = products.length;
  
  // Low stock products count (stock <= 5)
  const lowStockProducts = products.filter(p => p.stock_quantity <= 5);
  const lowStockCount = lowStockProducts.length;

  const recentOrders = [...orders].reverse().slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Metrics Row */}
      <div className="admin-metrics">
        
        <div className="metric-card">
          <div className="metric-icon-box">
            <DollarSign size={22} />
          </div>
          <div className="metric-info">
            <h4>Total Revenue</h4>
            <p>{formatUGX(totalRevenue)}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <ShoppingBag size={22} />
          </div>
          <div className="metric-info">
            <h4>Fulfillments</h4>
            <p>{totalOrders} Orders</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Package2 size={22} />
          </div>
          <div className="metric-info">
            <h4>Jewelry Catalog</h4>
            <p>{totalProducts} Items</p>
          </div>
        </div>

        <div className="metric-card" style={{ borderColor: lowStockCount > 0 ? 'var(--color-error)' : 'var(--color-border-gold)' }}>
          <div className="metric-icon-box" style={{ background: lowStockCount > 0 ? '#fee2e2' : 'var(--color-bg-tertiary)', color: lowStockCount > 0 ? 'var(--color-error)' : 'var(--color-gold-primary)' }}>
            <ShieldAlert size={22} />
          </div>
          <div className="metric-info">
            <h4>Stock Alerts</h4>
            <p style={{ color: lowStockCount > 0 ? 'var(--color-error)' : 'inherit' }}>{lowStockCount} Low Items</p>
          </div>
        </div>

      </div>

      {/* Grid: Low Stock Alert and Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Recent Orders table */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 style={{ fontSize: '1.1rem' }}>Recent Order Logs</h3>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => onSelectTab('orders')}>
              View All Orders
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700, color: 'var(--color-gold-dark)' }}>#{o.id}</td>
                      <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                      <td>{formatUGX(o.total_amount)}</td>
                      <td>
                        <span className={`admin-badge ${o.status.toLowerCase()}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Listing */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 style={{ fontSize: '1.1rem' }}>Inventory Alerts</h3>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => onSelectTab('products')}>
              Manage Stock
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Stock left</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.sku}</td>
                      <td>{p.name}</td>
                      <td style={{ color: 'var(--color-error)', fontWeight: 700 }}>
                        {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} units`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      ✓ All jewelry items are well stocked!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
