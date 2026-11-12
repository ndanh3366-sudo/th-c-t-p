import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../utils/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Reconnected Toast
  if (showReconnectedToast && isOnline) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-bounce">
        <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-900/95 to-[#0b1b17]/95 border border-emerald-400/80 px-4 py-2.5 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-emerald-300 font-extrabold uppercase tracking-wide">Đã Khôi Phục Kết Nối Internet</span>
            <span className="text-[11px] text-emerald-100 font-normal">Hệ thống NPTSTORE đã đồng bộ thời gian thực!</span>
          </div>
        </div>
      </div>
    );
  }

  // Offline Sticky HUD Banner
  if (!isOnline) {
    return (
      <div className="fixed bottom-20 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-fade-in">
        <div className="rounded-2xl bg-[#0e1628]/95 border border-amber-400/80 p-3.5 shadow-[0_0_30px_rgba(245,158,11,0.35)] backdrop-blur-xl flex items-start gap-3 text-xs text-white">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
            <i className="fa-solid fa-wifi-slash text-sm"></i>
          </div>
          <div className="flex-grow space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                Chế Độ Ngoại Tuyến (Offline Mode)
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                PWA Caching
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Đang mất kết nối internet nhưng anh em yên tâm! Toàn bộ kho hàng, giỏ hàng và lịch sử đơn đều đã lưu sẵn trên máy, lướt và xem thoải mái nhé.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px]">
              <span className="text-cyan-300 font-medium flex items-center gap-1">
                <i className="fa-solid fa-database text-[10px]"></i> Bộ nhớ đệm: Đầy đủ
              </span>
              <button
                onClick={() => window.location.reload()}
                className="text-amber-300 hover:text-white underline font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <i className="fa-solid fa-rotate text-[10px]"></i> Thử tải lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
