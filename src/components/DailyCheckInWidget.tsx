import React, { useState } from 'react';
import { Product, User } from '../types';
import { playHenshinSound, playFanfareSound } from '../utils/sound';

interface DailyCheckInWidgetProps {
  products?: Product[];
  onSelectProduct?: (p: Product) => void;
  currentUser: User | null;
  onUpdateUserPoints?: (points: number) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DailyCheckInWidget: React.FC<DailyCheckInWidgetProps> = ({
  currentUser: _currentUser,
  onUpdateUserPoints,
  showToast
}) => {
  const [hasCheckedInToday, setHasCheckedInToday] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      return localStorage.getItem('npt_last_checkin') === today;
    } catch {
      return false;
    }
  });

  const handleCheckIn = () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem('npt_last_checkin', today);
    } catch {}
    setHasCheckedInToday(true);
    playFanfareSound();
    playHenshinSound();

    if (onUpdateUserPoints) {
      onUpdateUserPoints(100);
    }
    showToast('🎉 ĐIỂM DANH THÀNH CÔNG! Bạn nhận được +100 Rider Points hôm nay!', 'success');
  };

  return (
    <>
      {/* Dynamic Daily Check-In Bonus Widget */}
      {!hasCheckedInToday && (
        <div className="fixed bottom-5 right-20 z-40 animate-bounce hidden sm:flex">
          <button
            onClick={handleCheckIn}
            className="px-4 py-2 bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FF9100] text-slate-950 font-black text-xs rounded-full shadow-[0_0_25px_rgba(255,215,0,0.7)] hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer border border-white/40"
            title="Điểm danh mỗi ngày nhận +100 Rider Points"
          >
            <i className="fa-solid fa-calendar-check text-sm text-slate-950"></i>
            <span>Điểm Danh Ngày (+100 Points)</span>
          </button>
        </div>
      )}
    </>
  );
};
