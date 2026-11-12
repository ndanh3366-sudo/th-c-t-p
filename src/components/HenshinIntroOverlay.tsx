import React, { useState, useEffect } from 'react';
import { playMouseClickSound, isGlobalSoundMuted, toggleGlobalSound } from '../utils/sound';

interface HenshinIntroOverlayProps {
  onComplete: () => void;
}

export const HenshinIntroOverlay: React.FC<HenshinIntroOverlayProps> = ({ onComplete }) => {
  const [isEntering, setIsEntering] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isGlobalSoundMuted());

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleGlobalSound();
    setSoundMuted(next);
  };

  const handleEnterApp = () => {
    if (isEntering) return;
    setIsEntering(true);
    playMouseClickSound();

    setTimeout(() => {
      onComplete();
    }, 300);
  };

  // Keyboard shortcut: Enter, Space or Escape to enter immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleEnterApp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEntering]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#070c18] select-none overflow-hidden font-sans transition-opacity duration-300 ${
        isEntering ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Subtle Gradient & Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(6, 182, 212, 0.25) 0%, transparent 65%),
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px'
        }}
      />

      {/* Soft Ambient Glows */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Controls */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Bandai Japan Official Store</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-2 transition cursor-pointer backdrop-blur-md"
            title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            <span>{soundMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{soundMuted ? 'Âm thanh: Tắt' : 'Âm thanh: Bật'}</span>
          </button>

          <button
            onClick={handleEnterApp}
            className="px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer backdrop-blur-md"
            title="Bỏ qua và vào ngay"
          >
            Bỏ qua ❯
          </button>
        </div>
      </div>

      {/* Center Welcome Card */}
      <div className="relative z-10 max-w-lg w-full mx-4 flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-[#0b1329]/80 border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
        {/* Brand Logo */}
        <div className="relative mb-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#0c1938] to-[#081024] p-3 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex items-center justify-center">
            <img 
              src="/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png" 
              alt="NPTTEAMSTORE Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Store Title & Description */}
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            NPT<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">TEAM</span>STORE
          </h1>
          <p className="text-xs sm:text-sm text-cyan-300/90 font-medium">
            Cửa hàng mô hình & đồ chơi Bandai Japan chính hãng
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
            Chuyên cung cấp đai biến hình DX, CSM, S.H.Figuarts, phụ kiện sưu tầm và sàn đấu giá trực tuyến.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 w-full mb-7 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex flex-col items-center gap-1">
            <span className="text-sm">🛡️</span>
            <span className="text-[11px] font-semibold">100% Chính Hãng</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex flex-col items-center gap-1">
            <span className="text-sm">🚚</span>
            <span className="text-[11px] font-semibold">Giao Toàn Quốc</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex flex-col items-center gap-1">
            <span className="text-sm">⭐️</span>
            <span className="text-[11px] font-semibold">Bảo Hành Uy Tín</span>
          </div>
        </div>

        {/* Simple Normal Action Button */}
        <div className="w-full max-w-xs space-y-2.5">
          <button
            onClick={handleEnterApp}
            disabled={isEntering}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-102 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Vào Cửa Hàng</span>
            <span className="transition-transform group-hover:translate-x-1">➔</span>
          </button>

          <p className="text-[11px] text-slate-500">
            Nhấn <strong className="text-slate-400 font-mono">ENTER</strong> hoặc click để vào ngay
          </p>
        </div>
      </div>
    </div>
  );
};
