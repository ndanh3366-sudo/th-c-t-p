import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { generateCustomerAvatarSvgUrl } from '../utils/avatarGenerator';
import { NeonStarIcon, NeonSnowflakeIcon } from './NeonAquaChristmasIcons';

interface CommunityTickerProps {
  latestOrder?: Order | null;
}

interface ActivityItem {
  name: string;
  action: string;
  item: string;
  time: string;
  avatar: string;
  badge: string;
  badgeColor: string;
  isCustomAvatar?: boolean;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { 
    name: 'Hoàng Nam (TP.HCM)', 
    action: 'vừa đặt mua thành công', 
    item: 'DX Henshin Belt Zeztz Lord Invoker Bandai Japan', 
    time: '1 phút trước', 
    avatar: generateCustomerAvatarSvgUrl({ maskId: 'gavv-gummy', colorId: 'crimson-ruby', initials: 'HN' }),
    badge: 'RIDER VIP',
    badgeColor: 'bg-[#00F2FE] text-slate-950 font-black',
    isCustomAvatar: true
  },
  { 
    name: 'Minh Tuấn (Hà Nội)', 
    action: 'vừa đấu giá thành công 8.900.000đ', 
    item: 'CSM Decadriver Ver.2 Gold Plate', 
    time: '3 phút trước', 
    avatar: generateCustomerAvatarSvgUrl({ maskId: 'decade-king', colorId: 'gold-bandai', initials: 'MT' }),
    badge: 'COLLECTOR',
    badgeColor: 'bg-[#FFD700] text-slate-950 font-black',
    isCustomAvatar: true
  },
  { 
    name: 'Quốc Bảo (Đà Nẵng)', 
    action: 'vừa thanh toán đơn hàng hỏa tốc', 
    item: 'Combo DX Desire Driver + Magnum Shooter 40X', 
    time: '5 phút trước', 
    avatar: generateCustomerAvatarSvgUrl({ maskId: 'geats-fox', colorId: 'crimson-ruby', initials: 'QB' }),
    badge: 'RIDER VIP',
    badgeColor: 'bg-[#05FFD2] text-slate-950 font-black',
    isCustomAvatar: true
  },
  { 
    name: 'Tấn Phát (Cần Thơ)', 
    action: 'vừa kích hoạt e-Warranty bảo hành', 
    item: 'CSM Kaixa Driver Complete Set', 
    time: '8 phút trước', 
    avatar: generateCustomerAvatarSvgUrl({ maskId: 'saber-dragon', colorId: 'dark-purple', initials: 'TP' }),
    badge: 'MEMBER',
    badgeColor: 'bg-[#00F2FE] text-slate-950 font-black',
    isCustomAvatar: true
  },
  { 
    name: 'Đăng Khoa (Hải Phòng)', 
    action: 'vừa đặt mua thành công', 
    item: 'DX Henshin Belt Gavv Henshin Belt Set 2026', 
    time: '12 phút trước', 
    avatar: generateCustomerAvatarSvgUrl({ maskId: 'zero-one', colorId: 'cyber-cyan', initials: 'ĐK' }),
    badge: 'COLLECTOR',
    badgeColor: 'bg-[#FFD700] text-slate-950 font-black',
    isCustomAvatar: true
  }
];

export const CommunityTicker: React.FC<CommunityTickerProps> = ({ latestOrder }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [visible, setVisible] = useState(false);

  // When a new purchase occurs (every 30s), pop up the notification card in the bottom-left corner
  useEffect(() => {
    if (!latestOrder) return;

    setCurrentOrder(latestOrder);
    setVisible(true);

    // Stay visible for 14 seconds, then smoothly slide out until next 30s purchase
    const hideTimeout = setTimeout(() => {
      setVisible(false);
    }, 14000);

    return () => {
      clearTimeout(hideTimeout);
    };
  }, [latestOrder]);

  if (!currentOrder) return null;

  const firstItem = currentOrder.items[0];
  const productName = firstItem?.productName || 'Mô hình Kamen Rider Chính Hãng';
  const priceFormatted = currentOrder.total.toLocaleString('vi-VN') + 'đ';
  const avatarUrl = currentOrder.customerAvatar || generateCustomerAvatarSvgUrl({
    maskId: 'geats-fox',
    colorId: 'crimson-ruby',
    initials: currentOrder.customerName.slice(0, 2).toUpperCase(),
    customerName: currentOrder.customerName
  });

  return (
    <div 
      className={`fixed bottom-3 left-3 right-3 sm:right-auto sm:left-4 z-40 flex pointer-events-none transition-all duration-500 ease-out transform ${
        visible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div 
        className="bg-[#0A0F1D]/95 border-2 border-[#00F2FE]/70 backdrop-blur-2xl p-2.5 sm:p-3 shadow-[0_12px_45px_rgba(0,0,0,0.95),0_0_30px_rgba(0,242,254,0.45)] flex items-center gap-3 w-full sm:max-w-md pointer-events-auto rounded-2xl ring-1 ring-cyan-400/30"
      >
        {/* Customer Avatar with tight-fit cyan border */}
        <div 
          className="w-12 h-12 sm:w-13 sm:h-13 border-2 border-[#00F2FE] overflow-hidden shrink-0 bg-[#050914] relative p-0.5 shadow-[0_0_15px_rgba(0,242,254,0.5)] rounded-xl"
        >
          <img 
            src={avatarUrl} 
            alt={currentOrder.customerName} 
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png';
            }}
          />
          <span className="absolute bottom-0 right-0 text-[6px] px-1 uppercase rounded-tl bg-[#00F2FE] text-slate-950 font-black">
            RIDER VIP
          </span>
        </div>

        <div className="text-[11px] leading-tight min-w-0 flex-grow space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-200 font-medium truncate">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <strong className="text-white font-bold">{currentOrder.customerName}</strong> 
            <span className="text-[#00F2FE] font-semibold">vừa đặt mua thành công</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <p className="text-[#05FFD2] font-bold truncate text-xs flex-grow">{productName}</p>
            <span className="text-amber-400 font-mono font-black text-xs shrink-0">{priceFormatted}</span>
          </div>

          <div className="text-[9px] text-[#E0F7FA]/75 font-mono flex items-center gap-1.5 pt-0.5">
            <i className="fa-solid fa-circle-check text-[#00F2FE] text-[8px]"></i>
            <span className="text-[#00F2FE] font-bold">Chính Hãng Bandai Japan</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Vừa xong</span>
          </div>
        </div>

        <button 
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-white text-xs ml-auto shrink-0 p-1 cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition"
          title="Ẩn thông báo"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
};
