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
  Coins,
  Smartphone,
  ShieldCheck,
  Globe
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
  compressImage,
  syncProductsWithServer,
  categories,
  subcategories,
  piercingLocations
} from '../../db';
import {
  getRelworxStatus,
  saveRelworxConfig,
  testRelworxConnection,
  MERCHANT_MTN_NUMBER,
  MERCHANT_AIRTEL_NUMBER
} from '../../services/relworxPayments';

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
  { label: 'Gold Flat-Back', url: '/images/vi.jpeg' },
  { label: 'Silver Labret', url: '/images/0.jpeg' },
  { label: 'Gold Open Ring', url: '/images/i.jpeg' },
  { label: 'Diamond Eternity', url: '/images/ii.jpeg' },
  { label: 'Pavé Clicker', url: '/images/iii.jpeg' },
  { label: 'Ring & Chain', url: '/images/iv.jpeg' },
  { label: 'Chain Drape Ring', url: '/images/v.jpeg' },
  { label: 'Marquise Cluster', url: '/images/vii.jpeg' },
  { label: 'Earring Set', url: '/images/viii.jpeg' }
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Formatted date string for header
  const [todayFormattedDate] = useState(() => {
    try {
      return new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Saturday, 7th November';
    }
  });

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

  // Online Server & Hostinger Database state
  const [isSyncingServer, setIsSyncingServer] = useState(false);
  const [dbStatus, setDbStatus] = useState({
    status: 'connected',
    driver: 'Hostinger Online Server Database',
    products_count: 0,
    persistent: true
  });
  const [showDbConfigForm, setShowDbConfigForm] = useState(false);
  const [dbHost, setDbHost] = useState('localhost');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPass, setDbPass] = useState('');
  const [dbConfigFeedback, setDbConfigFeedback] = useState(null);

  // Relworx Payment Gateway State
  const [relworxGatewayStatus, setRelworxGatewayStatus] = useState({
    configured: false,
    account_no: 'REL11AE925B85',
    api_key_set: false,
    masked_key: null,
    base_url: 'https://payments.relworx.com/api',
    webhook_url: 'https://daintystudsandchains.com/api/relworx/webhook',
    merchant_mtn: MERCHANT_MTN_NUMBER,
    merchant_airtel: MERCHANT_AIRTEL_NUMBER
  });
  const [relworxAccountNo, setRelworxAccountNo] = useState('REL11AE925B85');
  const [relworxApiKey, setRelworxApiKey] = useState('');
  const [relworxWebhookKey, setRelworxWebhookKey] = useState('424a7fe74781e4ecdcb8dfcbdb');
  const [relworxBaseUrl, setRelworxBaseUrl] = useState('https://payments.relworx.com/api');
  const [relworxFeedback, setRelworxFeedback] = useState(null);
  const [isTestingRelworx, setIsTestingRelworx] = useState(false);
  const [isSavingRelworx, setIsSavingRelworx] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const reloadRelworxStatus = async () => {
    try {
      const data = await getRelworxStatus();
      if (data) {
        setRelworxGatewayStatus(data);
        if (data.account_no) setRelworxAccountNo(data.account_no);
        if (data.base_url) setRelworxBaseUrl(data.base_url);
      }
    } catch {}
  };

  // Trigger manual sync with Hostinger online server
  const handleManualSync = async () => {
    setIsSyncingServer(true);
    try {
      await syncProductsWithServer();
      reloadData();
      showToast('All products and deletions synced with online Hostinger database!');
    } catch {
      showToast('Sync completed with local store.');
    } finally {
      setTimeout(() => setIsSyncingServer(false), 500);
    }
  };

  // Save Relworx payment credentials
  const handleSaveRelworx = async (e) => {
    if (e) e.preventDefault();
    setIsSavingRelworx(true);
    setRelworxFeedback({ type: 'info', message: 'Saving Relworx credentials to persistent storage...' });
    try {
      const res = await saveRelworxConfig({
        accountNo: relworxAccountNo,
        apiKey: relworxApiKey,
        webhookKey: relworxWebhookKey,
        baseUrl: relworxBaseUrl
      });
      setRelworxFeedback({ type: 'success', message: res.message || 'Relworx gateway credentials saved successfully!' });
      showToast('Relworx Payment credentials saved!');
      await reloadRelworxStatus();
    } catch (err) {
      setRelworxFeedback({ type: 'error', message: err.message || 'Failed to save credentials.' });
    } finally {
      setIsSavingRelworx(false);
    }
  };

  // Test connection to Relworx gateway
  const handleTestRelworxConnection = async () => {
    setIsTestingRelworx(true);
    setRelworxFeedback({ type: 'info', message: 'Contacting Relworx API gateway servers...' });
    try {
      const res = await testRelworxConnection({
        accountNo: relworxAccountNo,
        apiKey: relworxApiKey,
        baseUrl: relworxBaseUrl
      });
      setRelworxFeedback({ type: 'success', message: res.message || 'Connection successful! Relworx server is reachable and credentials validated.' });
      showToast('Relworx connection validated!');
      await reloadRelworxStatus();
    } catch (err) {
      setRelworxFeedback({ type: 'error', message: err.message || 'Relworx connection test failed.' });
    } finally {
      setIsTestingRelworx(false);
    }
  };

  // Check database and Relworx status on mount
  useEffect(() => {
    fetch('/api/database/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.status) setDbStatus(data);
      })
      .catch(() => {});
    reloadRelworxStatus();
  }, []);

  // Save Hostinger MySQL configuration if entered by admin
  const handleSaveDbConfig = async (e) => {
    e.preventDefault();
    setDbConfigFeedback({ type: 'info', message: 'Connecting to Hostinger MySQL Database...' });
    try {
      const res = await fetch('/api/database/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db_host: dbHost,
          db_name: dbName,
          db_user: dbUser,
          db_pass: dbPass
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDbConfigFeedback({ type: 'success', message: data.message || 'Connected to Hostinger MySQL successfully!' });
        showToast('Hostinger MySQL Database connected!');
        fetch('/api/database/status').then(r => r.json()).then(s => setDbStatus(s)).catch(() => {});
      } else {
        setDbConfigFeedback({ type: 'error', message: data.error || 'Failed to connect to MySQL database.' });
      }
    } catch (err) {
      setDbConfigFeedback({ type: 'error', message: err.message || 'Connection test failed.' });
    }
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

    // Cross-tab and in-memory real-time sync with database
    const handleStorageChange = () => {
      reloadData();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dainty_products_changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dainty_products_changed', handleStorageChange);
    };
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

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const toDeleteId = productToDelete.id;
    const toDeleteName = productToDelete.name;
    setProducts(prev => prev.filter(p => p.id !== toDeleteId));
    await deleteProduct(toDeleteId);
    reloadData();
    showToast(`Product "${toDeleteName}" was permanently deleted from catalog.`);
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
  const handleSaveProduct = async (productData) => {
    const saved = await saveProduct(productData);
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
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
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
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
          TOP NAVBAR (Single real DAINTY logo, organized and non-overlapping)
         ========================================================================= */}
      <nav className="h-16 bg-white border-b border-gray-100 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {/* Left: Back button, Sidebar Toggle, Single Website Logo, and Search */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Back Navigation Button */}
          <button
            type="button"
            onClick={() => goBack('home')}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-black bg-gray-50 hover:bg-amber-50 border border-gray-200/80 shadow-2xs transition-all cursor-pointer shrink-0"
            title="Go Back to Previous Page"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Sidebar Toggle Button (Collapses/expands sidebar for ALL screen sizes) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            aria-label="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Single Website Logo (DAINTY STUDS & CHAINS) */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer py-1 shrink-0"
            onClick={() => navigateTo('home')}
            title="DAINTY STUDS & CHAINS Storefront"
          >
            <img
              src="/images/logo-image.png"
              alt="DAINTY STUDS & CHAINS"
              className="h-9 sm:h-10 w-auto object-contain hover:scale-105 transition-transform"
            />
            <div className="hidden xl:flex flex-col">
              <span className="font-serif font-bold text-xs tracking-wider text-gray-900 leading-tight">DAINTY</span>
              <span className="text-[9px] font-mono tracking-widest text-[#b38728] uppercase leading-tight">STUDS &amp; CHAINS</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative hidden md:block w-44 lg:w-60 xl:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search catalog, orders..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCatalogSearch(e.target.value);
                setOrderSearch(e.target.value);
              }}
              className="w-full pl-9 pr-3.5 py-1.5 sm:py-2 text-xs text-gray-800 placeholder-gray-400 bg-[#f8f9fd] border border-gray-200/70 rounded-full outline-none focus:border-[#b38728] focus:bg-white transition-all font-sans"
            />
          </div>
        </div>

        {/* Right: Sync Status, Date, Notifications, Profile, and Power Logout (Clean non-overlapping flex layout) */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Hostinger Online Sync Status Button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncingServer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Online Hostinger Database Sync Active. Click to re-sync immediately."
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <RotateCcw className={`w-3 h-3 text-emerald-600 ${isSyncingServer ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncingServer ? 'Syncing...' : 'Online Synced'}</span>
          </button>

          {/* Date pill with Calendar icon */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-600 font-medium px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="whitespace-nowrap">{todayFormattedDate}</span>
          </div>

          {/* Notification bell with count badge 12 */}
          <div
            className="relative p-2 text-gray-600 hover:text-[#b38728] cursor-pointer transition-colors shrink-0"
            onClick={() => showToast('12 unread boutique events and notifications.')}
            title="12 New Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              12
            </span>
          </div>

          {/* Customer Messages Icon */}
          <div
            className="relative p-2 text-gray-600 hover:text-[#b38728] cursor-pointer transition-colors hidden sm:block shrink-0"
            onClick={() => handleNavClick('messages')}
            title="Customer Messages"
          >
            <Mail className="w-4 h-4" />
            {chats.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#b38728] ring-2 ring-white"></span>
            )}
          </div>

          {/* User Profile Info */}
          <div 
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
            title="Admin Profile & Settings"
          >
            <div className="relative shrink-0">
              <div 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-sans font-bold text-black shadow-xs ring-2 ring-[#b38728]/30"
                style={{ background: 'var(--gradient-gold-metallic)' }}
              >
                DS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-900 leading-tight whitespace-nowrap">DAINTY Curator</span>
                <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
              </div>
              <span className="text-[10px] text-gray-400 font-normal leading-tight whitespace-nowrap">Company Manager</span>
            </div>
          </div>

          {/* Power / Logout button */}
          <button
            onClick={handleLogoutAction}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Log Out"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Body: Sidebar + Content Canvas */}
      <div className="flex-1 flex min-h-[calc(100vh-64px)] relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          />
        )}

        {/* =====================================================================
            SIDEBAR (Collapsible for all screen sizes, filling vertical space with large buttons)
           ===================================================================== */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-40 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out min-h-[calc(100vh-64px)] ${
            isSidebarOpen
              ? 'w-72 p-5 translate-x-0 shadow-xl lg:shadow-none'
              : 'w-0 p-0 -translate-x-full lg:translate-x-0 overflow-hidden border-r-0'
          }`}
        >
          {/* Top Section & Primary Navigation (Filling vertical space) */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Curator Identity Header */}
            <div>
              <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-2xl bg-[#faf8f5] border border-[#dfc9b2]/30">
                <div className="relative shrink-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-sans font-extrabold text-black text-sm shadow-xs ring-2 ring-[#b38728]/30"
                    style={{ background: 'var(--gradient-gold-metallic)' }}
                  >
                    DS
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>
                <div className="overflow-hidden font-sans">
                  <h4 className="font-bold text-[14px] text-gray-900 leading-snug truncate">DAINTY Curator</h4>
                  <p className="text-[11px] text-[#b38728] font-semibold leading-snug truncate">Store Management HQ</p>
                </div>
              </div>

              {/* Primary Navigation Buttons (Generous clickable buttons filling vertical space) */}
              <div className="space-y-2.5">
                {/* 1. Dashboard */}
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center justify-start gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] transition-all font-sans cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'font-bold shadow-sm'
                      : 'font-semibold text-gray-700 hover:text-black hover:bg-gray-100/70'
                  }`}
                  style={
                    activeTab === 'dashboard'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Dashboard Overview"
                >
                  <LayoutGrid className={`w-5 h-5 shrink-0 ${activeTab === 'dashboard' ? 'text-black stroke-[2.4]' : 'text-gray-500'}`} />
                  <span>Dashboard</span>
                </button>

                {/* 2. Manage Catalog */}
                <button
                  onClick={() => handleNavClick('catalog')}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] transition-all font-sans group cursor-pointer ${
                    activeTab === 'catalog'
                      ? 'font-bold shadow-sm'
                      : 'font-semibold text-gray-700 hover:text-black hover:bg-gray-100/70'
                  }`}
                  style={
                    activeTab === 'catalog'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Manage Catalog"
                >
                  <div className="flex items-center gap-3.5">
                    <FolderKanban className={`w-5 h-5 shrink-0 ${activeTab === 'catalog' ? 'text-black stroke-[2.4]' : 'text-gray-500 group-hover:text-black'}`} />
                    <span>Manage Catalog</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      activeTab === 'catalog' ? 'bg-black/15 text-black' : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                    }`}
                  >
                    {products.length || 10}
                  </span>
                </button>

                {/* 3. Customer Orders */}
                <button
                  onClick={() => handleNavClick('orders')}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] transition-all font-sans group cursor-pointer ${
                    activeTab === 'orders'
                      ? 'font-bold shadow-sm'
                      : 'font-semibold text-gray-700 hover:text-black hover:bg-gray-100/70'
                  }`}
                  style={
                    activeTab === 'orders'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Customer Orders"
                >
                  <div className="flex items-center gap-3.5">
                    <ClipboardList className={`w-5 h-5 shrink-0 ${activeTab === 'orders' ? 'text-black stroke-[2.4]' : 'text-gray-500 group-hover:text-black'}`} />
                    <span>Customer Orders</span>
                  </div>
                  {orders.length > 0 && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        activeTab === 'orders' ? 'bg-black/15 text-black' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {orders.length}
                    </span>
                  )}
                </button>

                {/* 4. Customer Messages */}
                <button
                  onClick={() => handleNavClick('messages')}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] transition-all font-sans group cursor-pointer ${
                    activeTab === 'messages'
                      ? 'font-bold shadow-sm'
                      : 'font-semibold text-gray-700 hover:text-black hover:bg-gray-100/70'
                  }`}
                  style={
                    activeTab === 'messages'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Customer Messages"
                >
                  <div className="flex items-center gap-3.5">
                    <MessageSquare className={`w-5 h-5 shrink-0 ${activeTab === 'messages' ? 'text-black stroke-[2.4]' : 'text-gray-500 group-hover:text-black'}`} />
                    <span>Customer Messages</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      activeTab === 'messages' ? 'bg-black/15 text-black' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {chats.length > 0 ? chats.length : 1}
                  </span>
                </button>

                {/* 5. Settings */}
                <button
                  onClick={() => handleNavClick('settings')}
                  className={`w-full flex items-center justify-start gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] transition-all font-sans group cursor-pointer ${
                    activeTab === 'settings'
                      ? 'font-bold shadow-sm'
                      : 'font-semibold text-gray-700 hover:text-black hover:bg-gray-100/70'
                  }`}
                  style={
                    activeTab === 'settings'
                      ? { background: 'var(--gradient-gold-metallic)', color: '#000000' }
                      : {}
                  }
                  title="Settings &amp; Credentials"
                >
                  <Settings className={`w-5 h-5 shrink-0 ${activeTab === 'settings' ? 'text-black stroke-[2.4]' : 'text-gray-500 group-hover:text-black'}`} />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Bottom Section Actions (Reset Data, Return to Store, Logout with switch) */}
            <div className="pt-6 border-t border-gray-100 space-y-2.5">
              {/* 6. Reset Sample Data */}
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full flex items-center justify-start gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold text-gray-700 hover:text-rose-600 hover:bg-rose-50/60 transition-colors font-sans group cursor-pointer"
                title="Reset Sample Data"
              >
                <RotateCcw className="w-5 h-5 shrink-0 text-gray-500 group-hover:text-rose-600 transition-colors" />
                <span>Reset Sample Data</span>
              </button>

              {/* 7. Return to Store */}
              <button
                onClick={() => navigateTo('home')}
                className="w-full flex items-center justify-start gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold text-gray-700 hover:text-[#b38728] hover:bg-amber-50/60 transition-colors font-sans group cursor-pointer"
                title="Return to Customer Storefront"
              >
                <Store className="w-5 h-5 shrink-0 text-gray-500 group-hover:text-[#b38728] transition-colors" />
                <span>Return to Store</span>
              </button>

              {/* 8. Logout with Switch */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-gray-50 transition-colors">
                <button
                  onClick={handleLogoutAction}
                  className="flex items-center gap-3 text-[13px] font-semibold text-gray-700 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5 text-gray-500 group-hover:text-rose-600" />
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
                          const primaryImg = p.images?.[0] || p.image || '/images/vi.jpeg';
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
                                        e.currentTarget.src = '/images/vi.jpeg';
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

              {/* Card 1: Admin Login Credentials Form (Spanning Full Space) */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 w-full">
                <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b38728] flex items-center justify-center shrink-0">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-gray-900">Admin Login Credentials</h3>
                      <p className="text-xs text-gray-500">Update your administrative username and access passcode</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Active Session Authenticated</span>
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

                <form onSubmit={handleSaveCredentials} className="space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-2">
                        Admin Login Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsUser}
                        onChange={(e) => setSettingsUser(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#b38728] focus:ring-2 focus:ring-[#b38728]/20 bg-gray-50/50 transition-all"
                        placeholder="Username"
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5">This username is used to log in at the admin portal gate.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-2">
                        Current Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#b38728] focus:ring-2 focus:ring-[#b38728]/20 bg-gray-50/50 transition-all"
                        placeholder="Enter current password to authorize update"
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5">Default login passcode is <span className="font-mono font-bold text-gray-700">admin123</span>.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-2">
                        New Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#b38728] focus:ring-2 focus:ring-[#b38728]/20 bg-gray-50/50 transition-all"
                        placeholder="••••••••••••"
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5">Choose a secure password of at least 6 characters.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-2">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#b38728] focus:ring-2 focus:ring-[#b38728]/20 bg-gray-50/50 transition-all"
                        placeholder="••••••••••••"
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5">Re-enter new password to verify accuracy.</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">
                      Credentials are saved immediately in your browser secure store.
                    </p>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl font-bold text-sm text-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                      style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                    >
                      <Key className="w-4 h-4 stroke-[2.2]" />
                      <span>Save &amp; Persist Credentials</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Atelier Boutique Status & Preferences (Spanning Full Space) */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 w-full">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b38728] flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-gray-900">DAINTY Atelier Boutique Status</h3>
                    <p className="text-xs text-gray-500">Live operational configurations for Uganda and global patrons</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 w-full">
                  <div className="p-5 rounded-2xl bg-[#f8f9fd] border border-gray-100 space-y-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Boutique Currency</p>
                    <p className="font-extrabold text-lg text-gray-900">UGX (Ugandan Shillings)</p>
                    <p className="text-xs text-[#b38728] font-semibold">USD live conversion active (1 USD = 3,700 UGX)</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#f8f9fd] border border-gray-100 space-y-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Kampala Express Delivery</p>
                    <p className="font-extrabold text-lg text-gray-900">Complimentary Over UGX 150k</p>
                    <p className="text-xs text-emerald-600 font-semibold">Cash on Delivery &amp; Mobile Money ready</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#f8f9fd] border border-gray-100 space-y-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Atelier Showroom</p>
                    <p className="font-extrabold text-lg text-gray-900">Kampala, Uganda</p>
                    <p className="text-xs text-gray-500 font-medium">Boutique showroom &amp; digital dispatch</p>
                  </div>
                </div>
              </div>

              {/* Card 2.5: Hostinger Online Cloud Database & Sync Status */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 w-full">
                <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-gray-900">Hostinger Online Database &amp; Cross-Device Sync</h3>
                      <p className="text-xs text-gray-500">All product additions, modifications, and deletions sync in real-time across Hostinger and visitor devices</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncingServer}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-black shadow-xs transition-all flex items-center gap-2 cursor-pointer w-fit"
                    style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin' : ''}`} />
                    <span>{isSyncingServer ? 'Syncing Now...' : 'Force Sync Online'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Sync Mechanism</p>
                    <p className="font-bold text-sm text-gray-900 mt-1">Universal Multi-Device Sync</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">● Auto-syncs on view and save</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Active Hostinger Storage</p>
                    <p className="font-bold text-sm text-gray-900 mt-1">{dbStatus?.driver || 'Hostinger Online Server'}</p>
                    <p className="text-[11px] text-[#b38728] font-medium mt-0.5">Persistent across redeployments</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Live Catalog Count</p>
                    <p className="font-bold text-sm text-gray-900 mt-1">{products.length} Jewelry Pieces Active</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">Permanent deletion blacklist active</p>
                  </div>
                </div>

                {/* Optional Hostinger MySQL Config Details */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowDbConfigForm(!showDbConfigForm)}
                    className="text-xs font-bold text-[#b38728] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{showDbConfigForm ? 'Hide Hostinger MySQL Configuration' : 'Advanced: Configure Hostinger MySQL Database'}</span>
                  </button>

                  {showDbConfigForm && (
                    <form onSubmit={handleSaveDbConfig} className="mt-4 p-5 rounded-2xl bg-[#f8f9fd] border border-gray-200/80 space-y-4">
                      <p className="text-xs text-gray-600">
                        If you created a MySQL database in your Hostinger hPanel/cPanel, you can enter its details below to store products directly in MySQL tables:
                      </p>

                      {dbConfigFeedback && (
                        <div className={`p-3 rounded-xl text-xs font-semibold ${
                          dbConfigFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          dbConfigFeedback.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {dbConfigFeedback.message}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Database Host</label>
                          <input
                            type="text"
                            value={dbHost}
                            onChange={(e) => setDbHost(e.target.value)}
                            placeholder="localhost (default for Hostinger)"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#b38728]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Database Name</label>
                          <input
                            type="text"
                            value={dbName}
                            onChange={(e) => setDbName(e.target.value)}
                            placeholder="e.g. u123456789_dainty"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#b38728]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Database User</label>
                          <input
                            type="text"
                            value={dbUser}
                            onChange={(e) => setDbUser(e.target.value)}
                            placeholder="e.g. u123456789_admin"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#b38728]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Database Password</label>
                          <input
                            type="password"
                            value={dbPass}
                            onChange={(e) => setDbPass(e.target.value)}
                            placeholder="MySQL password"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#b38728]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-black shadow-xs cursor-pointer"
                          style={{ background: 'var(--gradient-gold-metallic)' }}
                        >
                          Save &amp; Test Connection
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Card 2.7: Relworx Mobile Money Gateway (Uganda) */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 w-full">
                <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b38728] flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-base text-gray-900">Relworx Mobile Money Gateway</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          relworxGatewayStatus.configured
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {relworxGatewayStatus.configured ? '● Configured & Ready' : '○ Enter API Key to Activate'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Automated USSD push payments for MTN Mobile Money &amp; Airtel Money in Uganda</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestRelworxConnection}
                      disabled={isTestingRelworx}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isTestingRelworx ? 'animate-spin' : ''}`} />
                      <span>{isTestingRelworx ? 'Testing...' : 'Test Connection'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRelworx}
                      disabled={isSavingRelworx}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>{isSavingRelworx ? 'Saving...' : 'Save Credentials'}</span>
                    </button>
                  </div>
                </div>

                {/* Relworx Status Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Business Account No</p>
                    <p className="font-mono font-bold text-sm text-gray-900">{relworxGatewayStatus.account_no || 'REL11AE925B85'}</p>
                    <p className="text-[10px] text-[#b38728] font-medium">DAINTY STUDS &amp; CHAINS</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MTN Mobile Money Merchant</p>
                    <p className="font-mono font-bold text-sm text-gray-900">+256 788 227027</p>
                    <p className="text-[10px] text-emerald-600 font-medium">USSD PIN push enabled</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Airtel Money Merchant</p>
                    <p className="font-mono font-bold text-sm text-gray-900">+256 759 924291</p>
                    <p className="text-[10px] text-emerald-600 font-medium">USSD PIN push enabled</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">API Authentication</p>
                    <p className="font-mono font-bold text-sm text-gray-900">
                      {relworxGatewayStatus.masked_key || (relworxGatewayStatus.api_key_set ? 'Active Key' : 'Not Configured')}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">Server-side secured (No VITE_ leak)</p>
                  </div>
                </div>

                {/* Feedback Message */}
                {relworxFeedback && (
                  <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    relworxFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : relworxFeedback.type === 'info'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {relworxFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{relworxFeedback.message}</span>
                  </div>
                )}

                {/* Server IP Whitelist Callout for Relworx "No Authorized IP Access" */}
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/90 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Hostinger / Server Outbound IP Address</span>
                    </h4>
                    <p className="text-[11px] text-blue-800/80 mt-0.5 leading-relaxed">
                      Add this IP to <strong>API Authorized IPs</strong> in your Relworx dashboard to fix &quot;No Authorized IP Access&quot;.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <code className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-mono font-bold text-blue-950 select-all">
                      {relworxGatewayStatus.server_ip || '151.106.96.51'}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        const ipToCopy = relworxGatewayStatus.server_ip || '151.106.96.51';
                        navigator.clipboard?.writeText(ipToCopy);
                        showToast(`Server IP ${ipToCopy} copied to clipboard!`);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      Copy IP
                    </button>
                  </div>
                </div>

                {/* Configuration Input Fields */}
                <form onSubmit={handleSaveRelworx} className="p-5 rounded-2xl bg-[#f8f9fd] border border-gray-200/80 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Relworx Business Account Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={relworxAccountNo}
                        onChange={(e) => setRelworxAccountNo(e.target.value)}
                        placeholder="REL11AE925B85"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 outline-none focus:border-[#b38728]"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Found in your Relworx dashboard under Business Profile.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Relworx API Key <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={relworxApiKey}
                        onChange={(e) => setRelworxApiKey(e.target.value)}
                        placeholder={relworxGatewayStatus.masked_key ? `Current: ${relworxGatewayStatus.masked_key} (Enter new key to change)` : 'relworx_live_... or API key'}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-[#b38728]"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                        API key from Relworx Organizations &rarr; API Keys. <strong>Note:</strong> In Relworx, make sure to <strong>Edit</strong> your API key and link/check <strong>REL11AE925B85</strong> under Business Accounts!
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Webhook Authentication Key (Optional)
                      </label>
                      <input
                        type="password"
                        value={relworxWebhookKey}
                        onChange={(e) => setRelworxWebhookKey(e.target.value)}
                        placeholder="Webhook key from Relworx settings"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-[#b38728]"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Used to verify HMAC-SHA256 signatures on payment callbacks.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        API Gateway Base URL
                      </label>
                      <input
                        type="text"
                        value={relworxBaseUrl}
                        onChange={(e) => setRelworxBaseUrl(e.target.value)}
                        placeholder="https://payments.relworx.com/api"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 outline-none focus:border-[#b38728]"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Standard: https://payments.relworx.com/api</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-200/60">
                    <div className="text-[11px] text-gray-500">
                      Webhook URL to register in Relworx: <code className="bg-white px-2 py-0.5 rounded border border-gray-200 font-mono text-gray-800">https://daintystudsandchains.com/api/relworx/webhook</code>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleTestRelworxConnection}
                        disabled={isTestingRelworx}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 cursor-pointer shadow-2xs"
                      >
                        {isTestingRelworx ? 'Testing...' : 'Test Connection'}
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingRelworx}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-black shadow-xs cursor-pointer"
                        style={{ background: 'var(--gradient-gold-metallic)' }}
                      >
                        {isSavingRelworx ? 'Saving...' : 'Save & Persist Configuration'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Helpful Checkout Flow Guide */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#b38728]" />
                    <span>How Customer Mobile Money Payments Work on daintystudsandchains.com</span>
                  </h4>
                  <ol className="text-[11px] text-amber-950/80 list-decimal list-inside space-y-1 leading-relaxed">
                    <li>Customer adds jewelry to bag and clicks checkout (or initiates mobile money checkout).</li>
                    <li>They select their operator (MTN or Airtel) and enter their phone number (e.g. 0788227027 or 0759924291).</li>
                    <li>Relworx sends a real-time USSD push prompt directly to the customer's phone handset.</li>
                    <li>Customer enters their Mobile Money PIN to authorize the payment in Ugandan Shillings (UGX).</li>
                    <li>The checkout modal automatically polls and confirms success, permanently records the order in the database, and clears the cart.</li>
                  </ol>
                </div>
              </div>

              {/* Card 3: Quick Maintenance & Actions */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                  <h4 className="font-serif font-bold text-base text-gray-900">Database &amp; Catalog Management</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Restore catalog default stock or explore the customer-facing boutique</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Sample Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-black transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                  >
                    <Store className="w-4 h-4" />
                    <span>Visit Storefront</span>
                  </button>
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
                src={productToDelete.image || productToDelete.images?.[0] || '/images/vi.jpeg'}
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
    category_id: product?.category_id || product?.category || 'earrings',
    subcategory_id: product?.subcategory_id || 'stud_ear',
    piercing_location: product?.piercing_location || product?.piercing || 'Ear Lobe',
    price: product?.price || '',
    sale_price: product?.sale_price || '',
    stock_quantity: product?.stock_quantity !== undefined ? product.stock_quantity : 15,
    material: product?.material || 'Stainless Steel & Titanium',
    finish: product?.finish || 'Tarnish-Resistant Finish',
    color: product?.color || 'Gold',
    length_size: product?.length_size || product?.size || 'Adjustable Fit / 45 cm standard chain length',
    gender: product?.gender || 'Women',
    occasion: product?.occasion || 'Everyday',
    sku: product?.sku || (product?.id ? `DSC-${product.id.toUpperCase()}` : 'DSC-ST-01'),
    description: product?.description || '',
    featured: product?.featured || false,
    new_arrival: product?.new_arrival ?? true,
    best_seller: product?.best_seller || false,
    images: product?.images || (product?.image ? [product.image] : [''])
  });

  const [imagePreview, setImagePreview] = useState(
    formData.images?.[0] || product?.image || '/images/vi.jpeg'
  );

  // File Upload Handler with client-side image optimization
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedUrl = await compressImage(file, 1000, 1000, 0.82);
        setImagePreview(compressedUrl);
        setFormData((prev) => ({
          ...prev,
          images: [compressedUrl, ...(prev.images?.slice(1) || [])]
        }));
      } catch (err) {
        console.error('Image upload compression error:', err);
      }
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

    const activeImg = imagePreview && imagePreview.trim() ? imagePreview : '/images/vi.jpeg';
    const payload = {
      ...formData,
      name: formData.name.trim(),
      price: Number(formData.price) || 50000,
      sale_price: formData.sale_price ? Number(formData.sale_price) : null,
      stock_quantity: Number(formData.stock_quantity) || 0,
      material: formData.material || 'Stainless Steel & Titanium',
      finish: formData.finish || 'Tarnish-Resistant Finish',
      color: formData.color || 'Gold',
      length_size: formData.length_size || 'Adjustable Fit / 45 cm standard chain length',
      gender: formData.gender || 'Women',
      occasion: formData.occasion || 'Everyday',
      category_id: formData.category_id || 'earrings',
      subcategory_id: formData.subcategory_id || 'stud_ear',
      piercing_location: formData.piercing_location || 'Ear Lobe',
      images: [activeImg, ...(formData.images?.slice(1) || [])].filter(Boolean)
    };
    if (!payload.images || payload.images.length === 0) {
      payload.images = ['/images/vi.jpeg'];
    }
    if (!product) {
      delete payload.id;
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fd] flex flex-col overflow-y-auto animate-fade-in">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 h-5 text-[#b38728] stroke-[2.5]" />
            <span>Back to Catalog</span>
          </button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-black"
                style={{ background: 'var(--gradient-gold-metallic)' }}
              >
                Catalog Studio
              </span>
              <span className="text-[11px] text-gray-400 font-medium hidden md:inline">
                DAINTY STUDS &amp; CHAINS HQ
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#3e2723] truncate">
              {product ? `Edit Piece: ${formData.name || 'Jewelry'}` : 'Add New Jewelry Creation to Catalog'}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs sm:text-sm transition-all"
          >
            Discard
          </button>
          <button
            type="submit"
            form="product-studio-form"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-black font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:brightness-105"
            style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
          >
            <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
            <span>{product ? 'Update Piece' : 'Publish to Catalog'}</span>
          </button>
        </div>
      </header>

      {/* Main Full-Page Studio Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <form id="product-studio-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Media & Image Studio (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Primary Image Preview Box */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Product Studio Photo</h3>
                    <p className="text-xs text-gray-400">High-resolution showcase image</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Preview
                  </span>
                </div>

                {/* Big Preview Canvas */}
                <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-[#faf8f5] to-[#f3ede4] border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group shadow-inner">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/images/vi.jpeg';
                      }}
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-xs text-gray-400 font-medium">No image loaded yet</p>
                    </div>
                  )}

                  {/* Luxury floating watermark tag */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white tracking-wider uppercase border border-white/20">
                    {formData.material} · {formData.color}
                  </div>
                </div>

                {/* Upload & URL Input Controls */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label 
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-black font-bold text-xs cursor-pointer shadow-xs hover:brightness-105 transition-all text-center"
                      style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                    >
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>Upload Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-gray-400 text-center sm:text-left">
                      Supports JPG, PNG, WEBP (stored locally)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Or Image Web Link / URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={imagePreview.startsWith('data:') ? '' : imagePreview}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#b38728] focus:bg-white font-mono text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Studio Presets */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Quick Studio Presets (1-Click)
                  </h4>
                  <span className="text-[10px] text-[#b38728] font-bold">8 Presets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STUDIO_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleImageUrlChange(preset.url)}
                      className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all group cursor-pointer ${
                        imagePreview === preset.url
                          ? 'border-[#b38728] bg-[#fbf8f0] shadow-2xs'
                          : 'border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200/60 group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-bold text-gray-700 text-center truncate w-full">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Specifications, Pricing & Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: All Categorizations & Identity */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Categorization &amp; Identity</h3>
                  <p className="text-xs text-gray-400">Title, product categories, piercing placements, and SKU</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Product Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. 14K Gold Marquise Cluster Stud Earring"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-[#b38728] focus:bg-white transition-all"
                    />
                  </div>

                  {/* All Categorizations */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={() => {
                          setFormData((prev) => ({ 
                            ...prev, 
                            category_id: 'earrings'
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white capitalize"
                      >
                        <option value="earrings">Earrings</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">Subcategory</label>
                      <select
                        value={formData.subcategory_id}
                        onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                      >
                        {subcategories
                          .filter(s => !formData.category_id || s.categoryId === formData.category_id)
                          .map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        {subcategories.every(s => s.categoryId !== formData.category_id) && (
                          <option value="general">General / Standard</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">Shop by Piercing</label>
                      <select
                        value={formData.piercing_location}
                        onChange={(e) => setFormData({ ...formData, piercing_location: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                      >
                        {piercingLocations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">SKU Inventory Code</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="DSC-ST-MRQ-11"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono outline-none focus:border-[#b38728] focus:bg-white uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">Stock Status / Availability</label>
                      <select
                        value={formData.stock_quantity > 0 ? 'in_stock' : 'out_of_stock'}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value === 'in_stock' ? (Number(formData.stock_quantity) > 0 ? formData.stock_quantity : 15) : 0 })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                      >
                        <option value="in_stock">In Stock (Available in Bag &amp; WhatsApp)</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Product Specifications Table (Matches Storefront View 3) */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Product Specifications</h3>
                    <p className="text-xs text-gray-400">Specifications displayed in the product details table on the storefront</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200/60">
                    Storefront Spec Table
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Material */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Material <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                    >
                      <option value="Stainless Steel & Titanium">Stainless Steel &amp; Titanium</option>
                      <option value="Stainless Steel">Stainless Steel</option>
                      <option value="Titanium">Titanium (Implant-Grade)</option>
                      <option value="Titanium & Gold PVD">Titanium &amp; Gold PVD</option>
                      <option value="18K Gold-Plated">18K Gold-Plated</option>
                      <option value="925 Sterling Silver">925 Sterling Silver</option>
                      <option value="18K Rose Gold Finish">18K Rose Gold Finish</option>
                    </select>
                  </div>

                  {/* Finish */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Finish <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      list="admin-finish-options"
                      value={formData.finish}
                      onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                      placeholder="e.g. Tarnish-Resistant Finish"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                    />
                    <datalist id="admin-finish-options">
                      <option value="Tarnish-Resistant Finish" />
                      <option value="High Mirror Polish" />
                      <option value="PVD Vacuum Plated" />
                      <option value="Antioxidant Coated" />
                      <option value="Water-Resistant Luster" />
                    </datalist>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Color <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                    >
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Rose Gold">Rose Gold</option>
                      <option value="White / Pearl">White / Pearl</option>
                      <option value="Black">Black</option>
                      <option value="Mixed">Mixed / Dual-Tone</option>
                    </select>
                  </div>

                  {/* Length/Size */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Length/Size <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      list="admin-length-options"
                      value={formData.length_size}
                      onChange={(e) => setFormData({ ...formData, length_size: e.target.value })}
                      placeholder="e.g. Adjustable Fit / 45 cm standard chain length"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                    />
                    <datalist id="admin-length-options">
                      <option value="Adjustable Fit / 45 cm standard chain length" />
                      <option value="6mm Post / 16G (1.2mm)" />
                      <option value="8mm Post / 16G (1.2mm)" />
                      <option value="10mm Post / 16G (1.2mm)" />
                      <option value="18 Gauge (1.0mm) Universal" />
                      <option value="Standard Lobe Fit" />
                    </datalist>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                    >
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men</option>
                    </select>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Occasion <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-[#b38728] focus:bg-white"
                    >
                      <option value="Everyday">Everyday</option>
                      <option value="Party">Party</option>
                      <option value="Gift">Gifts &amp; Hampers</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Valentine's">Valentine's</option>
                      <option value="Anniversary">Anniversary</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Pricing & Stock Inventory */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Pricing &amp; Inventory (Uganda)</h3>
                  <p className="text-xs text-gray-400">Curated Ugandan Shillings (UGX) pricing</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Standard Price (UGX) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="85000"
                        className="w-full pl-4 pr-16 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-[#b38728] focus:bg-white transition-all"
                      />
                      <span className="absolute right-3.5 text-[11px] font-bold text-gray-400 pointer-events-none select-none">
                        UGX
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Sale / Promo Price (UGX)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={formData.sale_price || ''}
                        onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                        placeholder="Optional sale"
                        className="w-full pl-4 pr-16 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-emerald-600 outline-none focus:border-[#b38728] focus:bg-white transition-all"
                      />
                      <span className="absolute right-3.5 text-[11px] font-bold text-gray-400 pointer-events-none select-none">
                        UGX
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Available Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="15"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-[#b38728] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Story & Description */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Product Story &amp; Details</h3>
                  <p className="text-xs text-gray-400">Handcrafted notes, hypoallergenic details, and styling advice</p>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the artisan craftsmanship, waterproof and hypoallergenic finish, setting style, and recommended pairings..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 outline-none focus:border-[#b38728] focus:bg-white leading-relaxed resize-y"
                  />
                </div>

                {/* Merchandising Badges */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-800 mb-3">Storefront Merchandising Badges</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.new_arrival}
                        onChange={(e) => setFormData({ ...formData, new_arrival: e.target.checked })}
                        className="w-4 h-4 rounded text-[#b38728] focus:ring-[#b38728]"
                      />
                      <span className="text-xs font-bold text-gray-800">New Arrival</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.best_seller}
                        onChange={(e) => setFormData({ ...formData, best_seller: e.target.checked })}
                        className="w-4 h-4 rounded text-[#b38728] focus:ring-[#b38728]"
                      />
                      <span className="text-xs font-bold text-gray-800">Best Seller</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-[#b38728] focus:ring-[#b38728]"
                      />
                      <span className="text-xs font-bold text-gray-800">Featured on Home</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bottom Submit Row */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500 text-center sm:text-left">
                  Ready to update DAINTY STUDS &amp; CHAINS live catalog for Kampala and global clients?
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs sm:text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-black font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:brightness-105"
                    style={{ background: 'var(--gradient-gold-metallic)', border: '1px solid var(--color-gold-light)' }}
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>{product ? 'Save & Update Catalog' : 'Publish Product to Catalog'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
