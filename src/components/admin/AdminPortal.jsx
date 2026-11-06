import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home,
  ShoppingBag,
  FolderKanban,
  MessageSquare,
  RotateCcw,
  Store,
  LogOut,
  Search,
  Bell,
  Mail,
  Power,
  Menu,
  Info,
  Plus,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  Upload,
  Image as ImageIcon,
  Bookmark,
  Sparkles,
  Diamond,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { navigateTo } from '../../Router';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getChats,
  saveMessage,
  resetDatabase,
  categories
} from '../../db';

// Format helper for Ugandan Shilling
function formatUGX(val) {
  if (val === null || val === undefined || isNaN(val)) return 'UGX 0';
  return 'UGX ' + Math.round(Number(val)).toLocaleString('en-US');
}

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

// Visit and Sales Statistics Data for BarChart (Themed to Gold Metallic & Bronze Palette)
const VISIT_SALES_DATA = [
  { year: '2013', storefront: 340, whatsapp: 490, direct: 680 },
  { year: '2014', storefront: 460, whatsapp: 380, direct: 420 },
  { year: '2015', storefront: 280, whatsapp: 310, direct: 450 },
  { year: '2016', storefront: 420, whatsapp: 320, direct: 510 },
  { year: '2017', storefront: 380, whatsapp: 590, direct: 470 },
  { year: '2018', storefront: 580, whatsapp: 390, direct: 600 }
];

// Traffic Sources Donut Data (Themed to Gold Metallic & Bronze Palette)
const TRAFFIC_SOURCES_DATA = [
  { name: 'Search Engines', value: 30, color: '#b38728' },
  { name: 'Direct Storefront', value: 30, color: '#f5e6a5' },
  { name: 'WhatsApp & Social', value: 40, color: '#8a640f' }
];

// Curated Studio Image Presets for 1-Click Product Image Selection
const STUDIO_IMAGE_PRESETS = [
  { label: 'Gold Ring', url: '/images/hero_rings.png' },
  { label: 'Diamond Band', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Rivière Chain', url: '/images/hero_necklaces.png' },
  { label: 'Gold Hoops', url: '/images/hero_home_earrings.png' },
  { label: 'Tennis Bracelet', url: '/images/hero_bracelets.png' },
  { label: 'Luxury Watch', url: '/images/hero_watches.png' },
  { label: 'Heart Pendant', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pearl Choker', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80' }
];

// Custom Tooltip for Visit & Sales BarChart with Gold Accents
function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1917] text-white p-3 rounded-lg shadow-2xl text-xs space-y-1.5 border border-[#b38728]/40">
        <p className="font-bold text-[#f5e6a5] border-b border-white/10 pb-1">{label} Performance</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#b38728]"></span>
          <span className="text-gray-300">Online Store:</span>
          <span className="font-bold text-white">{payload[0]?.value}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#dfc9b2]"></span>
          <span className="text-gray-300">WhatsApp Dispatch:</span>
          <span className="font-bold text-white">{payload[1]?.value}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8a640f]"></span>
          <span className="text-gray-300">Showroom Direct:</span>
          <span className="font-bold text-white">{payload[2]?.value}</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function AdminPortal({ onLogout } = {}) {
  // Navigation State
  // Valid activeTab nodes: 'dashboard' | 'catalog' | 'orders' | 'messages'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data States connected to db.js
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chats, setChats] = useState([]);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Chat conversation state
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const chatEndRef = useRef(null);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Reload data from local database
  const reloadData = () => {
    setProducts(getProducts());
    setOrders(getOrders());
    const currentChats = getChats();
    setChats(currentChats);
    if (!activeChatId && currentChats.length > 0) {
      setActiveChatId(currentChats[0].chatId);
    }
  };

  useEffect(() => {
    reloadData();

    // Cross-tab real-time sync with customers
    const handleStorageChange = () => {
      reloadData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-scroll chat to bottom
  const activeChat = chats.find(c => c.chatId === activeChatId);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  // Catalog filtered items
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (p.material && p.material.toLowerCase().includes(catalogSearch.toLowerCase()));
      const matchCat = selectedCategory === 'all' || p.category_id === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, catalogSearch, selectedCategory]);

  // Orders filtered items
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const query = orderSearch.toLowerCase();
      const matchSearch =
        o.id.toLowerCase().includes(query) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(query)) ||
        (o.customer_phone && o.customer_phone.toLowerCase().includes(query)) ||
        (o.customer_email && o.customer_email.toLowerCase().includes(query));
      const matchStatus = orderStatusFilter === 'all' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Delete product handler
  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}" from the store catalog? This will immediately remove it from the customer storefront.`)) {
      deleteProduct(productId);
      reloadData();
      showToast(`Product "${productName}" was deleted from store catalog.`);
    }
  };

  // Save / Update product handler
  const handleSaveProduct = (productData) => {
    const saved = saveProduct(productData);
    reloadData();
    setIsProductModalOpen(false);
    setEditingProduct(null);
    showToast(`Product "${saved.name}" successfully saved to catalog.`);
  };

  // Update order status handler
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    reloadData();
    showToast(`Order #${orderId} marked as "${newStatus}".`);
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Send chat reply handler
  const handleSendChatReply = (e) => {
    if (e) e.preventDefault();
    if (!chatReplyText.trim() || !activeChatId) return;

    saveMessage(activeChatId, 'admin', chatReplyText.trim());
    setChatReplyText('');
    reloadData();
    showToast('Reply sent to customer.');
  };

  // Reset database handler
  const handleConfirmReset = () => {
    resetDatabase();
    reloadData();
    setIsResetConfirmOpen(false);
    showToast('Store catalog and sample records restored successfully.');
  };

  // Handle logout
  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem('dainty_admin_auth');
      window.location.reload();
    }
  };

  // Calculate total store sales
  const totalSalesUGX = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  // Navigation item click helper
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] font-sans antialiased selection:bg-[#b38728]/25 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white text-[#1c1917] px-5 py-3.5 rounded-xl shadow-2xl border border-[#b38728]/30 animate-slide-up text-xs font-semibold">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-black shadow-xs font-bold"
            style={{ background: 'var(--gradient-gold-metallic)' }}
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>{toast}</span>
        </div>
      )}

      {/* =========================================================================
          TOP NAVBAR (White bar with real DAINTY logo and gold accents)
         ========================================================================= */}
      <nav className="h-16 bg-white border-b border-[#dfc9b2]/40 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(62,39,35,0.03)]">
        {/* Left: Brand Logo & Hamburger */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Real Website Logo in Top Navbar */}
          <div 
            className="flex items-center gap-3 cursor-pointer py-1"
            onClick={() => navigateTo('home')}
            title="DAINTY STUDS & CHAINS Storefront"
          >
            <img
              src="/images/logo-image.png"
              alt="DAINTY STUDS & CHAINS"
              className="h-11 w-auto object-contain hover:scale-105 transition-transform"
            />
          </div>

          {/* Hamburger toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-500 hover:text-[#b38728] hover:bg-[#faf8f5] transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog, orders, pieces..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCatalogSearch(e.target.value);
                setOrderSearch(e.target.value);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200/80 rounded-lg outline-none focus:border-[#b38728] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* User Profile Info */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif font-bold text-black shadow-xs ring-2 ring-[#b38728]/30"
                style={{ background: 'var(--gradient-gold-metallic)' }}
              >
                DS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-xs font-bold text-gray-800">DAINTY Curator</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* Mail icon with gold indicator */}
          <div
            className="relative p-1.5 text-gray-500 hover:text-[#b38728] cursor-pointer transition-colors"
            onClick={() => handleNavClick('messages')}
            title="Customer Messages"
          >
            <Mail className="w-4 h-4" />
            <span 
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ background: '#b38728' }}
            ></span>
          </div>

          {/* Bell notification with gold alert */}
          <div
            className="relative p-1.5 text-gray-500 hover:text-[#b38728] cursor-pointer transition-colors"
            onClick={() => showToast('All orders and customer sync signals are active.')}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span 
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ background: '#b38728' }}
            ></span>
          </div>

          {/* Power / Logout button */}
          <div
            className="p-1.5 text-gray-500 hover:text-rose-600 cursor-pointer transition-colors"
            onClick={handleLogoutAction}
            title="Log Out"
          >
            <Power className="w-4 h-4" />
          </div>
        </div>
      </nav>

      {/* Main Body: Sidebar + Content Canvas */}
      <div className="flex-1 flex min-h-[calc(100vh-64px)] relative">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          />
        )}

        {/* =====================================================================
            SIDEBAR (Exact match to eight_f023b57e.jpeg with metallic gold gradient)
           ===================================================================== */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto bg-white border-r border-[#dfc9b2]/40 flex flex-col shrink-0 transition-all duration-200 ease-in-out ${
            sidebarCollapsed ? 'w-20' : 'w-72 lg:w-64'
          } ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          {/* Top Logo / Brand Box in Sidebar */}
          <div className="p-5 border-b border-[#f3ece6] flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer overflow-hidden" 
              onClick={() => navigateTo('home')}
            >
              <img
                src="/images/logo-image.png"
                alt="DAINTY STUDS & CHAINS"
                className={`${sidebarCollapsed ? 'h-9 w-9 object-contain' : 'h-10 w-auto object-contain'} transition-all`}
              />
              {!sidebarCollapsed && (
                <div className="leading-tight">
                  <h3 className="font-serif italic font-bold text-sm text-[#3e2723]">
                    DAINTY STUDS
                  </h3>
                  <p className="text-[10px] text-[#b38728] font-bold uppercase tracking-widest">
                    Atelier Console
                  </p>
                </div>
              )}
            </div>

            {/* Collapse toggle button on desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User Profile Pill in Sidebar (Matching eight_f023b57e.jpeg) */}
          <div className={`p-4 border-b border-[#f3ece6] flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative shrink-0">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-black text-xs shadow-xs"
                style={{ background: 'var(--gradient-gold-metallic)' }}
              >
                DS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs text-[#1c1917] truncate">DAINTY Curator</h4>
                <p className="text-[10px] text-gray-400 truncate">Store Management HQ</p>
              </div>
            )}
          </div>

          {/* Scrollable Navigation Body */}
          <div className="py-4 px-3 flex-1 overflow-y-auto space-y-4">
            {/* ── SECTION 1: MENU ── */}
            <div>
              {!sidebarCollapsed && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                  Menu
                </p>
              )}
              <div className="space-y-1">
                {/* Node: Dashboard (Active Pill with Metallic Gold Gradient) */}
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'dashboard'
                      ? 'shadow-[0_4px_16px_rgba(179,135,40,0.25)] border border-[#f5e6a5]'
                      : 'text-gray-600 hover:text-black hover:bg-amber-50/50'
                  }`}
                  style={
                    activeTab === 'dashboard'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Dashboard"
                >
                  <Home className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'stroke-[2.2] text-black' : 'text-gray-400'}`} />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                {/* Node: Manage Catalog */}
                <button
                  onClick={() => handleNavClick('catalog')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'catalog'
                      ? 'shadow-[0_4px_16px_rgba(179,135,40,0.25)] border border-[#f5e6a5] font-bold'
                      : 'text-gray-600 hover:text-black hover:bg-amber-50/50'
                  }`}
                  style={
                    activeTab === 'catalog'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Manage Catalog"
                >
                  <div className="flex items-center gap-3">
                    <FolderKanban className={`w-4 h-4 shrink-0 ${activeTab === 'catalog' ? 'stroke-[2.2] text-black' : 'text-gray-400'}`} />
                    {!sidebarCollapsed && <span>Manage Catalog</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeTab === 'catalog' ? 'bg-black/15 text-black' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {products.length}
                    </span>
                  )}
                </button>

                {/* Node: Customer Orders */}
                <button
                  onClick={() => handleNavClick('orders')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'orders'
                      ? 'shadow-[0_4px_16px_rgba(179,135,40,0.25)] border border-[#f5e6a5] font-bold'
                      : 'text-gray-600 hover:text-black hover:bg-amber-50/50'
                  }`}
                  style={
                    activeTab === 'orders'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Customer Orders"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className={`w-4 h-4 shrink-0 ${activeTab === 'orders' ? 'stroke-[2.2] text-black' : 'text-gray-400'}`} />
                    {!sidebarCollapsed && <span>Customer Orders</span>}
                  </div>
                  {!sidebarCollapsed && orders.length > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeTab === 'orders' ? 'bg-black/15 text-black' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {orders.length}
                    </span>
                  )}
                </button>

                {/* Node: Customer Messages */}
                <button
                  onClick={() => handleNavClick('messages')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'messages'
                      ? 'shadow-[0_4px_16px_rgba(179,135,40,0.25)] border border-[#f5e6a5] font-bold'
                      : 'text-gray-600 hover:text-black hover:bg-amber-50/50'
                  }`}
                  style={
                    activeTab === 'messages'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Customer Messages"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${activeTab === 'messages' ? 'stroke-[2.2] text-black' : 'text-gray-400'}`} />
                    {!sidebarCollapsed && <span>Customer Messages</span>}
                  </div>
                  {!sidebarCollapsed && chats.length > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeTab === 'messages' ? 'bg-black/15 text-black' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {chats.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── SECTION 2: SETTINGS & UTILITIES (Matching eight_f023b57e.jpeg) ── */}
            <div>
              {!sidebarCollapsed && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                  Settings
                </p>
              )}
              <div className="space-y-1">
                {/* Reset Sample Data */}
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors`}
                  title="Reset Sample Data"
                >
                  <RotateCcw className="w-4 h-4 shrink-0 text-rose-500" />
                  {!sidebarCollapsed && <span>Reset Sample Data</span>}
                </button>

                {/* Return to Store */}
                <button
                  onClick={() => navigateTo('home')}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#b38728] hover:bg-amber-50/50 transition-colors`}
                  title="Return to Store"
                >
                  <Store className="w-4 h-4 shrink-0 text-[#b38728]" />
                  {!sidebarCollapsed && <span>Return to Store</span>}
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogoutAction}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-gray-50 transition-colors`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Logout</span>}
                </button>
              </div>
            </div>

            {/* ── SECTION 3: NOTIFICATIONS WIDGET (Matching bottom of eight_f023b57e.jpeg) ── */}
            {!sidebarCollapsed && (
              <div className="pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                  Notifications
                </p>
                <div className="space-y-2">
                  {/* Notification Card 1 */}
                  <div
                    onClick={() => handleNavClick('messages')}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-amber-50/60 border border-gray-100 hover:border-[#b38728]/30 cursor-pointer transition-all flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-[#b38728] flex items-center justify-center font-bold text-[10px] shrink-0">
                      GK
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-[11px] text-[#1c1917]">Grace Kembabazi</p>
                      <p className="text-[10px] text-gray-500 truncate">
                        Hi, This product is available for n...
                      </p>
                    </div>
                  </div>

                  {/* Notification Card 2 */}
                  <div
                    onClick={() => handleNavClick('messages')}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-amber-50/60 border border-gray-100 hover:border-[#b38728]/30 cursor-pointer transition-all flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      IS
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-[11px] text-[#1c1917]">Ibnul Shams</p>
                      <p className="text-[10px] text-gray-500 truncate">
                        Hi, Can I request custom engr...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* =====================================================================
            MAIN DASHBOARD CONTENT (Consistent Metallic Gold Gradient Theme)
           ===================================================================== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* ===================================================================
              VIEW 1: DASHBOARD OVERVIEW
             =================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Breadcrumb Header Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-black shadow-xs font-bold"
                    style={{ background: 'var(--gradient-gold-metallic)' }}
                  >
                    <Home className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#3e2723] tracking-tight">Dashboard</h2>
                    <p className="text-[11px] text-gray-500">Executive Performance &amp; Boutique Status</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#dfc9b2]/60 text-xs text-[#8a640f] font-semibold shadow-xs">
                  <span>Maison Overview</span>
                  <Info className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 3 SIGNATURE GRADIENT CARDS (Themed with Gold Metallic & Luxury Obsidian Accents) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Weekly Sales (Signature Metallic Gold Gradient with Pure Black Text) */}
                <div
                  className="rounded-2xl p-6 text-black shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-[#f5e6a5]"
                  style={{ background: 'var(--gradient-gold-metallic)' }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-36 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white" />
                    <div className="absolute -right-2 top-8 w-28 h-28 rounded-full bg-white" />
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-bold tracking-wide uppercase text-black/80">Weekly Sales</span>
                    <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                  </div>

                  <div className="my-3 relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {totalSalesUGX > 0 ? formatUGX(totalSalesUGX) : 'UGX 15,000,000'}
                    </h3>
                  </div>

                  <div className="text-xs font-bold relative z-10 flex items-center gap-1">
                    <span>Increased by 60%</span>
                    <span className="text-black/60 font-semibold">• Vs last period</span>
                  </div>
                </div>

                {/* 2. Weekly Orders (Deep Obsidian & Warm Caramel Luxury Gradient) */}
                <div
                  className="rounded-2xl p-6 text-white shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-[#3e2723]"
                  style={{ background: 'linear-gradient(135deg, #1f1a17 0%, #3e2723 50%, #1a1512 100%)' }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-36 overflow-hidden pointer-events-none opacity-15">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white" />
                    <div className="absolute -right-2 top-8 w-28 h-28 rounded-full bg-white" />
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-semibold tracking-wide text-[#f5e6a5]">Weekly Orders</span>
                    <Bookmark className="w-5 h-5 text-[#f5e6a5]" />
                  </div>

                  <div className="my-3 relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {orders.length > 0 ? orders.length : '45,6334'}
                    </h3>
                  </div>

                  <div className="text-xs font-medium text-gray-300 relative z-10">
                    <span>Decreased by 10%</span>
                  </div>
                </div>

                {/* 3. Visitors Online & Catalog (Imperial Champagne Gold & Amber Glow Gradient) */}
                <div
                  className="rounded-2xl p-6 text-[#2a1a15] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-[#dfc9b2]"
                  style={{ background: 'linear-gradient(135deg, #dfc9b2 0%, #d4af37 50%, #b38728 100%)' }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-36 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white" />
                    <div className="absolute -right-2 top-8 w-28 h-28 rounded-full bg-white" />
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-bold tracking-wide uppercase text-[#3e2723]">Visitors Online</span>
                    <Diamond className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="my-3 relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      95,5741
                    </h3>
                  </div>

                  <div className="text-xs font-bold text-[#3e2723] relative z-10">
                    <span>Increased by 5%</span>
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION: Visit And Sales Statistics + Traffic Sources */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visit And Sales Statistics Bar Chart (~65% / 8 cols) */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#dfc9b2]/40 shadow-xs flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h4 className="text-base font-bold text-[#3e2723]">
                        Visit And Sales Statistics
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">Online boutique orders vs direct showroom sales</p>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-[#b38728]"></span>
                        <span>Storefront</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-[#dfc9b2]"></span>
                        <span>WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-[#5d4037]"></span>
                        <span>Showroom</span>
                      </div>
                    </div>
                  </div>

                  {/* Recharts BarChart Component */}
                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={VISIT_SALES_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3ece6" vertical={false} />
                        <XAxis dataKey="year" stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="storefront" fill="#b38728" radius={[4, 4, 0, 0]} maxBarSize={12} />
                        <Bar dataKey="whatsapp" fill="#dfc9b2" radius={[4, 4, 0, 0]} maxBarSize={12} />
                        <Bar dataKey="direct" fill="#5d4037" radius={[4, 4, 0, 0]} maxBarSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Traffic Sources Donut Chart (~35% / 4 cols) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#dfc9b2]/40 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#3e2723]">
                      Traffic Sources
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">Customer channels in Uganda</p>
                  </div>

                  {/* Donut Chart */}
                  <div className="h-48 w-full flex items-center justify-center relative my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={TRAFFIC_SOURCES_DATA}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {TRAFFIC_SOURCES_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bottom Legend with percentages */}
                  <div className="space-y-2.5 pt-3 border-t border-[#f3ece6] text-xs font-medium">
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#b38728]"></span>
                        <span>Search Engines</span>
                      </div>
                      <span className="font-bold text-[#1c1917]">30%</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f5e6a5] border border-gray-300"></span>
                        <span>Direct Storefront</span>
                      </div>
                      <span className="font-bold text-[#1c1917]">30%</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8a640f]"></span>
                        <span>WhatsApp &amp; Social</span>
                      </div>
                      <span className="font-bold text-[#1c1917]">40%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: Recent Store Orders Table */}
              <div className="bg-white p-6 rounded-2xl border border-[#dfc9b2]/40 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-bold text-[#3e2723]">Recent Customer Orders</h4>
                    <p className="text-xs text-gray-400">Direct checkouts placed on DAINTY boutique</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#b38728] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead>
                      <tr className="border-b border-[#f3ece6] text-[#a8a29e] uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-semibold">Order ID</th>
                        <th className="pb-3 font-semibold">Client</th>
                        <th className="pb-3 font-semibold">Total Amount</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#faf8f5]">
                      {orders.length > 0 ? (
                        orders.slice(0, 4).map((ord) => (
                          <tr key={ord.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="py-3.5 font-mono font-bold text-gray-800">{ord.id}</td>
                            <td className="py-3.5">
                              <p className="font-bold text-gray-800">{ord.customer_name || 'Store Patron'}</p>
                              <p className="text-[10px] text-gray-400">{ord.customer_phone || ord.customer_email || 'Direct Checkout'}</p>
                            </td>
                            <td className="py-3.5 font-bold text-gray-800">{formatUGX(ord.total_amount)}</td>
                            <td className="py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  ord.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {ord.status || 'Pending'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => setViewingOrder(ord)}
                                className="p-1.5 text-gray-400 hover:text-[#b38728] transition-colors"
                                title="Inspect Order"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-gray-400">
                            No orders placed yet. Orders placed via checkout will automatically appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              VIEW 2: MANAGE CATALOG (Add with Image & Delete functionality)
             =================================================================== */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#dfc9b2]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#3e2723]">Manage Store Catalog</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Add new creations with photos, update stock, and delete products
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-black text-xs font-bold transition-all shadow-xs"
                  style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search & Category Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-[#dfc9b2]/40 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by product name, SKU, or material..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200/80 rounded-xl text-xs outline-none focus:border-[#b38728] focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors ${
                      selectedCategory === 'all'
                        ? 'text-black shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={
                      selectedCategory === 'all'
                        ? { background: 'var(--gradient-gold-metallic)' }
                        : {}
                    }
                  >
                    All ({products.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                        selectedCategory === cat.id
                          ? 'text-black font-bold shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={
                        selectedCategory === cat.id
                          ? { background: 'var(--gradient-gold-metallic)' }
                          : {}
                      }
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Table */}
              <div className="bg-white rounded-2xl border border-[#dfc9b2]/40 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-[#FAFBFD] border-b border-[#dfc9b2]/40 text-[#a8a29e] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4 font-semibold">Product</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold">Material &amp; Color</th>
                        <th className="p-4 font-semibold">Price (UGX)</th>
                        <th className="p-4 font-semibold">Stock</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f3ece6]">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => {
                          const primaryImg = p.images?.[0] || p.image || '/images/hero_rings.png';
                          return (
                            <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200/80 overflow-hidden shrink-0">
                                    <img
                                      src={primaryImg}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = '/images/hero_rings.png';
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-[#1c1917] line-clamp-1">{p.name}</p>
                                    <p className="text-[10px] font-mono text-gray-400">{p.sku || p.id}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4">
                                <span className="capitalize px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/70">
                                  {p.category_id || p.category || 'Jewelry'}
                                </span>
                              </td>

                              <td className="p-4 text-gray-700">
                                <p className="font-semibold">{p.material || 'Gold-Plated'}</p>
                                <p className="text-[10px] text-gray-400">{p.color || 'Gold'}</p>
                              </td>

                              <td className="p-4">
                                <p className="font-bold text-[#1c1917]">{formatUGX(p.price)}</p>
                                {p.sale_price && (
                                  <p className="text-[10px] text-emerald-600 font-semibold line-through">
                                    {formatUGX(p.sale_price)}
                                  </p>
                                )}
                              </td>

                              <td className="p-4">
                                <span className="font-bold text-[#1c1917]">{p.stock_quantity ?? 10} units</span>
                              </td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-[#b38728] transition-colors"
                                    title="Edit Product"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-600 transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400">
                            No products found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              VIEW 3: CUSTOMER ORDERS (Connected to db.js)
             =================================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#dfc9b2]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#3e2723]">Customer Orders</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Live checkout orders, delivery instructions, and status fulfillment
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search orders, phone, client..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#b38728]"
                    />
                  </div>

                  <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs overflow-x-auto">
                    {['all', 'pending', 'processing', 'completed', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                          orderStatusFilter === st
                            ? 'text-black font-bold shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                        style={
                          orderStatusFilter === st
                            ? { background: 'var(--gradient-gold-metallic)' }
                            : {}
                        }
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-[#dfc9b2]/40 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead className="bg-[#FAFBFD] border-b border-[#dfc9b2]/40 text-[#a8a29e] uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4 font-semibold">Order ID</th>
                        <th className="p-4 font-semibold">Customer Dossier</th>
                        <th className="p-4 font-semibold">Items</th>
                        <th className="p-4 font-semibold">Total Amount</th>
                        <th className="p-4 font-semibold">Order Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f3ece6]">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="p-4 font-mono font-bold text-gray-800">
                              {ord.id}
                              <span className="block text-[10px] text-gray-400 font-sans font-normal mt-0.5">
                                {formatDate(ord.created_at)}
                              </span>
                            </td>

                            <td className="p-4">
                              <p className="font-bold text-gray-800">{ord.customer_name || 'Boutique Client'}</p>
                              <p className="text-[11px] text-gray-400">{ord.customer_phone || ord.customer_email || 'Direct Order'}</p>
                              {ord.delivery_address && (
                                <p className="text-[10px] text-gray-500 truncate max-w-xs mt-0.5">
                                  {ord.delivery_address}
                                </p>
                              )}
                            </td>

                            <td className="p-4 max-w-xs">
                              <div className="space-y-1">
                                {ord.items && ord.items.length > 0 ? (
                                  ord.items.map((it, idx) => (
                                    <p key={idx} className="text-xs text-gray-700">
                                      <span className="font-semibold">{it.quantity}x</span> {it.name}
                                    </p>
                                  ))
                                ) : (
                                  <span className="text-gray-400">Jewelry Set</span>
                                )}
                              </div>
                            </td>

                            <td className="p-4 font-bold text-gray-800">
                              {formatUGX(ord.total_amount)}
                            </td>

                            <td className="p-4">
                              <select
                                value={ord.status || 'Pending'}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className={`text-xs font-bold px-3 py-1 rounded-full border outline-none cursor-pointer ${
                                  ord.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => setViewingOrder(ord)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-[#b38728] transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400">
                            No orders matching the selected filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              VIEW 4: CUSTOMER MESSAGES (Live Concierge Chat connected to db.js)
             =================================================================== */}
          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-[#dfc9b2]/40 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#f3ece6]">
                  <h4 className="text-sm font-bold text-[#3e2723]">Customer Conversations</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Live
                  </span>
                </div>

                <div className="space-y-2">
                  {chats.length > 0 ? (
                    chats.map((c) => (
                      <div
                        key={c.chatId}
                        onClick={() => setActiveChatId(c.chatId)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          activeChatId === c.chatId
                            ? 'bg-amber-50/70 border-[#b38728]/40 shadow-xs'
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-gray-800">
                            {c.chatId === 'admin_demo_chat' ? 'Demo Customer (Kampala)' : `Customer ${c.chatId.substring(0, 8)}`}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatDate(c.lastMessage?.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate font-medium">
                          {c.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">No chat messages yet.</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-[#dfc9b2]/40 shadow-xs flex flex-col justify-between min-h-[460px]">
                {activeChat ? (
                  <>
                    <div className="border-b border-[#f3ece6] pb-3">
                      <h4 className="text-sm font-bold text-[#3e2723]">
                        {activeChat.chatId === 'admin_demo_chat' ? 'Demo Customer (Kampala)' : `Customer Session #${activeChat.chatId}`}
                      </h4>
                      <p className="text-[11px] text-gray-400">Real-time live customer inquiry thread</p>
                    </div>

                    <div className="py-4 space-y-3 flex-1 overflow-y-auto max-h-[340px]">
                      {activeChat.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                              m.sender === 'admin'
                                ? 'text-black rounded-br-none shadow-xs font-semibold'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                            style={
                              m.sender === 'admin'
                                ? { background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }
                                : {}
                            }
                          >
                            <p>{m.content}</p>
                            <span
                              className={`block text-[9px] mt-1 text-right ${
                                m.sender === 'admin' ? 'text-black/70' : 'text-gray-400'
                              }`}
                            >
                              {formatDate(m.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendChatReply} className="pt-3 border-t border-[#f3ece6] flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type reply to customer..."
                        value={chatReplyText}
                        onChange={(e) => setChatReplyText(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#b38728]"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs text-black"
                        style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                      >
                        Send
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-400">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Select a conversation thread to read and reply.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          ADD / EDIT PRODUCT MODAL (Supports Image File Upload, Presets & URL)
         ========================================================================= */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* =========================================================================
          ORDER DETAILS INSPECTION MODAL
         ========================================================================= */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400">ORDER DOSSIER</span>
                <h3 className="text-base font-bold text-gray-800">Order #{viewingOrder.id}</h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 space-y-1 text-gray-700">
                <p className="font-bold text-sm text-gray-900">{viewingOrder.customer_name || 'Boutique Customer'}</p>
                <p>Phone: {viewingOrder.customer_phone || 'None provided'}</p>
                <p>Email: {viewingOrder.customer_email || 'None provided'}</p>
                <p>Address: {viewingOrder.delivery_address || 'In-store Pick-up'}</p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 mb-2 uppercase text-[10px]">Ordered Items</h5>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {viewingOrder.items && viewingOrder.items.length > 0 ? (
                    viewingOrder.items.map((it, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-gray-100 flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{it.name}</span>
                        <span className="font-bold text-gray-800">{it.quantity}x</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">Standard Jewelry Set</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-800">Total Valuation</span>
                <span className="text-base font-extrabold text-[#b38728]">
                  {formatUGX(viewingOrder.total_amount)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleUpdateOrderStatus(viewingOrder.id, 'Completed');
                  setViewingOrder(null);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RESET SAMPLE DATA CONFIRMATION MODAL
         ========================================================================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Reset Sample Data?</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                This will restore all default jewelry catalog pieces, sample orders, and demo messages back to the pristine DAINTY STUDS showroom setup.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ADD / EDIT PRODUCT FORM MODAL (With File Upload, URL & Studio Presets)
// =============================================================================
function ProductFormModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: product?.id || undefined,
    name: product?.name || '',
    category_id: product?.category_id || product?.category || 'rings',
    price: product?.price || '',
    sale_price: product?.sale_price || '',
    stock_quantity: product?.stock_quantity !== undefined ? product.stock_quantity : 15,
    material: product?.material || 'Gold-Plated',
    color: product?.color || 'Gold',
    sku: product?.sku || (product?.id ? `DSC-${product.id.toUpperCase()}` : 'DSC-NEW'),
    description: product?.description || '',
    featured: product?.featured || false,
    new_arrival: product?.new_arrival ?? true,
    best_seller: product?.best_seller || false,
    images: product?.images || (product?.image ? [product.image] : [''])
  });

  const [imagePreview, setImagePreview] = useState(
    formData.images?.[0] || product?.image || '/images/hero_rings.png'
  );

  // File Upload Handler (Converts uploaded image to Base64 Data URL)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result;
        if (base64Url) {
          setImagePreview(base64Url);
          setFormData((prev) => ({
            ...prev,
            images: [base64Url, ...(prev.images?.slice(1) || [])]
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // URL Input Handler
  const handleImageUrlChange = (url) => {
    setImagePreview(url);
    setFormData((prev) => ({
      ...prev,
      images: [url, ...(prev.images?.slice(1) || [])]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      price: Number(formData.price) || 50000,
      sale_price: formData.sale_price ? Number(formData.sale_price) : null,
      stock_quantity: Number(formData.stock_quantity) || 0,
      images: [imagePreview, ...(formData.images?.slice(1) || [])]
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-[#3e2723]">
              {product ? 'Edit Jewelry Piece' : 'Add New Jewelry Product'}
            </h3>
            <p className="text-[11px] text-gray-400">
              Upload image, specify pricing and inventory in DAINTY STUDS catalog
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* PRODUCT IMAGE UPLOAD SECTION */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <label className="block text-[11px] font-bold text-gray-800">
              Product Image <span className="text-rose-500">*</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/hero_rings.png';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <div>
                  <label 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-black font-bold cursor-pointer text-xs shadow-xs"
                    style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                  >
                    <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-gray-400 ml-2">PNG, JPG, or WEBP</span>
                </div>

                <input
                  type="url"
                  placeholder="Or paste external image URL (https://...)"
                  value={imagePreview.startsWith('data:') ? '' : imagePreview}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#b38728]"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Quick Studio Presets:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STUDIO_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleImageUrlChange(preset.url)}
                    className="px-2 py-1 rounded-md bg-white border border-gray-200 hover:border-[#b38728] text-[10px] font-semibold text-gray-700 hover:text-[#b38728] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BASIC PRODUCT DETAILS */}
          <div>
            <label className="block text-[11px] font-bold text-gray-800 mb-1">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. 18K Gold Plated Solitaire Marquise Ring"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728] bg-white capitalize"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1">Material</label>
              <select
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728] bg-white"
              >
                <option value="Gold-Plated">18K Gold-Plated</option>
                <option value="Stainless Steel">Stainless Steel</option>
                <option value="Titanium">Titanium</option>
                <option value="Sterling Silver">925 Sterling Silver</option>
                <option value="Rose Gold">Rose Gold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1">
                Price (UGX) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="85000"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1">Sale Price (UGX)</label>
              <input
                type="number"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                placeholder="Optional discount"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                placeholder="15"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1">Color Finish</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728] bg-white"
              >
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Rose Gold">Rose Gold</option>
                <option value="White">White / Pearl</option>
                <option value="Black">Black</option>
                <option value="Mixed">Mixed / Dual-Tone</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-800 mb-1">SKU Number</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728] font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-800 mb-1">Product Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe handcrafted elegance, setting, water-resistance, and styling tips..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#b38728]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.new_arrival}
                onChange={(e) => setFormData({ ...formData, new_arrival: e.target.checked })}
                className="rounded text-[#b38728] focus:ring-[#b38728]"
              />
              <span>New Arrival</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.best_seller}
                onChange={(e) => setFormData({ ...formData, best_seller: e.target.checked })}
                className="rounded text-[#b38728] focus:ring-[#b38728]"
              />
              <span>Best Seller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded text-[#b38728] focus:ring-[#b38728]"
              />
              <span>Featured on Homepage</span>
            </label>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-black rounded-xl font-bold transition-all shadow-xs"
              style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
            >
              Save Product to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
