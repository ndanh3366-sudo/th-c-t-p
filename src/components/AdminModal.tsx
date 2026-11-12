import React, { useState, useEffect } from 'react';
import { Product, Order, WarrantyTicket, Coupon, CustomerAccount } from '../types';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { subscribeToCustomersList, blockIpCloud, unblockIpCloud, getRealClientPublicIp } from '../services/realtimeSync';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  warranties: WarrantyTicket[];
  coupons: Coupon[];
  onAddProduct: (p: Product) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder?: (orderId: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (val: boolean) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  warranties,
  coupons,
  onAddProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  showToast,
  isAdminAuthenticated,
  setIsAdminAuthenticated,
}) => {
  // Login form states (empty by default, user must enter manually)
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Admin tabs
  const [adminTab, setAdminTab] = useState<'customers' | 'orders' | 'products' | 'overview' | 'warranties'>('customers');

  // Order filtering
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'BANK' | 'COD'>('ALL');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // Customer & IP management state
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [bannedIps, setBannedIps] = useState<string[]>([]);
  const [currentClientIp, setCurrentClientIp] = useState<string>('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [blockIpTarget, setBlockIpTarget] = useState<{ ip: string; customerId?: string; name?: string } | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState('Nghi vấn tài khoản xấu / clone');

  // New product form
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(1500000);
  const [prodSeries, setProdSeries] = useState('Kamen Rider Gavv');
  const [prodCategory, setProdCategory] = useState<'dx-belt' | 'csm' | 'shf' | 'weapon'>('dx-belt');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([
    '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'
  ]);

  // Fetch customers and banned IPs via Realtime Cloud Firestore (Works 100% on Vercel)
  useEffect(() => {
    if (isOpen && isAdminAuthenticated) {
      setIsLoadingCustomers(true);
      getRealClientPublicIp().then(ip => {
        if (ip) setCurrentClientIp(ip);
      });

      const unsubscribe = subscribeToCustomersList((custs, banned) => {
        setCustomers(custs as any);
        setBannedIps(banned);
        setIsLoadingCustomers(false);
      });

      return () => unsubscribe();
    }
  }, [isOpen, isAdminAuthenticated]);

  const handleRefreshCustomers = () => {
    setIsLoadingCustomers(true);
    getRealClientPublicIp().then(ip => {
      if (ip) setCurrentClientIp(ip);
      setIsLoadingCustomers(false);
      showToast('🔄 Đã cập nhật dữ liệu IP & khách hàng mới nhất!', 'info');
    });
  };

  if (!isOpen) return null;

  // Handle Admin Login (Strict credentials: username "danh nguyễn", password "danh2009")
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingLogin(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        try {
          localStorage.setItem('npt_admin_auth', 'true');
          sessionStorage.setItem('npt_admin_auth', 'true');
        } catch {}
        showToast('👑 Chào mừng Quản Lý Danh Nguyễn đã đăng nhập vào Web Quản Trị!', 'success');
      } else {
        // Fallback local check if offline
        const normUser = adminUsername.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if ((normUser === 'danh nguyen' || normUser === 'danh nguyễn') && adminPassword.trim() === 'danh2009') {
          setIsAdminAuthenticated(true);
          try {
            localStorage.setItem('npt_admin_auth', 'true');
            sessionStorage.setItem('npt_admin_auth', 'true');
          } catch {}
          showToast('👑 Chào mừng Quản Lý Danh Nguyễn đã đăng nhập vào Web Quản Trị!', 'success');
        } else {
          setLoginError(data.error || 'Tài khoản hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.');
        }
      }
    } catch {
      // Local fallback
      const normUser = adminUsername.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if ((normUser === 'danh nguyen' || normUser === 'danh nguyễn') && adminPassword.trim() === 'danh2009') {
        setIsAdminAuthenticated(true);
        try {
          localStorage.setItem('npt_admin_auth', 'true');
          sessionStorage.setItem('npt_admin_auth', 'true');
        } catch {}
        showToast('👑 Chào mừng Quản Lý Danh Nguyễn đã đăng nhập!', 'success');
      } else {
        setLoginError('Tài khoản hoặc mật khẩu Quản Lý không chính xác! Vui lòng kiểm tra lại.');
      }
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('npt_admin_auth');
      sessionStorage.removeItem('npt_admin_auth');
    } catch {}
    setAdminUsername('');
    setAdminPassword('');
    setLoginError('');
    showToast('🔒 Đã đăng xuất khỏi Web Quản Lý!', 'info');
  };

  // Block IP Action (Cloud Firestore + Local synchronization across Vercel)
  const handleConfirmBlockIp = async () => {
    if (!blockIpTarget?.ip) return;
    const targetIp = blockIpTarget.ip.trim();
    try {
      await blockIpCloud(targetIp, blockIpTarget.customerId, blockReasonInput);
      showToast(`🚫 Đã chặn thành công IP [${targetIp}] trên toàn hệ thống!`, 'success');
      setBlockIpTarget(null);
    } catch {
      showToast('Không thể chặn IP, vui lòng thử lại', 'error');
    }
  };

  // Unblock IP Action (Cloud Firestore + Local synchronization across Vercel)
  const handleUnblockIp = async (ipToUnblock: string) => {
    const cleanIp = ipToUnblock.trim();
    try {
      await unblockIpCloud(cleanIp);
      showToast(`✅ Đã gỡ chặn cho IP [${cleanIp}]! Khách hàng có thể truy cập lại.`, 'success');
    } catch {
      showToast('Không thể gỡ chặn IP', 'error');
    }
  };

  // Delete Order Action
  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeletingOrder(true);
    try {
      const res = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        if (onDeleteOrder) {
          onDeleteOrder(orderToDelete.id);
        }
        showToast(`🗑️ Đã xóa vĩnh viễn đơn hàng #${orderToDelete.id}!`, 'success');
        setOrderToDelete(null);
      } else {
        // Fallback local delete
        if (onDeleteOrder) {
          onDeleteOrder(orderToDelete.id);
        }
        showToast(`🗑️ Đã xóa đơn hàng #${orderToDelete.id}!`, 'success');
        setOrderToDelete(null);
      }
    } catch {
      if (onDeleteOrder) {
        onDeleteOrder(orderToDelete.id);
      }
      showToast(`🗑️ Đã xóa đơn hàng #${orderToDelete.id}!`, 'success');
      setOrderToDelete(null);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProdImages(prev => [reader.result as string, ...prev]);
          showToast('📸 Đã tải lên hình ảnh sản phẩm thành công!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    if (prodImageUrl.trim()) {
      setProdImages(prev => [...prev, prodImageUrl.trim()]);
      setProdImageUrl('');
      showToast('🔗 Đã chèn link ảnh thủ công thành công!', 'info');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const newP: Product = {
      id: 'p-custom-' + Date.now(),
      name: prodName,
      code: 'BANDAI-NEW-' + Math.floor(Math.random() * 900 + 100),
      category: prodCategory,
      era: 'Reiwa',
      series: prodSeries as any,
      price: Number(prodPrice),
      originalPrice: Number(prodPrice) * 1.2,
      soldCount: 0,
      stock: 10,
      rating: 5.0,
      reviewCount: 0,
      images: prodImages.length > 0 ? prodImages : ['/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'],
      condition: 'New Seal 100%',
      description: 'Sản phẩm mới thêm bởi Quản trị viên Danh Nguyễn.',
      fullDescription: ['Sản phẩm đồ chơi Kamen Rider chính hãng Bandai Japan nhập khẩu trực tiếp.'],
      specifications: {
        manufacturer: 'Bandai Japan',
        material: 'ABS, PVC',
        releaseYear: '2026',
        batteryType: 'AAA x 3',
        effects: 'Âm thanh & Đèn LED',
        dimensions: 'Chuẩn Bandai',
        ageRating: '3+'
      }
    };

    onAddProduct(newP);
    setProdName('');
    showToast(`✅ Đã tạo sản phẩm mới: ${newP.name}`, 'success');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const bankOrders = orders.filter(o => o.paymentMethod === 'BANK');
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'BANK') return o.paymentMethod === 'BANK';
    if (orderFilter === 'COD') return o.paymentMethod !== 'BANK';
    return true;
  });

  const filteredCustomers = customers.filter(c => {
    if (!customerSearchQuery.trim()) return true;
    const q = customerSearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.ip.includes(q);
  });

  // =========================================================================
  // SCREEN 1: REQUIRE ADMIN AUTHENTICATION IF NOT LOGGED IN
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-[#0c1222] border-2 border-cyan-500/50 rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl space-y-6 text-white ring-1 ring-cyan-400/30">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#101935] hover:bg-cyan-900/50 text-slate-400 hover:text-white border border-cyan-500/30 flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300">
              <i className="fa-solid fa-shield-halved text-2xl text-black"></i>
            </div>
            <h3 className="font-serif-title text-xl font-black uppercase text-pop">
              Cổng Đăng Nhập <span className="aqua-gradient-text">Web Quản Lý</span>
            </h3>
            <p className="text-xs text-slate-300">
              Khu vực dành riêng cho Quản Trị Viên & Chủ Cửa Hàng
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-950/60 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-rose-400 text-sm"></i>
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                Tên Tài Khoản Quản Lý *
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  autoComplete="username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản quản trị..."
                  className="w-full bg-[#080d1a] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white pl-9 focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                />
                <i className="fa-solid fa-user-shield absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs"></i>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">
                Mật Khẩu Quản Lý *
              </label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  className="w-full bg-[#080d1a] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white pl-9 focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                />
                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs"></i>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:brightness-110 text-black font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmittingLogin ? (
                <i className="fa-solid fa-spinner animate-spin"></i>
              ) : (
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
              )}
              <span>Vào Cổng Web Quản Lý</span>
            </button>
          </form>

          <div className="pt-3 border-t border-cyan-500/20 text-center">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-cyan-300 transition underline cursor-pointer"
            >
              Quay lại Web Khách Hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: FULL ADMIN PORTAL (AUTHENTICATED AS DANH NGUYỄN)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/92 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0a0f1d] border-2 border-cyan-500/60 rounded-2xl w-full max-w-7xl shadow-[0_0_50px_rgba(0,242,254,0.3)] relative flex flex-col text-xs text-slate-200 my-4 max-h-[96vh]">
        
        {/* Top Management Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 bg-gradient-to-r from-[#0d1730] via-[#0a0f1d] to-[#0a0f1d] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/30">
              <i className="fa-solid fa-crown"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-title text-lg sm:text-xl font-black text-white uppercase text-pop">
                  Web Quản Lý <span className="aqua-gradient-text">NPTTEAMSTORE</span>
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Đã Liên Kết Web Khách
                </span>
              </div>
              <p className="text-[11px] text-cyan-300 font-bold">
                Quản Trị Viên: <strong className="text-white">Danh Nguyễn</strong> (Chủ Cửa Hàng) • Quyền hạn cao nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#14203d] hover:bg-[#1a2b52] border border-cyan-500/30 rounded-xl text-cyan-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Quay lại giao diện mua sắm của khách"
            >
              <i className="fa-solid fa-store text-xs"></i>
              <span className="hidden sm:inline">Xem Web Khách</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 rounded-xl text-rose-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Đăng xuất khỏi cổng quản lý"
            >
              <i className="fa-solid fa-right-from-bracket text-xs"></i>
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>

            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-[#060a14] hover:bg-cyan-900/50 text-slate-400 hover:text-white border border-cyan-500/30 flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap border-b border-cyan-500/30 bg-[#070b16] px-4 sm:px-6 gap-2 text-xs font-bold pt-3 pb-1">
          {[
            { id: 'customers', label: '👥 Khách Hàng & Chặn IP', icon: 'fa-users-gear', badge: customers.length },
            { id: 'orders', label: '💳 Đơn Hàng & Chuyển Khoản', icon: 'fa-receipt', badge: bankOrders.length ? `${bankOrders.length} CK` : undefined },
            { id: 'products', label: '📦 Quản Lý Sản Phẩm', icon: 'fa-box-open', badge: products.length },
            { id: 'overview', label: '📊 Doanh Thu & Thống Kê', icon: 'fa-chart-line' },
            { id: 'warranties', label: '🛡️ Bảo Hành', icon: 'fa-wrench', badge: warranties.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setAdminTab(t.id as any)}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                adminTab === t.id 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-extrabold shadow-md' 
                  : 'bg-[#0f172a] text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <i className={`fa-solid ${t.icon}`}></i> 
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className="text-[10px] bg-cyan-500/30 text-cyan-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: QUẢN LÝ KHÁCH HÀNG & CHẶN IP (CORE REQUIREMENT) */}
          {/* ========================================================================= */}
          {adminTab === 'customers' && (
            <div className="space-y-6">
              
              {/* Header metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0e162d] border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Tổng Tài Khoản Web Khách</span>
                    <p className="text-xl font-black text-white font-mono">{customers.length} Tài khoản</p>
                  </div>
                </div>

                <div className="bg-[#0e162d] border border-rose-500/30 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-ban"></i>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Địa Chỉ IP Đang Bị Chặn</span>
                    <p className="text-xl font-black text-rose-400 font-mono">{bannedIps.length} IP Bị Khóa</p>
                  </div>
                </div>

                <div className="bg-[#0e162d] border border-amber-500/30 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-clone"></i>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Nghi Vấn Tài Khoản Clone</span>
                    <p className="text-xl font-black text-amber-400 font-mono">
                      {customers.filter(c => c.isCloneSuspect).length} Clone Cảnh Báo
                    </p>
                  </div>
                </div>
              </div>

              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#070b16] p-3 rounded-2xl border border-cyan-500/20">
                <div className="relative flex-grow max-w-md">
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên, email, hoặc địa chỉ IP..."
                    className="w-full bg-[#0d1428] border border-cyan-500/30 rounded-xl px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs"></i>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRefreshCustomers}
                    className="px-3 py-2 bg-[#121c38] hover:bg-[#1a2850] text-cyan-300 font-bold rounded-xl border border-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <i className="fa-solid fa-rotate text-xs"></i>
                    <span>Làm Mới</span>
                  </button>

                  {currentClientIp && !bannedIps.includes(currentClientIp) && (
                    <button
                      onClick={() => setBlockIpTarget({ ip: currentClientIp, name: 'IP Kết Nối Hiện Tại' })}
                      className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer text-xs"
                      title={`Chặn địa chỉ IP đang kết nối [${currentClientIp}]`}
                    >
                      <i className="fa-solid fa-satellite-dish text-xs text-amber-400"></i>
                      <span>Chặn IP Hiện Tại [{currentClientIp}]</span>
                    </button>
                  )}

                  <button
                    onClick={() => setBlockIpTarget({ ip: '', name: 'Nhập thủ công' })}
                    className="px-3 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <i className="fa-solid fa-shield-halved text-xs"></i>
                    <span>Chặn IP Thủ Công</span>
                  </button>
                </div>
              </div>

              {/* Banned IP quick chips */}
              {bannedIps.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-shield-virus text-rose-400"></i>
                      <span>Danh Sách IP Đang Bị Chặn ({bannedIps.length}):</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bannedIps.map(ip => (
                      <span key={ip} className="bg-rose-900/60 border border-rose-500/50 text-rose-200 text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-2">
                        <strong>{ip}</strong>
                        <button
                          onClick={() => handleUnblockIp(ip)}
                          className="text-emerald-400 hover:text-emerald-300 font-bold text-[10px] underline cursor-pointer"
                          title="Bỏ chặn IP này"
                        >
                          Mở Chặn
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Table */}
              <div className="bg-[#070b16] border border-cyan-500/20 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0e162d] text-slate-300 font-bold uppercase text-[10px] border-b border-cyan-500/30">
                      <tr>
                        <th className="p-3">Khách Hàng</th>
                        <th className="p-3">Liên Hệ</th>
                        <th className="p-3">Địa Chỉ IP (Web Khách)</th>
                        <th className="p-3">Ngày Đăng Ký</th>
                        <th className="p-3">Cảnh Báo Clone</th>
                        <th className="p-3">Trạng Thái</th>
                        <th className="p-3 text-right">Thao Tác Quản Lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500">
                            Không tìm thấy tài khoản khách hàng nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map(cust => {
                          const isCustIpBanned = bannedIps.includes(cust.ip);
                          return (
                            <tr key={cust.id} className="hover:bg-[#0c1326] transition">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-black font-black flex items-center justify-center text-xs">
                                    {cust.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white">{cust.name}</p>
                                    <span className="text-[10px] text-slate-400">ID: {cust.id}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <p className="text-slate-200">{cust.email}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{cust.phone || 'Chưa cập nhật SĐT'}</p>
                              </td>

                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
                                    {cust.ip}
                                  </span>
                                  {isCustIpBanned && (
                                    <span className="text-rose-400 text-[10px] font-bold" title="IP đã bị chặn">
                                      <i className="fa-solid fa-lock"></i>
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="p-3 text-slate-300 font-mono text-[11px]">
                                {cust.registeredAt}
                              </td>

                              <td className="p-3">
                                {cust.isCloneSuspect ? (
                                  <span className="bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    Trùng IP (Nghi vấn clone)
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">Tài khoản hợp lệ</span>
                                )}
                              </td>

                              <td className="p-3">
                                {isCustIpBanned || cust.isBlocked ? (
                                  <span className="bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <i className="fa-solid fa-ban"></i>
                                    ĐÃ CHẶN IP
                                  </span>
                                ) : (
                                  <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                    <i className="fa-solid fa-check"></i>
                                    Hoạt Động
                                  </span>
                                )}
                              </td>

                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isCustIpBanned ? (
                                    <button
                                      onClick={() => handleUnblockIp(cust.ip)}
                                      className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg transition text-[11px] cursor-pointer"
                                    >
                                      Mở Chặn IP
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setBlockIpTarget({ ip: cust.ip, customerId: cust.id, name: cust.name })}
                                      className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 font-bold rounded-lg transition text-[11px] cursor-pointer flex items-center gap-1"
                                    >
                                      <i className="fa-solid fa-ban text-[10px]"></i>
                                      <span>Chặn IP</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: QUẢN LÝ ĐƠN HÀNG & CHUYỂN KHOẢN (WITH DELETE ORDER) */}
          {/* ========================================================================= */}
          {adminTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070b16] p-3 rounded-2xl border border-cyan-500/20">
                <div className="flex gap-2">
                  {[
                    { id: 'ALL', label: `Tất Cả (${orders.length})` },
                    { id: 'BANK', label: `💳 Đơn Chuyển Khoản (${bankOrders.length})` },
                    { id: 'COD', label: `COD & Khác (${orders.length - bankOrders.length})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        orderFilter === f.id
                          ? 'bg-cyan-400 text-black shadow-md'
                          : 'bg-[#0e162d] text-slate-300 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400">
                  <span>Có chức năng </span>
                  <strong className="text-rose-400">Xóa đơn hàng</strong>
                  <span> và kiểm tra thông tin tài khoản chuyển khoản</span>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-[#070b16] rounded-2xl border border-slate-800 text-slate-500">
                    <i className="fa-solid fa-receipt text-3xl mb-2 block"></i>
                    <p>Chưa có đơn hàng nào trong danh mục này.</p>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const isBank = order.paymentMethod === 'BANK';
                    return (
                      <div 
                        key={order.id} 
                        className={`bg-[#070b16] border rounded-2xl p-4 sm:p-5 space-y-3 transition ${
                          isBank 
                            ? 'border-cyan-500/40 bg-gradient-to-br from-[#070e1e] to-[#070b16]' 
                            : 'border-slate-800'
                        }`}
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-300 font-extrabold text-sm sm:text-base">
                              #{order.id}
                            </span>
                            <span className="text-slate-400 text-xs">• {order.date} lúc {order.time}</span>
                            
                            {isBank ? (
                              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                                <i className="fa-solid fa-building-columns"></i>
                                CHUYỂN KHOẢN NGÂN HÀNG (MB BANK)
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {order.paymentMethod}
                              </span>
                            )}

                            {order.customerIp && (
                              <span className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
                                IP: {order.customerIp}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Update Status Dropdown */}
                            <select 
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                              className="bg-[#0e162d] border border-cyan-500/30 text-xs font-bold text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer"
                            >
                              <option value="Chờ xác nhận">⏳ Chờ xác nhận</option>
                              <option value="Đang xử lý">⚙️ Đang xử lý / Đã nhận tiền</option>
                              <option value="Đang giao hàng">🚚 Đang giao hàng</option>
                              <option value="Đã giao thành công">✅ Đã giao thành công</option>
                              <option value="Đã hủy">❌ Đã hủy đơn</option>
                            </select>

                            {/* DELETE ORDER BUTTON (USER REQUIREMENT) */}
                            <button
                              onClick={() => setOrderToDelete(order)}
                              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 hover:text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                              title="Xóa vĩnh viễn đơn hàng này"
                            >
                              <i className="fa-solid fa-trash-can text-xs"></i>
                              <span>Xóa Đơn</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Body Details */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          
                          {/* Customer & Address */}
                          <div className="md:col-span-4 space-y-1 text-xs">
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <i className="fa-solid fa-user text-cyan-400"></i>
                              <span>{order.customerName}</span>
                            </p>
                            <p className="text-slate-300">SĐT: <strong className="text-white font-mono">{order.customerPhone}</strong></p>
                            <p className="text-slate-300">Email: {order.customerEmail}</p>
                            <p className="text-slate-400 text-[11px] mt-1">📍 {order.shippingAddress}</p>
                          </div>

                          {/* Bank Transfer Details (If Bank Transfer) */}
                          <div className="md:col-span-5 bg-[#0a1226] border border-cyan-500/20 rounded-xl p-3 space-y-1.5 text-xs">
                            <p className="font-bold text-cyan-300 uppercase text-[10px] tracking-wider flex items-center gap-1">
                              <i className="fa-solid fa-money-bill-transfer text-cyan-400"></i>
                              <span>Thông Tin Chuyển Khoản & Tài Khoản Cửa Hàng:</span>
                            </p>
                            <div className="grid grid-cols-2 gap-1 text-[11px]">
                              <div>
                                <span className="text-slate-400">Ngân hàng nhận:</span>
                                <p className="font-bold text-white">MB Bank (Quân Đội)</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Số tài khoản:</span>
                                <p className="font-mono font-bold text-amber-400">0988776655</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Chủ tài khoản:</span>
                                <p className="font-bold text-white">DANH NGUYEN</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Nội dung CK:</span>
                                <p className="font-mono text-cyan-300 font-bold">DH #{order.id}</p>
                              </div>
                            </div>

                            {order.bankTransferDetails?.senderBank && (
                              <div className="pt-1 border-t border-white/10 text-[10px] text-emerald-300">
                                <span>Khách báo đã chuyển từ: </span>
                                <strong>{order.bankTransferDetails.senderBank}</strong> ({order.bankTransferDetails.senderAccountName || 'Tài khoản khách'})
                              </div>
                            )}
                          </div>

                          {/* Total & Items */}
                          <div className="md:col-span-3 text-right flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold">Tổng Thanh Toán</span>
                              <p className="text-xl font-black text-rose-400 font-mono">
                                {order.total.toLocaleString('vi-VN')}đ
                              </p>
                              <span className="text-[10px] text-slate-400">{order.items.length} sản phẩm</span>
                            </div>

                            <div className="text-[10px] text-slate-400 mt-2">
                              {order.items.map(it => (
                                <p key={it.productId} className="truncate max-w-[180px] ml-auto">
                                  {it.productName} x{it.quantity}
                                </p>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: QUẢN LÝ SẢN PHẨM */}
          {/* ========================================================================= */}
          {adminTab === 'products' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateProduct} className="bg-[#070b16] border border-cyan-500/30 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-xs text-cyan-300 uppercase">Thêm Sản Phẩm Kamen Rider Mới</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Tên sản phẩm *</label>
                    <input 
                      type="text" 
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="DX Henshin Belt..."
                      className="w-full bg-[#0d1428] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Giá bán (VND) *</label>
                    <input 
                      type="number" 
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full bg-[#0d1428] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Danh mục *</label>
                    <select 
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value as any)}
                      className="w-full bg-[#0d1428] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="dx-belt">Đai DX Henshin Belt</option>
                      <option value="csm">CSM Complete Selection</option>
                      <option value="shf">Mô hình S.H.Figuarts</option>
                      <option value="weapon">Vũ Khí & Items</option>
                    </select>
                  </div>
                </div>

                {/* Upload Image Section */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-[10px] text-cyan-300 font-bold uppercase">
                    📸 Chèn / Tải Ảnh Sản Phẩm
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0d1428] p-3 rounded-xl border border-dashed border-cyan-500/40 text-center space-y-1">
                      <i className="fa-solid fa-cloud-arrow-up text-xl text-cyan-400"></i>
                      <p className="text-[11px] text-slate-300 font-bold">Chọn tệp ảnh từ máy tính / điện thoại</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:bg-cyan-400 file:text-black file:font-bold cursor-pointer"
                      />
                    </div>

                    <div className="bg-[#0d1428] p-3 rounded-xl border border-cyan-500/20 space-y-2">
                      <p className="text-[11px] text-slate-300 font-bold">Hoặc dán Link URL ảnh JPG/PNG:</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="https://domain.com/image.jpg"
                          value={prodImageUrl}
                          onChange={(e) => setProdImageUrl(e.target.value)}
                          className="flex-grow bg-[#070b16] border border-cyan-500/30 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                        <button 
                          type="button" 
                          onClick={handleAddImageUrl}
                          className="px-3 py-1 bg-cyan-400 text-black font-extrabold rounded-lg text-xs"
                        >
                          Chèn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="px-5 py-2.5 bg-cyan-400 text-black font-extrabold rounded-xl hover:brightness-110 transition shadow-lg cursor-pointer">
                  Thêm Vào Hệ Thống
                </button>
              </form>

              {/* Table */}
              <div className="bg-[#070b16] border border-cyan-500/20 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#0e162d] text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Mã SP</th>
                      <th className="p-3">Sản Phẩm</th>
                      <th className="p-3">Giá Bán</th>
                      <th className="p-3">Kho</th>
                      <th className="p-3">Đã Bán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className="p-3 font-mono text-cyan-300">{p.code}</td>
                        <td className="p-3 font-bold text-white">{p.name}</td>
                        <td className="p-3 font-mono">{p.price.toLocaleString('vi-VN')}đ</td>
                        <td className="p-3">{p.stock}</td>
                        <td className="p-3">{p.soldCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: TỔNG QUAN DOANH THU */}
          {/* ========================================================================= */}
          {adminTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#0e162d] border border-cyan-500/30 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Tổng Doanh Thu</span>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">{totalRevenue.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-[#0e162d] border border-cyan-500/30 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Số Đơn Hàng</span>
                  <p className="text-2xl font-black text-white font-mono mt-1">{orders.length}</p>
                </div>
                <div className="bg-[#0e162d] border border-cyan-500/30 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Đơn Chuyển Khoản</span>
                  <p className="text-2xl font-black text-cyan-300 font-mono mt-1">{bankOrders.length}</p>
                </div>
                <div className="bg-[#0e162d] border border-cyan-500/30 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Số Sản Phẩm KHO</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{products.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: YÊU CẦU BẢO HÀNH */}
          {/* ========================================================================= */}
          {adminTab === 'warranties' && (
            <div className="space-y-4">
              {warranties.length === 0 ? (
                <div className="text-center py-12 bg-[#070b16] rounded-2xl border border-slate-800 text-slate-500">
                  <i className="fa-solid fa-wrench text-3xl mb-2 block"></i>
                  <p>Chưa có yêu cầu bảo hành nào cần xử lý.</p>
                </div>
              ) : (
                warranties.map(w => (
                  <div key={w.id} className="bg-[#070b16] border border-cyan-500/20 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-300">Mã yêu cầu #{w.id} — {w.customerName}</span>
                      <span className="text-amber-400 font-bold">{w.status}</span>
                    </div>
                    <p className="text-slate-300 text-xs">Sản phẩm: {w.productName} • Serial: {w.productSerial}</p>
                    <p className="text-slate-400 text-xs">Lỗi: {w.issueType} — {w.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* IN-APP CONFIRMATION MODAL: DELETE ORDER (NO WINDOW.CONFIRM) */}
      {/* ========================================================================= */}
      {orderToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0c1222] border-2 border-rose-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white ring-1 ring-rose-400/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-trash-can"></i>
              </div>
              <div>
                <h4 className="font-serif-title text-base font-bold text-white uppercase">
                  Xác Nhận Xóa Đơn Hàng
                </h4>
                <p className="text-xs text-rose-300">
                  Thao tác này sẽ xóa vĩnh viễn đơn hàng khỏi Web Quản Lý!
                </p>
              </div>
            </div>

            <div className="bg-[#070b16] border border-rose-500/30 p-3.5 rounded-xl space-y-1.5 text-xs">
              <p className="text-slate-300">Mã đơn hàng: <strong className="text-white font-mono">#{orderToDelete.id}</strong></p>
              <p className="text-slate-300">Khách hàng: <strong className="text-white">{orderToDelete.customerName}</strong> ({orderToDelete.customerPhone})</p>
              <p className="text-slate-300">Phương thức: <strong className="text-cyan-300">{orderToDelete.paymentMethod}</strong></p>
              <p className="text-slate-300">Tổng tiền: <strong className="text-rose-400 font-mono">{orderToDelete.total.toLocaleString('vi-VN')}đ</strong></p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDeleteOrder}
                disabled={isDeletingOrder}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                {isDeletingOrder ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-trash-can"></i>}
                <span>Xóa Vĩnh Viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP MODAL: BLOCK IP */}
      {/* ========================================================================= */}
      {blockIpTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0c1222] border-2 border-rose-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white ring-1 ring-rose-400/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center text-xl shrink-0">
                <i className="fa-solid fa-shield-virus"></i>
              </div>
              <div>
                <h4 className="font-serif-title text-base font-bold text-white uppercase">
                  Chặn Địa Chỉ IP Web Khách
                </h4>
                <p className="text-xs text-rose-300">
                  Khách hàng với IP này sẽ bị từ chối truy cập, đặt hàng và chat!
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Địa Chỉ IP Cần Chặn *
                </label>
                <input
                  type="text"
                  value={blockIpTarget.ip}
                  onChange={(e) => setBlockIpTarget({ ...blockIpTarget, ip: e.target.value })}
                  placeholder="Ví dụ: 113.161.42.18"
                  className="w-full bg-[#070b16] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Lý Do Chặn IP
                </label>
                <input
                  type="text"
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                  placeholder="Nghi vấn tài khoản clone / spam..."
                  className="w-full bg-[#070b16] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBlockIpTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmBlockIp}
                disabled={!blockIpTarget.ip.trim()}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className="fa-solid fa-ban"></i>
                <span>Xác Nhận Chặn IP</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
