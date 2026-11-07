import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutGrid,
  FolderKanban,
  ClipboardList,
  MessageSquare,
  Settings,
  Key,
  Shield,
  Check,
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
  Upload,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  MoreVertical,
  Calendar,
  SlidersHorizontal,
  ArrowDown,
  ArrowUp,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  AlertCircle,
  Phone,
  Package,
  Coins
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { navigateTo, goBack } from '../../Router';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getChats,
  saveMessage,
  resetDatabase,
  getAdminCredentials,
  updateAdminCredentials,
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

// 12-Month Performance Dataset for Spline Chart (Matches five.webp "Statistic: Revenue and Sales")
const STATISTIC_SPLINE_DATA = [
  { month: 'Jan', revenue: 220, sales: 380, cancel: 110 },
  { month: 'Feb', revenue: 280, sales: 410, cancel: 140 },
  { month: 'Mar', revenue: 450, sales: 480, cancel: 180 },
  { month: 'Apr', revenue: 560, sales: 520, cancel: 210 },
  { month: 'May', revenue: 490, sales: 670, cancel: 160 },
  { month: 'Jun', revenue: 720, sales: 610, cancel: 280 },
  { month: 'Jul', revenue: 680, sales: 740, cancel: 200 },
  { month: 'Aug', revenue: 890, sales: 810, cancel: 190 },
  { month: 'Sep', revenue: 790, sales: 830, cancel: 230 },
  { month: 'Nov', revenue: 980, sales: 890, cancel: 170 },
  { month: 'Oct', revenue: 840, sales: 940, cancel: 210 },
  { month: 'Dec', revenue: 1120, sales: 1050, cancel: 240 }
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

// Custom Tooltip for Spline Chart (Matches dark floating tooltip in five.webp)
function CustomSplineTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const rev = payload.find(p => p.dataKey === 'revenue')?.value;
    const sal = payload.find(p => p.dataKey === 'sales')?.value;
    const can = payload.find(p => p.dataKey === 'cancel')?.value;
    return (
      <div className="bg-[#0f172a] text-white p-3 rounded-xl shadow-2xl text-xs space-y-1.5 border border-slate-700/60 min-w-[150px] z-50">
        <div className="text-[11px] font-bold text-gray-400 border-b border-white/10 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[#f5e6a5]">DAINTY Boutique</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
            <span className="text-gray-300">Revenue :</span>
          </div>
          <span className="font-bold text-white">{rev ? (rev / 1000).toFixed(2) + ' M' : '0.68 M'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>
            <span className="text-gray-300">Sales :</span>
          </div>
          <span className="font-bold text-[#f5e6a5]">{sal ? `${sal}k` : '92.6%'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f43f5e]"></span>
            <span className="text-gray-300">Cancel :</span>
          </div>
          <span className="font-bold text-rose-400">{can ? `${can}k` : '7.4%'}</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function AdminPortal({ onLogout } = {}) {
  // Navigation State
  // Valid activeTab nodes: 'dashboard' | 'catalog' | 'orders' | 'messages' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const [productToDelete, setProductToDelete] = useState(null);

  // Settings State for Admin Credentials
  const [settingsUser, setSettingsUser] = useState(() => getAdminCredentials().username);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [settingsFeedback, setSettingsFeedback] = useState(null);

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

  // Delete product handlers (In-app modal confirmation replaces window.confirm)
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    reloadData();
    showToast(`Product "${productToDelete.name}" was permanently deleted from catalog.`);
    setProductToDelete(null);
  };

  // Save Credentials in Settings
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    const creds = getAdminCredentials();
    if (currentPass !== creds.password) {
      setSettingsFeedback({ type: 'error', message: 'Current password does not match existing admin password.' });
      return;
    }
    if (!newPass || newPass.length < 4) {
      setSettingsFeedback({ type: 'error', message: 'New password must contain at least 4 characters.' });
      return;
    }
    if (newPass !== confirmPass) {
      setSettingsFeedback({ type: 'error', message: 'New password and confirmation password do not match.' });
      return;
    }
    updateAdminCredentials(settingsUser, newPass);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setSettingsFeedback({ type: 'success', message: 'Admin credentials successfully updated and persisted.' });
    showToast('Admin credentials updated successfully!');
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
          TOP NAVBAR (White bar matching five.webp Luxora styling with gold accents)
         ========================================================================= */}
      <nav className="h-16 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Left: Brand Logo, Back Button & Search */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
          {/* Back Navigation Button */}
          <button
            type="button"
            onClick={() => goBack('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-black bg-gray-50 hover:bg-amber-50 border border-gray-200/80 shadow-2xs transition-all cursor-pointer"
            title="Go Back to Previous Page"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Real Website Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer py-1"
            onClick={() => navigateTo('home')}
            title="DAINTY STUDS & CHAINS Storefront"
          >
            <img
              src="/images/logo-image.png"
              alt="DAINTY STUDS & CHAINS"
              className="h-10 w-auto object-contain hover:scale-105 transition-transform"
            />
          </div>

          {/* Hamburger toggle button for Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-500 hover:text-[#b38728] hover:bg-gray-50 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar capsule (Matches five.webp "Search ...") */}
          <div className="relative hidden md:block w-64 lg:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCatalogSearch(e.target.value);
                setOrderSearch(e.target.value);
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 bg-[#f8f9fd] border border-gray-100 rounded-full outline-none focus:border-[#b38728] focus:bg-white transition-all font-sans"
            />
          </div>
        </div>

        {/* Right: Date, Notifications & Profile (Matches five.webp) */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Date pill with Calendar icon (Matches five.webp "Monday, 4th September") */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>

          {/* Notification bell with count badge 12 (Matches five.webp) */}
          <div
            className="relative p-2 text-gray-600 hover:text-[#b38728] cursor-pointer transition-colors"
            onClick={() => showToast('12 unread boutique events and notifications.')}
            title="12 New Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              12
            </span>
          </div>

          {/* Mail icon */}
          <div
            className="relative p-2 text-gray-600 hover:text-[#b38728] cursor-pointer transition-colors hidden sm:block"
            onClick={() => handleNavClick('messages')}
            title="Customer Messages"
          >
            <Mail className="w-4 h-4" />
            {chats.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#b38728] ring-2 ring-white"></span>
            )}
          </div>

          {/* User Profile Info (Matches five.webp: Ahmed Al-Farsi / Company Manager) */}
          <div 
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            title="Admin Profile & Settings"
          >
            <div className="relative">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-sans font-bold text-black shadow-xs ring-2 ring-[#b38728]/30"
                style={{ background: 'var(--gradient-gold-metallic)' }}
              >
                DS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-900 leading-tight">DAINTY Curator</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <span className="text-[10px] text-gray-400 font-normal leading-tight">Company Manager</span>
            </div>
          </div>

          {/* Power / Logout button */}
          <div
            className="p-1.5 text-gray-400 hover:text-rose-600 cursor-pointer transition-colors"
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
            SIDEBAR (Professional, spacious layout filling full vertical space)
           ===================================================================== */}
        {/* =====================================================================
            SIDEBAR (Exact match to eight.jpeg Column 2 UI, fonts, spacing, and icons)
           ===================================================================== */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 transition-all duration-200 ease-in-out w-64 lg:w-68 min-h-[calc(100vh-64px)] p-5 ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Top & Navigation Section Wrapper */}
          <div className="flex-1 flex flex-col">
            {/* Top Logo (Real Website Logo preserved) */}
            <div 
              className="flex items-center gap-2.5 px-2 pb-5 border-b border-gray-100 cursor-pointer"
              onClick={() => navigateTo('home')}
              title="Return to DAINTY Store"
            >
              <img
                src="/images/logo-image.png"
                alt="DAINTY"
                className="h-8 w-auto object-contain hover:scale-105 transition-transform"
              />
              <div className="flex items-baseline gap-1.5 font-sans">
                <span className="font-extrabold text-[15px] tracking-tight text-gray-900">DAINTY</span>
                <span className="text-[10px] font-bold text-[#b38728] uppercase tracking-wider">Atelier</span>
              </div>
            </div>

            {/* Profile Row (Exact styling to eight.jpeg user profile: Jhon Doe / UI/UX/Director design) */}
            <div className="flex items-center gap-3 px-2 py-4 my-1">
              <div className="relative shrink-0">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center font-sans font-bold text-black text-xs shadow-xs ring-2 ring-[#b38728]/30"
                  style={{ background: 'var(--gradient-gold-metallic)' }}
                >
                  DS
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
              <div className="overflow-hidden font-sans">
                <h4 className="font-semibold text-[13px] text-gray-900 leading-snug truncate">DAINTY Curator</h4>
                <p className="text-[11px] text-gray-400 font-normal leading-snug truncate">Store Management HQ</p>
              </div>
            </div>

            {/* ── SECTION 1: MENU ── */}
            <div className="mt-3">
              <p className="font-sans text-[11px] font-medium text-gray-400 px-3 mb-2">
                Menu
              </p>
              <div className="space-y-1">
                {/* Node: Dashboard (Matches 4-square grid active pill in eight.jpeg) */}
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all font-sans ${
                    activeTab === 'dashboard'
                      ? 'font-semibold shadow-xs'
                      : 'font-medium text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                  style={
                    activeTab === 'dashboard'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Dashboard"
                >
                  <LayoutGrid className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-black stroke-[2.2]' : 'text-gray-400'}`} />
                  <span>Dashboard</span>
                </button>

                {/* Node: Manage Catalog */}
                <button
                  onClick={() => handleNavClick('catalog')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all font-sans group ${
                    activeTab === 'catalog'
                      ? 'font-semibold shadow-xs'
                      : 'font-medium text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                  style={
                    activeTab === 'catalog'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Manage Catalog"
                >
                  <div className="flex items-center gap-3">
                    <FolderKanban className={`w-4 h-4 shrink-0 ${activeTab === 'catalog' ? 'text-black stroke-[2.2]' : 'text-gray-400 group-hover:text-black'}`} />
                    <span>Manage Catalog</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'catalog' ? 'bg-black/15 text-black' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}
                  >
                    {products.length || 10}
                  </span>
                </button>

                {/* Node: Customer Orders */}
                <button
                  onClick={() => handleNavClick('orders')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all font-sans group ${
                    activeTab === 'orders'
                      ? 'font-semibold shadow-xs'
                      : 'font-medium text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                  style={
                    activeTab === 'orders'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Customer Orders"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className={`w-4 h-4 shrink-0 ${activeTab === 'orders' ? 'text-black stroke-[2.2]' : 'text-gray-400 group-hover:text-black'}`} />
                    <span>Customer Orders</span>
                  </div>
                  {orders.length > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all font-sans group ${
                    activeTab === 'messages'
                      ? 'font-semibold shadow-xs'
                      : 'font-medium text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                  style={
                    activeTab === 'messages'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Customer Messages"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${activeTab === 'messages' ? 'text-black stroke-[2.2]' : 'text-gray-400 group-hover:text-black'}`} />
                    <span>Customer Messages</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'messages' ? 'bg-black/15 text-black' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {chats.length > 0 ? chats.length : 1}
                  </span>
                </button>
              </div>
            </div>

            {/* ── SECTION 2: SETTINGS ── */}
            <div className="mt-5">
              <p className="font-sans text-[11px] font-medium text-gray-400 px-3 mb-2">
                Settings
              </p>
              <div className="space-y-1">
                {/* Node: Settings */}
                <button
                  onClick={() => handleNavClick('settings')}
                  className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all font-sans group ${
                    activeTab === 'settings'
                      ? 'font-semibold shadow-xs'
                      : 'font-medium text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                  style={
                    activeTab === 'settings'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Settings & Credentials"
                >
                  <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-black stroke-[2.2]' : 'text-gray-400 group-hover:text-black'}`} />
                  <span>Settings</span>
                </button>

                {/* Node: Reset Sample Data */}
                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors font-sans group"
                  title="Reset Sample Data"
                >
                  <RotateCcw className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-rose-600 transition-colors" />
                  <span>Reset Sample Data</span>
                </button>

                {/* Node: Return to Store */}
                <button
                  onClick={() => navigateTo('home')}
                  className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:text-[#b38728] hover:bg-amber-50/50 transition-colors font-sans group cursor-pointer"
                  title="Return to Store"
                >
                  <Store className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-[#b38728] transition-colors" />
                  <span>Return to Store</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: NOTIFICATIONS & LOGOUT (Exact match to five.webp bottom) ── */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div>
              <p className="font-sans text-[11px] font-medium text-gray-400 px-2 mb-2">
                Notifications
              </p>
              <div className="space-y-2">
                {/* Notification Card 1: Grace Kembabazi */}
                <div
                  onClick={() => handleNavClick('messages')}
                  className="p-2.5 rounded-2xl bg-[#f8f9fa] hover:bg-amber-50/60 transition-all flex items-center gap-3 cursor-pointer border border-gray-100/70"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-[#b38728] flex items-center justify-center font-bold text-[11px] shrink-0 ring-1 ring-[#b38728]/20">
                    GK
                  </div>
                  <div className="overflow-hidden font-sans">
                    <p className="font-semibold text-xs text-gray-900 leading-tight">Grace Kembabazi</p>
                    <p className="text-[10px] text-gray-400 font-normal leading-tight mt-0.5 truncate">
                      Hi, This product is available for n...
                    </p>
                  </div>
                </div>

                {/* Notification Card 2: Ibnul Shams */}
                <div
                  onClick={() => handleNavClick('messages')}
                  className="p-2.5 rounded-2xl bg-[#f8f9fa] hover:bg-amber-50/60 transition-all flex items-center gap-3 cursor-pointer border border-gray-100/70"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 ring-1 ring-blue-300/30">
                    IS
                  </div>
                  <div className="overflow-hidden font-sans">
                    <p className="font-semibold text-xs text-gray-900 leading-tight">Ibnul Shams</p>
                    <p className="text-[10px] text-gray-400 font-normal leading-tight mt-0.5 truncate">
                      Hi, Can I request custom eng...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Log out Row with Toggle Switch (Matches five.webp "[-> Log out  (o)]") */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-2">
              <button
                onClick={handleLogoutAction}
                className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 hover:text-rose-600 transition-colors cursor-pointer"
                title="Log out of session"
              >
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                <span>Log out</span>
              </button>

              <button
                onClick={handleLogoutAction}
                className="w-10 h-5 rounded-full bg-slate-200 hover:bg-slate-300 p-0.5 flex items-center transition-colors cursor-pointer"
                title="Toggle Login Session"
              >
                <span className="w-4 h-4 rounded-full bg-slate-700 shadow-xs block"></span>
              </button>
            </div>
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
            <div className="space-y-6 animate-fade-in font-sans">
              {/* ROW 1: 4 STAT CARDS (Matches five.webp Top Stat Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Total Sales */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Total Sales</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Coins className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-2.5">
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {totalSalesUGX > 0 ? formatUGX(totalSalesUGX) : 'UGX 15,200,000'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center font-bold text-emerald-600">
                      <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                      75.55%
                    </span>
                    <span className="text-gray-400 font-medium">+ UGX 1.2M Target</span>
                  </div>
                </div>

                {/* Card 2: Total Orders */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Total Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-2.5">
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {orders.length > 0 ? (16920 + orders.length).toLocaleString() : '16,920'}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center font-bold text-rose-500">
                        <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        3%
                      </span>
                      <span className="text-gray-400 font-medium">Vs last month</span>
                    </div>
                    <button 
                      onClick={() => handleNavClick('orders')}
                      className="font-bold text-[#b38728] hover:underline cursor-pointer"
                    >
                      View orders
                    </button>
                  </div>
                </div>

                {/* Card 3: Order Complete */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Order Complete</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-2.5">
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      16,581
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center font-bold text-emerald-600">
                      <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                      98%
                    </span>
                    <span className="text-gray-400 font-medium">Vs last month</span>
                  </div>
                </div>

                {/* Card 4: Cancel Order */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Cancel Order</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-2.5">
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      338
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center font-bold text-rose-500">
                      <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                      2%
                    </span>
                    <span className="text-gray-400 font-medium">227 Design changing *</span>
                  </div>
                </div>
              </div>

              {/* ROW 2: TARGET GAUGE & STATISTIC SPLINE CHART (Matches five.webp Middle Row) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Target Semi-Circular Arc Gauge Card (~38% / 5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Target</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Revenue Target / Today</p>
                    </div>
                    <button 
                      onClick={() => showToast('Target calculation synced with boutique daily goals.')}
                      className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Semi-Circular Arc Gauge */}
                  <div className="relative flex flex-col items-center justify-center my-3">
                    <svg viewBox="0 0 200 125" className="w-56 h-36">
                      <defs>
                        <linearGradient id="targetGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#b38728" />
                          <stop offset="50%" stopColor="#f5e6a5" />
                          <stop offset="100%" stopColor="#d4af37" />
                        </linearGradient>
                      </defs>
                      {/* Background Track */}
                      <path
                        d="M 25 105 A 75 75 0 0 1 175 105"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                      {/* Filled Arc (62.28% of 235.6 arc length = 146.7, strokeDashoffset = 88.9) */}
                      <path
                        d="M 25 105 A 75 75 0 0 1 175 105"
                        fill="none"
                        stroke="url(#targetGoldGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray="235.6"
                        strokeDashoffset="88.9"
                      />
                    </svg>
                    {/* Percentage Center Overlay */}
                    <div className="absolute top-14 flex flex-col items-center text-center">
                      <span className="text-3xl font-extrabold text-gray-900 tracking-tight">62.28%</span>
                      <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full mt-0.5">
                        -37.72%
                      </span>
                    </div>
                  </div>

                  {/* Gauge Subtitle Message */}
                  <p className="text-center text-xs text-gray-500 font-medium px-4">
                    You succeed earn <span className="font-bold text-gray-800">UGX 740,000</span> today, Current Sells Revenue is <span className="font-bold text-[#b38728]">40%</span> !
                  </p>

                  {/* Bottom 3 Columns Metrics with Vertical Dividers */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100 pt-4 mt-4 border-t border-gray-100 text-center">
                    <div className="px-2">
                      <p className="text-[11px] text-gray-400 font-medium">Target</p>
                      <p className="text-xs font-bold text-gray-800 mt-1 flex items-center justify-center gap-0.5">
                        <span>UGX 1.2M</span>
                        <span className="text-rose-500 text-sm">↓</span>
                      </p>
                    </div>
                    <div className="px-2">
                      <p className="text-[11px] text-gray-400 font-medium">Revenue</p>
                      <p className="text-xs font-bold text-gray-800 mt-1 flex items-center justify-center gap-0.5">
                        <span>UGX 298k</span>
                        <span className="text-emerald-500 text-sm">↑</span>
                      </p>
                    </div>
                    <div className="px-2">
                      <p className="text-[11px] text-gray-400 font-medium">Sells</p>
                      <p className="text-xs font-bold text-gray-800 mt-1 flex items-center justify-center gap-0.5">
                        <span>UGX 747k</span>
                        <span className="text-emerald-500 text-sm">↑</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistic Spline Line Chart (~62% / 7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Statistic</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Revenue and Sales</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>
                        <span>Cancel</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                        <span>Revenue</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#b38728]"></span>
                        <span>Sales</span>
                      </div>
                      <button 
                        onClick={() => showToast('Monthly statistical projection updated.')}
                        className="p-1 text-gray-400 hover:text-gray-700 transition-colors ml-1"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Spline Chart */}
                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={STATISTIC_SPLINE_DATA} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(v) => v === 0 ? '0' : `${v >= 1000 ? (v / 1000).toFixed(1) + 'M' : v + 'K'}`} 
                        />
                        <Tooltip content={<CustomSplineTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3b82f6" 
                          strokeWidth={2.5} 
                          dot={false} 
                          activeDot={{ r: 5, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#b38728" 
                          strokeWidth={2.5} 
                          dot={false} 
                          activeDot={{ r: 5, fill: '#b38728', stroke: '#ffffff', strokeWidth: 2 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cancel" 
                          stroke="#f43f5e" 
                          strokeWidth={2} 
                          dot={false} 
                          activeDot={{ r: 4, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 2 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* ROW 3: LATEST ORDER TABLE & BUSINESS GROWTH MAP (Matches five.webp Bottom Row) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Latest Order Table (~65% / 8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold text-gray-900">Latest Order</h4>
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-black"
                        style={{ background: 'var(--gradient-gold-metallic)' }}
                      >
                        +2 New
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast('Date range filter applied.')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Select Date</span>
                      </button>

                      <button
                        onClick={() => showToast('Filter panel opened.')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                        <span>Filters</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('orders')}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-[#b38728] transition-colors cursor-pointer"
                      >
                        See All
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                    <table className="w-full text-left text-xs min-w-[580px]">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-[11px] font-medium">
                          <th className="pb-3 font-medium">Source</th>
                          <th className="pb-3 font-medium">Customer</th>
                          <th className="pb-3 font-medium">Total</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {/* Row 1: Ibnul Shams Al Asad */}
                        <tr className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                S
                              </div>
                              <div className="flex items-center gap-1 text-gray-700 font-medium">
                                <span>On Shop</span>
                                <Phone className="w-3 h-3 text-gray-400" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <p className="font-bold text-gray-800">Ibnul Shams Al Asad</p>
                            <p className="text-[11px] text-gray-400">shams@hotmail.com</p>
                          </td>
                          <td className="py-3.5 font-bold text-gray-800">UGX 812,100</td>
                          <td className="py-3.5">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100/70 text-amber-800 shadow-[0_0_8px_rgba(251,191,36,0.25)]">
                              Processing
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="inline-flex items-center gap-1 text-gray-400">
                              <button 
                                onClick={() => showToast('Order details opened for Ibnul Shams.')}
                                className="p-1 hover:text-[#b38728] transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => showToast('Archived order row.')}
                                className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Row 2: Ilham Budi Agung */}
                        <tr className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                                a
                              </div>
                              <div className="flex items-center gap-1 text-gray-700 font-medium">
                                <span>Amazon</span>
                                <Mail className="w-3 h-3 text-gray-400" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <p className="font-bold text-gray-800">Ilham Budi Agung</p>
                            <p className="text-[11px] text-gray-400">ilahmbudi@google.com</p>
                          </td>
                          <td className="py-3.5 font-bold text-gray-800">UGX 1,349,000</td>
                          <td className="py-3.5">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100/70 text-amber-800 shadow-[0_0_8px_rgba(251,191,36,0.25)]">
                              Processing
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="inline-flex items-center gap-1 text-gray-400">
                              <button 
                                onClick={() => showToast('Order details opened for Ilham Budi.')}
                                className="p-1 hover:text-[#b38728] transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => showToast('Archived order row.')}
                                className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Row 3: Mohammad Karim */}
                        <tr className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                S
                              </div>
                              <div className="flex items-center gap-1 text-gray-700 font-medium">
                                <span>On Shop</span>
                                <Phone className="w-3 h-3 text-gray-400" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <p className="font-bold text-gray-800">Mohammad Karim</p>
                            <p className="text-[11px] text-gray-400">m_karim@yahoo.com</p>
                          </td>
                          <td className="py-3.5 font-bold text-gray-800">UGX 272,500</td>
                          <td className="py-3.5">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
                              Cancel
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="inline-flex items-center gap-1 text-gray-400">
                              <button 
                                onClick={() => showToast('Order details opened for Mohammad Karim.')}
                                className="p-1 hover:text-[#b38728] transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => showToast('Archived order row.')}
                                className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Row 4: Layla Al-Mansoori / Live Orders */}
                        {orders.length > 0 ? (
                          orders.slice(0, 1).map((ord) => (
                            <tr key={ord.id} className="hover:bg-amber-50/30 transition-colors">
                              <td className="py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                    S
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-700 font-medium">
                                    <span>On Shop</span>
                                    <Phone className="w-3 h-3 text-gray-400" />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5">
                                <p className="font-bold text-gray-800">{ord.customer_name || 'Boutique Patron'}</p>
                                <p className="text-[11px] text-gray-400">{ord.customer_phone || ord.customer_email || 'Direct Checkout'}</p>
                              </td>
                              <td className="py-3.5 font-bold text-gray-800">{formatUGX(ord.total_amount)}</td>
                              <td className="py-3.5">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                  ord.status === 'Completed' 
                                    ? 'bg-emerald-50 text-emerald-600' 
                                    : ord.status === 'Cancelled' 
                                    ? 'bg-rose-50 text-rose-600' 
                                    : 'bg-amber-100/70 text-amber-800'
                                }`}>
                                  {ord.status || 'Processing'}
                                </span>
                              </td>
                              <td className="py-3.5 text-right">
                                <div className="inline-flex items-center gap-1 text-gray-400">
                                  <button 
                                    onClick={() => setViewingOrder(ord)}
                                    className="p-1 hover:text-[#b38728] transition-colors cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => showToast('Archived order row.')}
                                    className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="hover:bg-amber-50/30 transition-colors">
                            <td className="py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                  S
                                </div>
                                <div className="flex items-center gap-1 text-gray-700 font-medium">
                                  <span>On Shop</span>
                                  <Phone className="w-3 h-3 text-gray-400" />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5">
                              <p className="font-bold text-gray-800">Layla Al-Mansoori</p>
                              <p className="text-[11px] text-gray-400">layla@dainty.ug</p>
                            </td>
                            <td className="py-3.5 font-bold text-gray-800">UGX 540,000</td>
                            <td className="py-3.5">
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                                Completed
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="inline-flex items-center gap-1 text-gray-400">
                                <button 
                                  onClick={() => showToast('Order details opened for Layla Al-Mansoori.')}
                                  className="p-1 hover:text-[#b38728] transition-colors cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => showToast('Archived order row.')}
                                  className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Business Growth Card (~35% / 4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Business Growth</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Based on Country / Region</p>
                    </div>
                    <button 
                      onClick={() => showToast('Regional telemetry updated.')}
                      className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Map Container with Dark Tooltip and Zoom Buttons */}
                  <div className="relative w-full h-44 rounded-xl bg-slate-50/70 border border-gray-100 overflow-hidden my-3 p-3 flex items-center justify-center">
                    {/* Subtle World Map SVG Silhouette */}
                    <svg viewBox="0 0 400 200" className="w-full h-full opacity-30 text-gray-400 fill-current">
                      <path d="M70,40 Q90,30 110,45 T140,40 T160,60 T140,90 T100,95 T80,75 Z" />
                      <path d="M190,40 Q220,35 250,55 T300,50 T330,80 T300,120 T240,110 T200,80 Z" />
                      <path d="M210,100 Q240,110 250,150 T220,180 T190,150 T200,110 Z" />
                      <path d="M100,120 Q130,130 135,170 T110,195 T90,160 Z" />
                      <path d="M320,130 Q350,135 365,160 T340,180 T310,160 Z" />
                    </svg>

                    {/* Floating Dark Stat Tooltip (Matches five.webp floating tooltip) */}
                    <div className="absolute right-4 top-4 bg-[#0f172a] text-white p-3 rounded-xl shadow-xl border border-slate-700/60 text-[11px] space-y-1 z-10 animate-fade-in">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-400">Revenue :</span>
                        <span className="font-bold text-white">6.12 M</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-400">Income :</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                          58% <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-400">Growth :</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                          30% <ArrowUp className="w-2.5 h-2.5 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>

                    {/* Glowing Location Marker on East Africa / Uganda */}
                    <div className="absolute left-[54%] top-[62%] -translate-x-1/2 -translate-y-1/2">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b38728] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#b38728] ring-2 ring-white"></span>
                      </span>
                    </div>

                    {/* Zoom In/Out Buttons */}
                    <div className="absolute left-3 bottom-3 flex flex-col gap-1 z-10">
                      <button 
                        onClick={() => showToast('Map zoom in.')}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => showToast('Map zoom out.')}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Country Progress Bars */}
                  <div className="space-y-3.5 pt-2">
                    {/* Item 1: Uganda */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">
                            UG
                          </span>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">Uganda</p>
                            <p className="text-[10px] text-gray-400">1,98,240 Customers</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-700">58%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>

                    {/* Item 2: Kenya */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#f97316] flex items-center justify-center text-[9px] text-white font-bold">
                            KE
                          </span>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">Kenya</p>
                            <p className="text-[10px] text-gray-400">1,21,240 Customers</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-700">16%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#f97316] h-full rounded-full" style={{ width: '16%' }}></div>
                      </div>
                    </div>

                    {/* Item 3: UAE & Global */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#b38728] flex items-center justify-center text-[9px] text-white font-bold">
                            GL
                          </span>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">UAE &amp; Global</p>
                            <p className="text-[10px] text-gray-400">45,100 Customers</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-700">26%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: '26%', background: 'var(--gradient-gold-metallic)' }}
                        ></div>
                      </div>
                    </div>
                  </div>
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
                                    onClick={() => handleDeleteProduct(p)}
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

          {/* ===================================================================
              VIEW 5: SETTINGS & ADMIN CREDENTIALS MANAGEMENT
             =================================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-black shadow-xs font-bold"
                    style={{ background: 'var(--gradient-gold-metallic)' }}
                  >
                    <Settings className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#3e2723] tracking-tight">Admin &amp; Store Settings</h2>
                    <p className="text-xs text-gray-500">Manage administrator login credentials, security access, and boutique preferences</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#dfc9b2]/60 text-xs text-[#8a640f] font-semibold shadow-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Security &amp; Console</span>
                </div>
              </div>

              {/* Card 1: Admin Login Credentials Form */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dfc9b2]/40 shadow-xs space-y-6">
                <div className="border-b border-[#f3ece6] pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b38728] flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#1c1917]">Admin Login Credentials</h3>
                      <p className="text-xs text-gray-500">Change your administrative username and password stored in local system</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Active Session</span>
                  </span>
                </div>

                {settingsFeedback && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                    settingsFeedback.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {settingsFeedback.type === 'success' ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <Info className="w-4 h-4 shrink-0 text-rose-600" />}
                    <span>{settingsFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveCredentials} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Admin Username
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsUser}
                      onChange={(e) => setSettingsUser(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#b38728] focus:ring-1 focus:ring-[#b38728] bg-gray-50/40"
                      placeholder="Username"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">This is the username used to log in at the admin portal gate.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#b38728] focus:ring-1 focus:ring-[#b38728]"
                      placeholder="Enter existing password to authorize update"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        New Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#b38728] focus:ring-1 focus:ring-[#b38728]"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#b38728] focus:ring-1 focus:ring-[#b38728]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-black shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                    >
                      <Key className="w-4 h-4" />
                      <span>Save &amp; Persist Credentials</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Atelier Boutique Status & Preferences */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dfc9b2]/40 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-[#f3ece6] pb-3">
                  <Store className="w-5 h-5 text-[#b38728]" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#1c1917]">DAINTY Atelier Boutique Status</h3>
                    <p className="text-xs text-gray-500">Live configuration and operations for Uganda storefront</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-gray-400 font-medium">Boutique Currency</p>
                    <p className="font-bold text-sm text-[#1c1917]">UGX (Ugandan Shillings)</p>
                    <p className="text-[10px] text-[#b38728] font-semibold">USD live conversion enabled</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-gray-400 font-medium">Kampala Express Delivery</p>
                    <p className="font-bold text-sm text-[#1c1917]">Free Over UGX 150,000</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Cash on Delivery &amp; Mobile Money</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-gray-400 font-medium">Atelier Location</p>
                    <p className="font-bold text-sm text-[#1c1917]">Kampala, Uganda</p>
                    <p className="text-[10px] text-gray-500 font-medium">Online Showroom &amp; Dispatch</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          IN-APP PRODUCT DELETION CONFIRMATION MODAL (Reliable in sandboxed iframes)
         ========================================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#dfc9b2] space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">Delete Product from Catalog</h3>
                <p className="text-xs text-gray-500">This action permanently deletes this product.</p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-3.5">
              <img
                src={productToDelete.image || productToDelete.images?.[0] || '/images/hero_rings.png'}
                alt={productToDelete.name}
                className="w-14 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
              />
              <div className="text-xs overflow-hidden">
                <p className="font-bold text-gray-900 truncate">{productToDelete.name}</p>
                <p className="text-[#b38728] font-bold">{formatUGX(productToDelete.price)}</p>
                <p className="text-gray-400 text-[10px] capitalize">Category: {productToDelete.category_id || 'Jewelry'}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete this piece from the store catalog? It will be removed immediately from the customer storefront.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
