import { useState } from 'react';
import { LayoutDashboard, ShoppingBag, MessageSquareCode, Settings, Store, RefreshCw } from 'lucide-react';
import { navigateTo } from '../../Router';
import AdminDashboard from './AdminDashboard';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import ChatManager from './ChatManager';
import { resetDatabase } from '../../db';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleReset = () => {
    if (window.confirm('WARNING: This will restore the database (catalog products, orders, chat messages) to their initial seed state, clearing any modifications you have made. Do you want to proceed?')) {
      resetDatabase();
      window.location.reload();
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>DAINTY STUDS</h2>
          <span>Store Admin Console</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            Dashboard Overview
          </div>

          <div 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={18} />
            Manage Catalog
          </div>

          <div 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Settings size={18} />
            Customer Orders
          </div>

          <div 
            className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquareCode size={18} />
            Customer Messages
          </div>

          {/* Reset button utility */}
          <div 
            className="admin-nav-item"
            onClick={handleReset}
            style={{ color: '#b91c1c', borderTop: '1px solid rgba(0, 0, 0, 0.15)', marginTop: '2rem' }}
          >
            <RefreshCw size={18} style={{ color: '#b91c1c' }} />
            Reset Sample Data
          </div>

          {/* Return to client site */}
          <div 
            className="admin-nav-item"
            onClick={() => navigateTo('home')}
            style={{ borderTop: '1px solid rgba(0, 0, 0, 0.15)', marginTop: '0.5rem', color: '#000000' }}
          >
            <Store size={18} style={{ color: '#000000' }} />
            Return to Store
          </div>
        </nav>
      </aside>

      {/* Main Panel Content Workspace */}
      <main className="admin-main">
        {/* Header summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-gold)', paddingBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', textTransform: 'capitalize' }}>
              {activeTab === 'products' ? 'Manage Catalog' : activeTab === 'orders' ? 'Customer Orders' : activeTab === 'messages' ? 'Customer Messages' : 'Dashboard Overview'}
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Welcome back, Admin. System is fully operational.</span>
          </div>
          <button className="btn-secondary" onClick={() => navigateTo('home')}>
            <Store size={16} /> View Storefront
          </button>
        </div>

        {/* Panel router switch */}
        {activeTab === 'dashboard' && <AdminDashboard onSelectTab={setActiveTab} />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'messages' && <ChatManager />}
      </main>
    </div>
  );
}
