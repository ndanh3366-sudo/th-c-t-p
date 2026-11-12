import React, { useState, useEffect } from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { ProductCard } from '../components/ProductCard';
import { PosterCard } from '../components/PosterCard';
import { PosterDetailModal } from '../components/PosterDetailModal';

import { POSTER_ITEMS, PosterItem, posterToProduct } from '../data/posters';
import { Product, BlogPost } from '../types';
import { NeonTreeIcon, NeonSnowflakeIcon, NeonStarIcon, NeonGiftIcon, NeonReindeerIcon } from '../components/NeonAquaChristmasIcons';
import { useRealTime, getActiveFlashSaleCountdown, getRemainingToSlot } from '../utils/useRealTime';
import { subscribeToLiveState } from '../services/realtimeSync';

interface HomeViewProps {
  products: Product[];
  blogs: BlogPost[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
  setActiveTab: (tab: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  wishlistIds?: string[];
  onToggleFavorite?: (p: Product, e?: React.MouseEvent) => void;
  onAddToCompare?: (p: Product, e?: React.MouseEvent) => void;
  onSelectBlog?: (b: BlogPost) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  blogs,
  onSelectProduct,
  onAddToCart,
  setActiveTab,
  showToast,
  wishlistIds = [],
  onToggleFavorite,
  onAddToCompare,
  onSelectBlog
}) => {
  const [selectedFilter, setSelectedTabFilter] = useState<'all' | 'dx-belt' | 'csm' | 'shf' | 'shf-premium' | 'weapon' | 'super-sentai' | 'item-card'>('all');
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);
  
  // Real-time ticking synchronized with user's clock
  const { timeString } = useRealTime();
  const activeCountdown = getActiveFlashSaleCountdown();
  const currentActiveSlot = (['00:00', '09:00', '12:00', '18:00', '21:00'].includes(activeCountdown.currentSlot) 
    ? activeCountdown.currentSlot 
    : '00:00') as '00:00' | '09:00' | '12:00' | '18:00' | '21:00';

  const [selectedSlotOverride, setSelectedSlotOverride] = useState<'00:00' | '09:00' | '12:00' | '18:00' | '21:00' | null>(null);
  const flashSaleSlot = selectedSlotOverride || currentActiveSlot;
  const [remindedSlots, setRemindedSlots] = useState<string[]>([]);

  // Dynamic countdown calculation
  const countdownDisplay = React.useMemo(() => {
    if (flashSaleSlot === currentActiveSlot) {
      return {
        label: 'Kết thúc sau:',
        value: activeCountdown.countdownString,
        isLive: true
      };
    }
    const slotHour = parseInt(flashSaleSlot.split(':')[0], 10);
    const rem = getRemainingToSlot(slotHour);
    return {
      label: 'Bắt đầu sau:',
      value: `${rem.hours} : ${rem.minutes} : ${rem.seconds}`,
      isLive: false
    };
  }, [flashSaleSlot, currentActiveSlot, activeCountdown.countdownString]);

  // Categorized product groups
  const flashSaleItems = products.filter(p => p.isFlashSale).slice(0, 4);
  const dxProducts = products.filter(p => p.category === 'dx-belt');
  const shfProducts = products.filter(p => p.category === 'shf');
  const shfPremiumProducts = products.filter(p => p.category === 'shf-premium' || p.category === 'shf-pbandai');
  const weaponProducts = products.filter(p => p.category === 'weapon' || p.category === 'cosplay');
  const sentaiProducts = products.filter(p => p.category === 'super-sentai' || p.category === 'sentai');
  const itemProducts = products.filter(p => p.category === 'item-card' || p.category === 'item-cards' || p.category === 'item');

  // Filtered products for tabbed showcase
  const showcaseProducts = products.filter(p => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'dx-belt') return p.category === 'dx-belt';
    if (selectedFilter === 'shf') return p.category === 'shf';
    if (selectedFilter === 'shf-premium') return p.category === 'shf-premium' || p.category === 'shf-pbandai';
    if (selectedFilter === 'weapon') return p.category === 'weapon' || p.category === 'cosplay';
    if (selectedFilter === 'super-sentai') return p.category === 'super-sentai' || p.category === 'sentai';
    if (selectedFilter === 'item-card') return p.category === 'item-card' || p.category === 'item-cards' || p.category === 'item';
    return true;
  }).slice(0, 8);

  const categories = [
    { 
      id: 'shf', 
      filterId: 'shf' as const,
      name: 'SHF Standard', 
      desc: 'Mô hình 1/12 nguyên mẫu',
      logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png', 
      count: shfProducts.length
    },
    { 
      id: 'shf-premium', 
      filterId: 'shf-premium' as const,
      name: 'SHF Premium', 
      desc: 'Bản giới hạn P-Bandai',
      logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_kiva_logo_by_driftingcar_dg7tj5z-pre.png', 
      count: shfPremiumProducts.length
    },
    { 
      id: 'dx-belt', 
      filterId: 'dx-belt' as const,
      name: 'DX Belt & Driver', 
      desc: 'Đai biến hình LED & Voice',
      logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png', 
      count: dxProducts.length
    },
    { 
      id: 'super-sentai', 
      filterId: 'super-sentai' as const,
      name: 'Super Sentai', 
      desc: 'Robot Mecha & SMP Bandai',
      logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_saber_logo_by_driftingcar_dgh9vay-pre.png', 
      count: sentaiProducts.length
    },
    { 
      id: 'weapon', 
      filterId: 'weapon' as const,
      name: 'Vũ Khí Chiến Đấu', 
      desc: 'Súng kiếm Rider tỷ lệ 1:1',
      logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_knight_logo_by_driftingcar_dg73k3x-414w-2x.png', 
      count: weaponProducts.length
    },
    { 
      id: 'item-card', 
      filterId: 'item-card' as const,
      name: 'Thẻ Bài & Item', 
      desc: 'Ride Chemy, Capsem sưu tầm',
      logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_femme_logo_by_driftingcar_dg73lkh-pre.png', 
      count: itemProducts.length
    }
  ];

  // Dynamic Live State Sync (Cloud Firestore across all Vercel clients)
  const [isRoomLive, setIsRoomLive] = useState<boolean>(false);
  useEffect(() => {
    const unsubscribe = subscribeToLiveState((state) => {
      if (typeof state?.isLive === 'boolean') {
        setIsRoomLive(state.isLive);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Hero Slider Banner */}
      <HeroSlider />

      {/* 🔴 LIVE STREAM BANNER PROMO */}
      <div 
        onClick={() => setActiveTab('livestream')}
        className={`bg-gradient-to-r from-[#0A0F1D] via-[#071328] to-[#0A0F1D] border-2 ${
          isRoomLive ? 'border-[#00F2FE] shadow-[0_0_30px_rgba(0,242,254,0.3)]' : 'border-slate-700 shadow-md'
        } p-4 sm:p-5 rounded-2xl hover:shadow-[0_0_45px_rgba(0,242,254,0.6)] transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 group`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className={`w-14 h-14 rounded-2xl ${isRoomLive ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-500' : 'bg-slate-900 border-2 border-slate-700 text-slate-500'} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition`}>
              <i className={`fa-solid fa-tower-cell ${isRoomLive ? 'animate-pulse' : ''}`}></i>
            </div>
            {isRoomLive && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border border-black"></span>
              </span>
            )}
          </div>
          <div className="text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className={`${isRoomLive ? 'bg-rose-600 text-white shadow-[0_0_10px_#f43f5e]' : 'bg-slate-800 text-slate-400'} font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-widest`}>
                {isRoomLive ? '🔴 TRỰC TIẾP HÔM NAY' : '🔴 TRẠNG THÁI PHÒNG LIVE'}
              </span>
              {isRoomLive && <span className="text-xs text-[#00F2FE] font-bold">248 Người đang xem</span>}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00F2FE] transition truncate">
              {isRoomLive
                ? 'LỄ RA MẮT SIÊU PHẨM DX & CSM KAMEN RIDER 2026 - SHOWROOM NPTTEAMSTORE'
                : 'HIỆN KHÔNG CÓ PHÒNG LIVE'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {isRoomLive
                ? 'Host: Quản lý Danh Nguyễn • Khử tạp âm AI • Ghim sản phẩm giảm 250k trực tiếp trên Live!'
                : 'Quản lý Showroom NPTTEAMSTORE hiện chưa phát sóng trực tiếp. Bấm vào đây để kiểm tra phòng Live!'}
            </p>
          </div>
        </div>

        <button 
          className="bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] hover:brightness-110 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,242,254,0.5)] transition shrink-0 cursor-pointer flex items-center gap-2 group-hover:scale-105"
        >
          <i className="fa-solid fa-[#0A0F1D] fa-circle-info"></i>
          <span>{isRoomLive ? 'XEM LIVE NGAY' : 'VÀO PHÒNG LIVE'}</span>
        </button>
      </div>

      {/* Shopee Mall Trust Bar & Daily Coin Check-In */}


      {/* Cyber Aqua & Gold Noel Special Holiday Event Banner - Fusion of Rounded Corners & Angular Accents */}
      <section 
        className="relative overflow-hidden bg-gradient-to-br from-[#0A0F1D]/95 via-[#121214]/90 to-[#0A0F1D]/95 border-2 border-[#00F2FE]/45 rounded-3xl p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_30px_rgba(0,242,254,0.25)] backdrop-blur-2xl"
      >
        {/* Decorative Holiday Background Accents */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-[#00F2FE]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-44 h-44 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 text-center md:text-left">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#121214] border border-[#00F2FE]/50 text-[#00F2FE] text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,242,254,0.3)]"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
              }}
            >
              <NeonTreeIcon size={14} glow={true} />
              <span>Sự Kiện Giáng Sinh Noel 2026</span>
              <NeonSnowflakeIcon size={14} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#E0F7FA] tracking-wide font-serif-title drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]">
              MÙA LỄ HỘI RIDER & SENTAI - SĂN DEAL GIÁNG SINH AQUA
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              NPTTEAMSTORE gửi tặng toàn thể các Rider & Collector mã ưu đãi giảm 15% cho mọi đơn hàng DX Belt, CSM, S.H.Figuarts và Robot Sentai. Đóng gói hộp quà Noel bọc xốp chống sốc cao cấp!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div 
              className="bg-[#121214] border border-[#FFD700]/60 px-5 py-3 text-center shadow-[0_0_18px_rgba(255,215,0,0.3)]"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}
            >
              <div className="text-[10px] text-[#FFD700] uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <NeonStarIcon size={11} />
                <span>Mã Giảm Giá Noel 15%</span>
              </div>
              <div className="text-xl font-black font-mono text-[#FFD700] tracking-widest flex items-center justify-center gap-2 drop-shadow-[0_0_8px_#FFD700] mt-0.5">
                <span>NOEL2026</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('NOEL2026');
                    showToast('🎁 Đã sao chép mã voucher NOEL2026 (-15%)!', 'success');
                  }}
                  className="text-xs bg-[#FFD700]/20 hover:bg-[#FFD700]/30 text-[#FFD700] px-2 py-0.5 transition cursor-pointer border border-[#FFD700]/40"
                  title="Sao chép mã"
                >
                  <i className="fa-solid fa-copy"></i>
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('shop')}
              className="px-6 py-3.5 bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,242,254,0.6)] hover:shadow-[0_0_30px_rgba(5,255,210,0.9)] transition active:scale-95 flex items-center gap-2 cursor-pointer"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}
            >
              <NeonGiftIcon size={15} />
              <span>Sắm Quà Noel Ngay</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Quick Category Navigation Bar with Angular Cuts and Line-Art Styling */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00F2FE] shadow-[0_0_8px_#00F2FE] animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-bold text-[#E0F7FA] uppercase tracking-wide flex items-center gap-1.5">
              <span>Danh Mục Sản Phẩm Chính</span>
              <NeonSnowflakeIcon size={16} />
            </h2>
          </div>
          <button 
            onClick={() => setActiveTab('shop')}
            className="text-xs text-[#00F2FE] hover:text-[#05FFD2] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            Toàn bộ kho hàng <i className="fa-solid fa-angle-right text-[10px]"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => {
            const isSelected = selectedFilter === c.filterId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedTabFilter(c.filterId);
                  const el = document.getElementById('showcase-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-3 flex flex-col items-center text-center gap-2 transition-all duration-300 cursor-pointer rounded-2xl border ${
                  isSelected
                    ? 'bg-[#00F2FE]/15 border-[#00F2FE] shadow-[0_0_20px_rgba(0,242,254,0.4)] scale-102'
                    : 'bg-[#0A0F1D]/80 border-[#00F2FE]/25 hover:border-[#00F2FE]/60 hover:bg-[#121214] shadow-md hover:-translate-y-0.5'
                }`}
              >
                <div 
                  className="w-13 h-13 bg-[#121214] border-2 border-[#00F2FE]/50 p-1 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(0,242,254,0.25)] relative"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))'
                  }}
                >
                  <img 
                    src={c.logo} 
                    alt={c.name} 
                    className="max-h-full max-w-full object-contain filter drop-shadow hover:scale-105 transition duration-300" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#E0F7FA] line-clamp-1 flex items-center justify-center gap-1">
                    <span>{c.name}</span>
                  </h3>
                  <p className="text-[10px] text-[#00F2FE] font-semibold">{c.count} sản phẩm</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Shopee Flash Sale Section with Timeline Time Slots - Fusion of Rounded Corners & Angular Accents */}
      <section 
        className="bg-[#0A0F1D]/90 border border-[#00F2FE]/40 rounded-3xl p-5 sm:p-7 space-y-5 shadow-[0_10px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,242,254,0.25)] backdrop-blur-xl relative overflow-hidden"
      >
        {/* Header with Title and Countdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#00F2FE]/25 pb-3">
          <div className="flex items-center gap-2.5">
            <span 
              className="bg-[#EE4D2D] text-white font-black text-[10px] px-2.5 py-1 uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(238,77,45,0.6)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
            >
              <span>⚡ FLASH SALE</span>
              <NeonSnowflakeIcon size={12} />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#E0F7FA] flex items-center gap-1.5">
              <span>Deal Chớp Nhoáng Giáng Sinh</span>
              <NeonGiftIcon size={16} />
            </h2>
          </div>
          <div 
            className="flex items-center gap-2 bg-[#121214] border border-[#00F2FE]/40 px-3.5 py-1 text-xs font-mono shadow-inner"
            style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
          >
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">
              {countdownDisplay.label}
            </span>
            <span className="text-[#00F2FE] font-bold tracking-widest drop-shadow-[0_0_8px_rgba(0,242,254,0.7)] animate-pulse">
              {countdownDisplay.value}
            </span>
            <NeonSnowflakeIcon size={12} />
          </div>
        </div>

        {/* Shopee-style 5 Time Slots Timeline */}
        <div className="grid grid-cols-5 gap-2 border-b border-[#00F2FE]/15 pb-3">
          {[
            { time: '00:00' as const, label: currentActiveSlot === '00:00' ? 'Đang diễn ra' : 'Sắp diễn ra', isCurrentLive: currentActiveSlot === '00:00' },
            { time: '09:00' as const, label: currentActiveSlot === '09:00' ? 'Đang diễn ra' : 'Sắp diễn ra', isCurrentLive: currentActiveSlot === '09:00' },
            { time: '12:00' as const, label: currentActiveSlot === '12:00' ? 'Đang diễn ra' : 'Sắp diễn ra', isCurrentLive: currentActiveSlot === '12:00' },
            { time: '18:00' as const, label: currentActiveSlot === '18:00' ? 'Đang diễn ra' : 'Sắp diễn ra', isCurrentLive: currentActiveSlot === '18:00' },
            { time: '21:00' as const, label: currentActiveSlot === '21:00' ? 'Đang diễn ra' : 'Sắp diễn ra', isCurrentLive: currentActiveSlot === '21:00' },
          ].map((slot) => {
            const isSelected = flashSaleSlot === slot.time;
            const isReminded = remindedSlots.includes(slot.time);
            return (
              <button
                key={slot.time}
                onClick={() => setSelectedSlotOverride(slot.time)}
                className={`py-2 px-1 sm:px-3 text-center transition cursor-pointer relative ${
                  isSelected 
                    ? 'bg-[#EE4D2D]/20 border-b-2 border-[#EE4D2D] text-[#EE4D2D] shadow-[0_0_12px_rgba(238,77,45,0.3)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121214]'
                }`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
              >
                <div className={`font-mono font-black text-sm sm:text-base ${isSelected ? 'text-[#EE4D2D]' : 'text-slate-200'}`}>
                  {slot.time}
                </div>
                <div className="text-[10px] font-semibold truncate flex items-center justify-center gap-1">
                  {slot.isCurrentLive ? (
                    <span className="text-[#05FFD2] flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#05FFD2] animate-ping" />
                      <span>Đang mở</span>
                    </span>
                  ) : (
                    <span>{isReminded ? '🔔 Đã nhắc' : slot.label}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Slot Content */}
        {flashSaleSlot === currentActiveSlot ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {flashSaleItems.map(p => (
                <div key={p.id} className="relative group">
                  <ProductCard
                    product={p}
                    onSelect={onSelectProduct}
                    onAddToCart={onAddToCart}
                    onAddToCompare={onAddToCompare}
                    isFavorite={wishlistIds.includes(p.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                  {/* Shopee Flash Sale Sold Progress Bar */}
                  <div className="mt-1 px-1">
                    <div className="h-3.5 bg-[#121214] border border-[#00F2FE]/30 rounded-full overflow-hidden relative flex items-center justify-center">
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#EE4D2D] to-amber-400 rounded-full"
                        style={{ width: `${Math.min(95, ((p.soldCount || 10) % 80) + 20)}%` }}
                      />
                      <span className="relative z-10 text-[9px] font-black text-white uppercase drop-shadow">
                        🔥 ĐÃ BÁN {Math.min(95, ((p.soldCount || 10) % 80) + 20)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Upcoming Flash Sale Preview with Remind Button */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#121214] border border-[#00F2FE]/25 p-3 text-xs">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-clock text-[#00F2FE]"></i>
                <span className="text-slate-300">
                  Khung giờ <strong>{flashSaleSlot}</strong> sắp mở bán hàng loạt đai DX & CSM giá sốc từ <strong>-35% đến -50%</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  if (remindedSlots.includes(flashSaleSlot)) {
                    setRemindedSlots(prev => prev.filter(s => s !== flashSaleSlot));
                    showToast(`🔕 Đã tắt nhắc nhở cho khung giờ ${flashSaleSlot}`, 'info');
                  } else {
                    setRemindedSlots(prev => [...prev, flashSaleSlot]);
                    showToast(`🔔 Đã đặt nhắc nhở cho khung giờ Flash Sale ${flashSaleSlot}! Shop sẽ thông báo cho bạn.`, 'success');
                  }
                }}
                className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  remindedSlots.includes(flashSaleSlot)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                    : 'bg-[#EE4D2D] text-white border-[#EE4D2D] hover:brightness-110 shadow-[0_0_10px_rgba(238,77,45,0.5)]'
                }`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
              >
                <i className={`fa-solid ${remindedSlots.includes(flashSaleSlot) ? 'fa-bell-slash' : 'fa-bell'}`}></i>
                <span>{remindedSlots.includes(flashSaleSlot) ? 'Đã Đặt Nhắc Nhở' : 'Nhắc Tôi Khi Mở Bán'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
              {products.slice(4, 8).map(p => (
                <div key={p.id} className="relative opacity-85 hover:opacity-100 transition">
                  <ProductCard
                    product={{
                      ...p,
                      isFlashSale: true,
                    }}
                    onSelect={onSelectProduct}
                    onAddToCart={() => showToast(`Khung giờ ${flashSaleSlot} sắp mở bán! Vui lòng quay lại sau nhé.`, 'info')}
                    onAddToCompare={onAddToCompare}
                    isFavorite={wishlistIds.includes(p.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                  <div className="mt-1 text-center">
                    <span className="text-[10px] text-amber-300 font-bold bg-[#121214] border border-amber-400/40 px-2 py-0.5 rounded-full inline-block">
                      ⏳ Sắp Mở Bán lúc {flashSaleSlot}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. Main Product Showcase with Filter Tabs */}
      <section id="showcase-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#00F2FE]/25 pb-3">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-[#E0F7FA] flex items-center gap-2 flex-wrap">
              <span className="aqua-gradient-text uppercase">Bộ Sưu Tập Giáng Sinh Nổi Bật</span>
              <NeonTreeIcon size={18} glow={true} />
              <NeonSnowflakeIcon size={18} glow={true} />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Lựa chọn các món đồ chơi Tokusatsu chính hãng Bandai Japan mùa lễ hội Giáng Sinh 2026
            </p>
          </div>

          {/* Interactive Segmented Filter Tabs with Angular Chamfers */}
          <div 
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto p-1 bg-[#121214] border border-[#00F2FE]/35"
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'dx-belt', label: 'DX Belts' },
              { id: 'shf', label: 'S.H.Figuarts' },
              { id: 'shf-premium', label: 'SHF Premium' },
              { id: 'super-sentai', label: 'Super Sentai' },
              { id: 'weapon', label: 'Vũ Khí' },
              { id: 'item-card', label: 'Thẻ Bài' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedTabFilter(f.id as any)}
                className={`px-3 py-1.5 text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.4)] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#0A0F1D]'
                }`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-column Product Grid with larger card sizing */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {showcaseProducts.map(p => (
            <ProductCard 
              key={p.id}
              product={p}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              onAddToCompare={onAddToCompare}
              isFavorite={wishlistIds.includes(p.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('shop')}
            className="px-6 py-2.5 bg-[#0A0F1D] border border-[#00F2FE]/60 hover:bg-[#00F2FE] hover:text-[#0A0F1D] text-[#00F2FE] font-bold text-xs transition-all duration-200 inline-flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.8)] cursor-pointer"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
            }}
          >
            <span>Khám phá toàn bộ {products.length} sản phẩm trong Shop</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>
      </section>

      {/* 6. Tokusatsu Movie Posters Art Showcase - Angular Frame */}
      <section 
        className="bg-[#0A0F1D] border border-[#00F2FE]/35 p-5 space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#00F2FE]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span 
              className="w-8 h-8 bg-[#121214] border border-[#00F2FE]/50 flex items-center justify-center text-[#00F2FE] text-sm shadow-[0_0_8px_rgba(0,242,254,0.3)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
            >
              <i className="fa-solid fa-image"></i>
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#E0F7FA]">
                Bộ Sưu Tập Poster Điện Ảnh & Art Print 4K
              </h3>
              <p className="text-[10px] text-slate-400">
                In trên giấy Coucher Glossy 300gsm phủ UV chống trầy, chống phai màu
              </p>
            </div>
          </div>
          <span className="text-xs text-[#00F2FE] font-medium flex items-center gap-1">
            <NeonSnowflakeIcon size={12} />
            <span>Bấm vào poster để phóng to chi tiết</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {POSTER_ITEMS.slice(0, 4).map(poster => (
            <PosterCard
              key={poster.id}
              poster={poster}
              onSelectPoster={(p) => setSelectedPoster(p)}
              onAddToCart={onAddToCart}
              posterToProductMap={posterToProduct}
            />
          ))}
        </div>
      </section>

      {/* 7. Rider Points Membership Banner - Angular Sci-Fi Design */}
      <section 
        className="bg-gradient-to-r from-[#0A0F1D] via-[#121214] to-[#0A0F1D] border border-[#00F2FE]/45 p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center shadow-[0_12px_45px_rgba(0,0,0,0.9),0_0_20px_rgba(0,242,254,0.25)]"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
        }}
      >
        <div className="lg:col-span-8 space-y-2.5 text-center lg:text-left">
          <div 
            className="inline-flex items-center gap-1.5 bg-[#121214] border border-[#FFD700]/50 text-[#FFD700] text-[10px] font-bold px-3 py-0.5 uppercase tracking-wider shadow-[0_0_10px_rgba(255,215,0,0.3)]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
          >
            <NeonStarIcon size={12} />
            <span>Tích Điểm Đổi Quà Thẻ & Vouchers</span>
          </div>
          <h3 className="text-base sm:text-xl font-bold text-white text-pop font-serif-title">
            Chương Trình <span className="text-[#00F2FE] drop-shadow-[0_0_12px_rgba(0,242,254,0.7)] font-black">RIDER POINTS NPTTEAMSTORE</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-medium">
            Tích lũy 1 Rider Point cho mỗi 10.000đ mua hàng tại NPTTEAMSTORE. Đạt mốc Legend Rider để hưởng đặc quyền giảm 10% trọn đời và quyền ưu tiên đặt trước đai CSM giới hạn!
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-slate-300 text-[10px]">
            <span className="bg-[#121214] border border-[#00F2FE]/25 px-2.5 py-1">Novice Rider (100pt)</span>
            <span className="bg-[#121214] border border-[#00F2FE]/40 px-2.5 py-1 text-[#00F2FE]">Rider Collector (500pt)</span>
            <span className="bg-[#121214] border border-[#FFD700]/50 px-2.5 py-1 text-[#FFD700] font-bold shadow-[0_0_8px_rgba(255,215,0,0.3)]">CSM Master (2,000pt)</span>
            <span className="bg-[#00F2FE]/20 border border-[#00F2FE] text-[#00F2FE] font-bold px-2.5 py-1 shadow-[0_0_10px_rgba(0,242,254,0.4)]">Legend Rider (5,000pt)</span>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-center">
          <button 
            onClick={() => setActiveTab('promotions')}
            className="px-6 py-3 bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] hover:brightness-110 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(0,242,254,0.6)] hover:shadow-[0_0_30px_rgba(5,255,210,0.9)] transition active:scale-95 flex items-center gap-2 cursor-pointer"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
            }}
          >
            <NeonStarIcon size={14} />
            <span>Xem Chi Tiết Đặc Quyền</span>
          </button>
        </div>
      </section>

      {/* 8. Blog & News Preview with Angular Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#00F2FE]/25 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]"></span>
            <h2 className="text-base sm:text-lg font-bold text-[#E0F7FA] flex items-center gap-2">
              <span>Tin Tức Mới &</span>
              <span className="text-[#00F2FE] drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]">REVIEW SẢN PHẨM</span>
              <NeonTreeIcon size={16} />
            </h2>
          </div>
          <button 
            onClick={() => setActiveTab('blog')}
            className="text-xs text-[#00F2FE] hover:text-[#05FFD2] font-bold cursor-pointer"
          >
            Tất cả bài viết →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blogs.slice(0, 3).map((b) => (
            <div 
              key={b.id}
              onClick={() => {
                if (onSelectBlog) {
                  onSelectBlog(b);
                } else {
                  setActiveTab('blog');
                }
              }}
              className="bg-[#0A0F1D] overflow-hidden cursor-pointer group transition duration-300 flex flex-col justify-between border border-[#00F2FE]/30 hover:border-[#00F2FE] shadow-[0_8px_25px_rgba(0,0,0,0.8)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(0,242,254,0.35)]"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="aspect-video overflow-hidden bg-[#121214] relative">
                <img 
                  src={b.image} 
                  alt={b.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  onError={(e) => {
                    e.currentTarget.src = '/Tin Tức & Bài Viết Blog/thumb_hiep-si-mat-na-zeztz_4567685e.webp';
                  }}
                />
                <div 
                  className="absolute top-2 left-2 bg-[#0A0F1D]/90 border border-[#00F2FE]/50 text-[#00F2FE] text-[9px] font-bold px-2 py-0.5 uppercase shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))' }}
                >
                  {b.category}
                </div>
              </div>
              <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium mb-1">
                    {b.date} · {b.author}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#E0F7FA] group-hover:text-[#00F2FE] line-clamp-2 transition leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {b.summary}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#00F2FE]/20 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{b.readTime} đọc</span>
                  <span className="text-[#00F2FE] font-bold group-hover:translate-x-1 transition duration-200">Đọc bài →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Poster Zoom Modal */}
      {selectedPoster && (
        <PosterDetailModal
          poster={selectedPoster}
          onClose={() => setSelectedPoster(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};
