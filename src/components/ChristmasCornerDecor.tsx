import React from 'react';
import { NeonTreeIcon, NeonReindeerIcon, NeonSnowflakeIcon, NeonStarIcon, NeonGiftIcon } from './NeonAquaChristmasIcons';

export const ChristmasCornerDecor: React.FC = () => {
  return (
    <div className="pointer-events-none select-none z-30 fixed top-24 right-2 sm:right-5 hidden md:block">
      {/* Delicate floating holiday garland with Angular Sci-Fi Glass styling & Line-Art icons */}
      <div 
        className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#0A0F1D]/85 border border-[#00F2FE]/45 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(0,242,254,0.3)] text-xs text-[#E0F7FA]"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
        }}
      >
        <NeonTreeIcon size={16} glow={true} />
        <span className="text-[11px] font-black tracking-widest text-[#00F2FE] font-mono drop-shadow-[0_0_8px_rgba(0,242,254,0.7)]">
          NOEL 2026
        </span>
        <span className="text-slate-600">·</span>
        <NeonReindeerIcon size={15} />
        <NeonSnowflakeIcon size={14} />
        <NeonStarIcon size={13} />
        <NeonGiftIcon size={14} />
      </div>
    </div>
  );
};
