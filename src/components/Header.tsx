import React, { useState } from 'react';
import { Product, User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { NeonTreeIcon, NeonSnowflakeIcon, NeonStarIcon, NeonGiftIcon, NeonReindeerIcon } from './NeonAquaChristmasIcons';
import { useRealTime } from '../utils/useRealTime';
import { subscribeToLiveState } from '../services/realtimeSync';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  openCart?: () => void;
  onOpenCart?: () => void;
  currentUser: User | null;
  openAuth?: (mode?: 'login' | 'register') => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  openProfile?: () => void;
  onOpenProfile?: () => void;
  openAdmin?: () => void;
  onOpenAdmin?: () => void;
  onLogout: () => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onOpenWheel?: () => void;
  onOpenCompare?: () => void;
  compareCount?: number;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
  onOpenAbout?: () => void;
  onOpenTribute?: () => void;
  soundMuted?: boolean;
  onToggleSound?: () => void;
  onReplayIntro?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  onOpenCart,
  currentUser,
  openAuth,
  onOpenAuth,
  openProfile,
  onOpenProfile,
  openAdmin,
  onOpenAdmin,
  onLogout,
  products,
  onSelectProduct,
  onOpenWheel,
  onOpenCompare,
  compareCount = 0,
  onOpenWishlist,
  wishlistCount = 0,
  onOpenAbout,
  onOpenTribute,
  isAdminAuthenticated = false,
}) => {
  const handleOpenCart = openCart || onOpenCart || (() => {});
  const handleOpenAuth = openAuth || onOpenAuth || (() => {});
  const handleOpenProfile = openProfile || onOpenProfile || (() => {});
  const handleOpenAdmin = openAdmin || onOpenAdmin || (() => {});
  const { timeString, dateString } = useRealTime();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Global search shortcut Cmd+K or /
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => p.name.toLowerCase().includes(q) || p.series.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, products]);

  const [isRoomLiveNow, setIsRoomLiveNow] = useState(false);
  React.useEffect(() => {
    const unsub = subscribeToLiveState((state) => {
      if (typeof state?.isLive === 'boolean') {
        setIsRoomLiveNow(state.isLive);
      }
    });
    return () => unsub();
  }, []);

  const navLinks = [
    { id: 'home', label: 'Trang Chủ', icon: 'fa-house' },
    { 
      id: 'livestream', 
      label: 'LIVE STREAM', 
      icon: 'fa-tower-cell', 
      badge: isRoomLiveNow ? '🔴 ĐANG LIVE' : 'LIVE',
      badgeClass: isRoomLiveNow ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]' : undefined
    },
    { id: 'shop', label: 'Sản Phẩm', icon: 'fa-gamepad' },
    { id: 'auction', label: 'Đấu Giá', icon: 'fa-gavel', badge: 'HOT' },
    { id: 'feedback', label: 'Vinh Danh & Nhận Xét', icon: 'fa-award', badge: 'VIP' },
    { id: 'promotions', label: 'Khuyến Mãi', icon: 'fa-tags' },
    { id: 'about', label: 'Giới Thiệu Web', icon: 'fa-circle-info', highlight: true },
    { id: 'tracker', label: 'Tra Cứu Đơn', icon: 'fa-truck-ramp-box' },
    { id: 'quiz', label: 'Quiz Rider', icon: 'fa-wand-magic-sparkles' },
    { id: 'warranty', label: 'Bảo Hành', icon: 'fa-shield-halved' },
    { id: 'blog', label: 'Tin Tức', icon: 'fa-newspaper' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A0F1D]/95 backdrop-blur-xl border-b border-[#00F2FE]/35 shadow-[0_4px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.15)] relative">
      {/* Festive Holiday Fairy Lights Garland in Cyber Aqua & Gold */}
      <div className="absolute -top-0.5 left-0 right-0 h-1.5 flex justify-around pointer-events-none overflow-hidden z-50">
        {Array.from({ length: 32 }).map((_, i) => {
          const colors = [
            'bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]',
            'bg-[#FFD700] shadow-[0_0_8px_#FFD700]',
            'bg-[#05FFD2] shadow-[0_0_8px_#05FFD2]',
            'bg-[#E0F7FA] shadow-[0_0_8px_#E0F7FA]'
          ];
          const colorClass = colors[i % colors.length];
          return (
            <span
              key={i}
              className={`w-1.5 h-2 shadow-sm animate-pulse ${colorClass}`}
              style={{ 
                animationDuration: `${1.1 + (i % 4) * 0.3}s`, 
                animationDelay: `${(i % 5) * 0.15}s`,
                clipPath: 'polygon(0 0, 100% 0, 70% 100%, 30% 100%)'
              }}
            />
          );
        })}
      </div>

      {/* Dual Portal Switcher Bar: Web Khách vs Web Quản Lý */}
      <div className="bg-[#050914]/95 border-b border-[#00F2FE]/25 text-xs py-1.5 px-4 text-slate-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Dual Portal Switcher: Web Khách vs Web Quản Lý */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`font-bold px-3 py-1 rounded-full text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer transition ${
                activeTab !== 'admin'
                  ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/60 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'bg-[#121214] text-slate-400 border border-slate-700 hover:text-white'
              }`}
              title="Giao diện mua sắm dành cho khách hàng"
            >
              <i className="fa-solid fa-store text-[#00F2FE]"></i>
              <span>🛒 CỔNG WEB KHÁCH</span>
            </button>

            <span className="text-slate-600 text-xs">•</span>

            <button
              onClick={handleOpenAdmin}
              className={`font-black px-3 py-1 rounded-full text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer transition ${
                isAdminAuthenticated
                  ? 'bg-amber-500/25 text-[#FFD700] border border-amber-400/70 shadow-[0_0_14px_rgba(255,215,0,0.4)]'
                  : 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-500/50'
              }`}
              title="Cổng điều khiển & quản trị hệ thống dành cho Admin Danh Nguyễn"
            >
              <i className={`fa-solid ${isAdminAuthenticated ? 'fa-crown text-[#FFD700]' : 'fa-lock text-rose-400'}`}></i>
              <span>👑 CỔNG QUẢN LÝ (ADMIN)</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${isAdminAuthenticated ? 'bg-amber-400 text-black' : 'bg-rose-800 text-white'}`}>
                {isAdminAuthenticated ? 'ĐÃ MỞ KHÓA' : 'CẦN ĐĂNG NHẬP'}
              </span>
            </button>
          </div>

          {/* Quick info right side: Brand Guarantee & PWA */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="hidden md:inline-flex items-center gap-1 text-[#05FFD2] font-semibold">
              <i className="fa-solid fa-certificate text-[#00F2FE]"></i>
              Bandai Japan Official 100%
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
              <i className="fa-solid fa-truck-fast text-[#FFD700]"></i>
              Freeship toàn quốc từ 1.000.000đ
            </span>
            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo with Rounded Glow */}
        <div 
          onClick={() => {
            setActiveTab('home');
            onOpenTribute?.();
          }}
          className="flex items-center gap-3 cursor-pointer group select-none relative"
          title="Bấm vào logo để xem Tri Ân Thành Viên Team NPT"
        >
          <div 
            className="w-12 h-12 bg-[#080d1a] border-2 border-[#00F2FE] rounded-full p-0.5 shadow-[0_0_22px_rgba(0,242,254,0.65)] group-hover:shadow-[0_0_35px_rgba(5,255,210,0.9)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
          >
            <span className="font-black text-[#00F2FE] text-lg">DTD</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif-title text-2xl md:text-3xl font-black tracking-wider text-white uppercase group-hover:text-[#00F2FE] transition-colors drop-shadow-[0_0_12px_rgba(0,242,254,0.5)]">
                NPTTEAM<span className="text-[#00F2FE] drop-shadow-[0_0_15px_rgba(0,242,254,0.8)]">STORE</span>
              </h1>
              <NeonTreeIcon size={16} glow={true} />
            </div>
            <p className="text-[10px] text-[#00F2FE] tracking-wider uppercase font-extrabold flex items-center gap-1.5">
              <span>Bandai Japan Official</span>
              <span className="text-[10px] text-[#FFD700] animate-pulse">⚡</span>
            </p>
          </div>
        </div>

        {/* Real-time Clock in Header */}
        <div 
          className="hidden xl:flex items-center gap-2 bg-[#050B14] px-3.5 py-1.5 rounded-full border border-[#00F2FE]/40 text-[#00F2FE] font-mono text-xs shadow-[0_0_15px_rgba(0,242,254,0.25)] shrink-0"
          title="Thời gian thực hệ thống NPT Toku Store"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-slate-400 font-sans text-[11px]">{dateString}</span>
          <span className="text-slate-600">•</span>
          <span className="font-bold text-[#E0F7FA] tracking-wider">{timeString}</span>
        </div>

        {/* Search Bar with Rounded Corners */}
        <div className="flex-grow max-w-md hidden sm:block relative">
          <div className="relative">
            <input 
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Tìm DX Henshin Belt, CSM, S.H.Figuarts... (Nhấn / để tìm)"
              className="w-full bg-[#121214] border border-[#00F2FE]/40 focus:border-[#00F2FE] py-2 pl-10 pr-16 text-xs text-[#E0F7FA] placeholder-slate-400 focus:outline-none focus:shadow-[0_0_15px_rgba(0,242,254,0.45)] transition duration-200 rounded-full"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00F2FE] text-xs"></i>
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[#00F2FE] bg-[#0A0F1D] border border-[#00F2FE]/30 pointer-events-none rounded-full">
                /
              </span>
            )}
          </div>


          {/* Instant Search Suggestions Popup */}
          {showSuggestions && filteredProducts.length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-[#0A0F1D]/95 backdrop-blur-xl border border-[#00F2FE]/50 shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(0,242,254,0.3)] overflow-hidden z-50 divide-y divide-slate-800 rounded-xl"
            >
              <div className="px-4 py-2 text-[10px] uppercase font-bold text-[#00F2FE] flex items-center justify-between">
                <span>Gợi ý sản phẩm ({filteredProducts.length})</span>
                <NeonSnowflakeIcon size={12} />
              </div>
              {filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    setShowSuggestions(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-[#121214] cursor-pointer transition"
                >
                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-contain p-0.5 rounded-lg bg-[#050914] border border-[#00F2FE]/30" onError={(e) => { e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'; }} />
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-[#E0F7FA] truncate">{p.name}</h4>
                    <p className="text-[10px] text-gray-400">{p.series} • <span className="text-[#00F2FE] font-bold">{p.price.toLocaleString('vi-VN')}đ</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions: Cart & User Account with Angular Sci-Fi buttons & Neon Glow */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="sm:hidden relative w-9 h-9 bg-[#121214] border border-[#00F2FE]/50 text-[#00F2FE] flex items-center justify-center transition hover:border-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)] rounded-full"
            title="Tìm kiếm sản phẩm"
          >
            <i className={`fa-solid ${isMobileSearchOpen ? 'fa-xmark' : 'fa-magnifying-glass'} text-sm`}></i>
          </button>

          {/* User Rider Points (If logged in) */}
          {currentUser && (
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="hidden lg:flex items-center gap-1.5 bg-[#121214] border border-[#00F2FE]/45 px-3 py-1.5 text-xs cursor-pointer hover:border-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.25)] transition rounded-full"
            >
              <i className="fa-solid fa-coins text-[#FFD700]"></i>
              <span className="text-slate-400 text-[11px]">Points:</span>
              <strong className="text-[#00F2FE] font-bold">{currentUser.riderPoints}</strong>
            </div>
          )}

          {/* Lucky Wheel Button */}
          {onOpenWheel && (
            <button
              onClick={onOpenWheel}
              className="relative w-9 h-9 sm:w-10 sm:h-10 bg-[#121214] border border-[#00F2FE]/50 text-[#00F2FE] flex items-center justify-center transition hover:border-[#05FFD2] shadow-[0_0_12px_rgba(0,242,254,0.3)] hover:shadow-[0_0_20px_rgba(0,242,254,0.7)] cursor-pointer rounded-full"
              title="Vòng Quay May Mắn Rider"
            >
              <i className="fa-solid fa-arrows-spin text-sm animate-spin" style={{ animationDuration: '8s' }}></i>
            </button>
          )}

          {/* Compare Button */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="relative w-9 h-9 sm:w-10 sm:h-10 bg-[#121214] border border-[#00F2FE]/50 hover:border-[#00F2FE] text-[#E0F7FA] flex items-center justify-center transition shadow-[0_0_12px_rgba(0,242,254,0.3)] hover:shadow-[0_0_20px_rgba(0,242,254,0.7)] cursor-pointer rounded-full"
              title="So sánh sản phẩm"
            >
              <i className="fa-solid fa-code-compare text-sm text-[#00F2FE]"></i>
              {compareCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#00F2FE] text-slate-950 text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center border border-[#0A0F1D] shadow-[0_0_8px_#00F2FE] rounded-full">
                  {compareCount}
                </span>
              )}
            </button>
          )}

          {/* Wishlist Button */}
          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              className="relative w-9 h-9 sm:w-10 sm:h-10 bg-[#121214] border border-[#00F2FE]/50 hover:border-rose-500 text-[#E0F7FA] flex items-center justify-center transition shadow-[0_0_12px_rgba(0,242,254,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.7)] cursor-pointer rounded-full"
              title="Danh sách yêu thích"
            >
              <i className="fa-solid fa-heart text-sm text-rose-500"></i>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center border border-[#0A0F1D] animate-pulse rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Icon Button */}
          <button 
            onClick={handleOpenCart}
            className="relative w-9 h-9 sm:w-10 sm:h-10 bg-[#121214] border border-[#00F2FE]/60 hover:border-[#05FFD2] text-[#E0F7FA] flex items-center justify-center transition shadow-[0_0_15px_rgba(0,242,254,0.4)] hover:shadow-[0_0_25px_rgba(0,242,254,0.85)] cursor-pointer rounded-full"
            title="Giỏ hàng"
          >
            <i className="fa-solid fa-bag-shopping text-sm text-[#00F2FE]"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FFD700] text-slate-950 text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center border border-[#0A0F1D] shadow-[0_0_8px_#FFD700] animate-pulse rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          <div className="relative">
            {currentUser ? (
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-[#121214] hover:bg-[#1a1f33] border border-[#00F2FE]/50 hover:border-[#00F2FE] px-3 py-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.3)] rounded-full"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-[#00F2FE] to-[#05FFD2] flex items-center justify-center text-slate-950 font-black text-xs shadow-sm rounded-full">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-white hidden md:inline max-w-[100px] truncate">{currentUser.name}</span>
                <i className="fa-solid fa-chevron-down text-[10px] text-[#00F2FE]"></i>
              </button>
            ) : (
              <button 
                onClick={() => handleOpenAuth('login')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] hover:brightness-110 text-slate-950 font-black px-3.5 py-2 text-xs transition duration-200 shadow-[0_0_20px_rgba(0,242,254,0.6)] hover:shadow-[0_0_30px_rgba(5,255,210,0.9)] active:scale-95 cursor-pointer rounded-full"
              >
                <i className="fa-solid fa-user text-xs"></i>
                <span className="hidden sm:inline">Đăng Nhập</span>
              </button>
            )}

            {/* User Dropdown */}
            {userDropdownOpen && currentUser && (
              <div 
                onMouseLeave={() => setUserDropdownOpen(false)}
                className="absolute right-0 mt-2 w-56 bg-[#0A0F1D]/98 border border-[#00F2FE]/50 shadow-[0_12px_40px_rgba(0,0,0,0.95),0_0_20px_rgba(0,242,254,0.3)] p-2 z-50 text-xs text-[#E0F7FA] divide-y divide-[#00F2FE]/20 backdrop-blur-xl rounded-2xl"
              >
                <div className="p-3">
                  <p className="font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  <div className="mt-2 inline-block px-2.5 py-0.5 bg-[#00F2FE]/15 border border-[#00F2FE]/50 text-[#00F2FE] text-[10px] font-bold">
                    {currentUser.tierRank}
                  </div>
                </div>

                <div className="py-1">
                  <button 
                    onClick={() => { setActiveTab('dashboard'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-[#00F2FE]/15 transition flex items-center gap-2 text-slate-200 hover:text-[#00F2FE]"
                  >
                    <i className="fa-solid fa-gauge text-[#00F2FE]"></i> Dashboard & Đơn hàng
                  </button>
                  <button 
                    onClick={() => { handleOpenProfile(); setUserDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-[#00F2FE]/15 transition flex items-center gap-2 text-slate-200 hover:text-[#00F2FE]"
                  >
                    <i className="fa-solid fa-user-gear text-[#00F2FE]"></i> Cài đặt tài khoản
                  </button>
                  {currentUser.role === 'admin' && (
                    <button 
                      onClick={() => { handleOpenAdmin(); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-950/40 transition flex items-center gap-2 text-rose-400 font-bold"
                    >
                      <i className="fa-solid fa-shield-halved text-rose-500"></i> Quản Lý Admin
                    </button>
                  )}
                </div>

                <div className="pt-1">
                  <button 
                    onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-900/20 text-rose-400 hover:text-rose-300 transition flex items-center gap-2 font-medium"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Search Drawer */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-4 py-2.5 bg-[#0A0F1D] border-t border-[#00F2FE]/25">
          <div className="relative">
            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Tìm đồ chơi Rider, đai DX, CSM..."
              className="w-full bg-[#121214] border border-[#00F2FE]/50 py-2 pl-9 pr-8 text-xs text-[#E0F7FA] placeholder-slate-400 focus:outline-none focus:shadow-[0_0_12px_rgba(0,242,254,0.5)] rounded-full"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#00F2FE] text-xs"></i>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {showSuggestions && filteredProducts.length > 0 && (
            <div className="mt-2 bg-[#0A0F1D] border border-[#00F2FE]/50 shadow-xl overflow-hidden divide-y divide-slate-800 max-h-60 overflow-y-auto">
              {filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    setShowSuggestions(false);
                    setIsMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-2.5 p-2.5 hover:bg-[#121214] cursor-pointer"
                >
                  <img src={p.images[0]} alt={p.name} className="w-9 h-9 object-contain p-0.5 rounded-lg bg-[#050814] border border-[#00F2FE]/30" onError={(e) => { e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'; }} />
                  <div className="flex-grow min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{p.name}</h5>
                    <p className="text-[10px] text-[#00F2FE]">{p.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Links Ribbon with Angular Cuts and Aqua Neon Glow on Active */}
      <nav className="border-t border-[#00F2FE]/25 bg-[#0A0F1D] overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 sm:gap-2 py-2 text-xs font-semibold whitespace-nowrap">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                }}
                className={`px-3 py-1.5 transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer rounded-full ${
                  isActive
                    ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.4)] font-bold'
                    : 'highlight' in link && link.highlight
                    ? 'bg-[#121214] text-[#05FFD2] border border-[#05FFD2]/40 hover:bg-[#121214]/80'
                    : 'text-[#E0F7FA]/80 hover:text-white hover:bg-[#121214] border border-transparent hover:border-[#00F2FE]/30'
                }`}
              >
                <i className={`fa-solid ${link.icon} text-[11px] ${isActive ? 'text-[#00F2FE]' : 'text-slate-400'}`}></i>
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-slate-950 text-[9px] font-black px-1.5 py-0.2 uppercase ml-0.5 bg-[#FFD700] shadow-[0_0_6px_#FFD700]">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
