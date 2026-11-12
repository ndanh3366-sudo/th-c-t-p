import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface Prize {
  id: string;
  label: string;
  subText: string;
  type: 'points' | 'voucher';
  value?: number;
  code?: string;
  color: string;
  textColor: string;
  icon: string;
}

const PRIZES: Prize[] = [
  { id: 'p1', label: 'VOUCHER 100K', subText: 'Đơn từ 500K', type: 'voucher', code: 'RIDER100K', color: '#8B1E1E', textColor: '#FFFFFF', icon: 'fa-ticket' },
  { id: 'p2', label: '200 POINTS', subText: '+200 Điểm Thưởng', type: 'points', value: 200, color: '#1E3A8A', textColor: '#FFFFFF', icon: 'fa-bolt' },
  { id: 'p3', label: 'FREESHIP 100%', subText: 'Toàn Quốc', type: 'voucher', code: 'FREESHIP', color: '#065F46', textColor: '#FFFFFF', icon: 'fa-truck-fast' },
  { id: 'p4', label: 'MÔ HÌNH MINI', subText: 'Quà Lưu Niệm', type: 'voucher', code: 'MINIFIG', color: '#B45309', textColor: '#FFFFFF', icon: 'fa-trophy' },
  { id: 'p5', label: 'VOUCHER 500K', subText: 'Áp dụng CSM', type: 'voucher', code: 'CSM500K', color: '#581C87', textColor: '#FFFFFF', icon: 'fa-gem' },
  { id: 'p6', label: '500 POINTS', subText: '+500 Điểm VIP', type: 'points', value: 500, color: '#C9A84C', textColor: '#0A0A0A', icon: 'fa-crown' },
  { id: 'p7', label: 'VOUCHER 50K', subText: 'Đơn từ 200K', type: 'voucher', code: 'RIDER50K', color: '#9F1239', textColor: '#FFFFFF', icon: 'fa-tags' },
  { id: 'p8', label: 'VÒNG TAY RIDER', subText: 'Bản 2026', type: 'voucher', code: 'RIDERBAND', color: '#334155', textColor: '#FFFFFF', icon: 'fa-gift' },
];

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  showToast
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const storageKey = currentUser ? `nshop_wheel_last_spin_${currentUser.id}` : 'nshop_wheel_last_spin_guest';

  useEffect(() => {
    if (isOpen) {
      const today = getTodayKey();
      const lastSpin = localStorage.getItem(storageKey);
      if (lastSpin === today) {
        setHasSpunToday(true);
        const savedPrize = localStorage.getItem(`${storageKey}_prize`);
        if (savedPrize) {
          try {
            setWonPrize(JSON.parse(savedPrize));
          } catch {
            // ignore
          }
        }
      } else {
        setHasSpunToday(false);
        setWonPrize(null);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const numSlices = PRIZES.length;
  const sliceAngle = 360 / numSlices;

  const handleSpin = () => {
    if (isSpinning) return;

    if (hasSpunToday) {
      showToast('⚠️ Bạn đã dùng hết 1 lượt quay cho hôm nay! Vui lòng quay lại vào ngày mai.', 'info');
      return;
    }

    setIsSpinning(true);
    setWonPrize(null);

    // Random winner index 0..7
    const prizeIndex = Math.floor(Math.random() * numSlices);
    const extraTurns = (6 + Math.floor(Math.random() * 4)) * 360;
    
    // Pointer is at 12 o'clock (-90° / 270°).
    // Segment i center is at i * sliceAngle + sliceAngle / 2.
    const targetDegree = extraTurns + (360 * 10 - (prizeIndex * sliceAngle + sliceAngle / 2));

    setRotation(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = PRIZES[prizeIndex];
      setWonPrize(prize);

      // Lock wheel for today
      const today = getTodayKey();
      localStorage.setItem(storageKey, today);
      localStorage.setItem(`${storageKey}_prize`, JSON.stringify(prize));
      setHasSpunToday(true);

      if (prize.type === 'points' && currentUser) {
        currentUser.riderPoints = (currentUser.riderPoints || 0) + (prize.value || 0);
        showToast(`🎉 Bạn đã quay trúng +${prize.value} Rider Points! Đã hết lượt quay hôm nay.`, 'success');
      } else if (prize.type === 'voucher') {
        showToast(`🎟️ Bạn nhận được quà [${prize.label}]! Mã: ${prize.code} (Hết lượt quay hôm nay)`, 'success');
      }
    }, 4500);
  };

  // SVG Helper variables
  const size = 340;
  const center = size / 2;
  const outerR = 158;
  const innerR = 38;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#101010] border border-[#C9A84C]/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(201,168,76,0.25)] text-[#F5F2EB] laser-scan-line">
        
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B1E1E] via-[#C9A84C] to-[#8B1E1E]"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C] hover:bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white transition z-20 shadow-md disabled:opacity-30"
        >
          <i className="fa-solid fa-xmark text-base"></i>
        </button>

        {/* Header Title */}
        <div className="text-center space-y-1.5 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-[11px] uppercase font-black tracking-widest shadow-sm">
            <i className="fa-solid fa-crown text-[#C9A84C]"></i>
            VÒNG QUAY NSHOP KAMEN RIDER 2026
          </div>
          <h3 className="font-serif-title text-2xl sm:text-3xl font-black uppercase tracking-tight">
            QUAY LÀ <span className="gold-gradient-text">TRÚNG QUÀ VIP!</span>
          </h3>
          <p className="text-xs text-gray-400">Tặng Voucher giảm giá & Rider Points độc quyền cho Collector</p>
        </div>

        {/* Daily Limit Locked Banner */}
        {hasSpunToday && !isSpinning && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#231515] border border-[#8B1E1E] text-center text-xs text-rose-300 flex items-center justify-center gap-2 animate-fadeIn shadow-md">
            <i className="fa-solid fa-lock text-rose-400 text-sm"></i>
            <span><strong>ĐÃ KHÓA VÒNG QUAY:</strong> Bạn đã hết lượt quay hôm nay. Vui lòng quay lại sau 24h!</span>
          </div>
        )}

        {/* Wheel Container Box */}
        <div className="relative flex items-center justify-center py-2 my-2">
          
          {/* Wheel Frame Glow LED Rings */}
          <div className="absolute w-[335px] h-[335px] sm:w-[355px] sm:h-[355px] rounded-full border-4 border-[#C9A84C]/30 bg-[#0D0D0D] shadow-[inset_0_0_30px_rgba(201,168,76,0.2)] flex items-center justify-center">
            {/* 16 Decorative LED Bulbs around border */}
            {Array.from({ length: 16 }).map((_, idx) => {
              const a = (360 / 16) * idx * (Math.PI / 180);
              const r = 168; // radius of bulb circle
              const bx = 170 + r * Math.cos(a) - 5;
              const by = 170 + r * Math.sin(a) - 5;
              return (
                <div
                  key={idx}
                  className={`absolute w-2.5 h-2.5 rounded-full border border-yellow-200 transition-all ${
                    idx % 2 === 0 
                      ? 'bg-[#C9A84C] shadow-[0_0_8px_#C9A84C] animate-pulse' 
                      : 'bg-[#8B1E1E] shadow-[0_0_8px_#8B1E1E]'
                  }`}
                  style={{ left: `${bx}px`, top: `${by}px` }}
                ></div>
              );
            })}
          </div>

          {/* Top Pointer Arrow Needle */}
          <div className="absolute -top-3 z-30 flex flex-col items-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <div className="w-8 h-10 bg-gradient-to-b from-[#FFF0BB] via-[#C9A84C] to-[#8B1E1E] clip-polygon-needle border-t-2 border-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-rose-600 rounded-full border border-white shadow-md animate-ping"></div>
            </div>
            <div className="w-4 h-2 bg-[#8B1E1E] rounded-b-md"></div>
          </div>

          {/* Rotating SVG Wheel */}
          <div 
            className="w-[310px] h-[310px] sm:w-[330px] sm:h-[330px] rounded-full border-4 border-[#C9A84C] shadow-[0_0_25px_rgba(201,168,76,0.5)] relative overflow-hidden transition-transform ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '4500ms' : '0ms',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.85, 0.35, 1)'
            }}
          >
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full select-none">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.8"/>
                </filter>
                <radialGradient id="goldHubGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF2C6" />
                  <stop offset="50%" stopColor="#C9A84C" />
                  <stop offset="100%" stopColor="#6A531C" />
                </radialGradient>
              </defs>

              {PRIZES.map((p, idx) => {
                const startDeg = idx * sliceAngle - 90;
                const endDeg = (idx + 1) * sliceAngle - 90;
                const midDeg = startDeg + sliceAngle / 2;

                const startRad = (startDeg * Math.PI) / 180;
                const endRad = (endDeg * Math.PI) / 180;
                const midRad = (midDeg * Math.PI) / 180;

                // Path coordinates
                const x1 = center + outerR * Math.cos(startRad);
                const y1 = center + outerR * Math.sin(startRad);
                const x2 = center + outerR * Math.cos(endRad);
                const y2 = center + outerR * Math.sin(endRad);

                const ix1 = center + innerR * Math.cos(endRad);
                const iy1 = center + innerR * Math.sin(endRad);
                const ix2 = center + innerR * Math.cos(startRad);
                const iy2 = center + innerR * Math.sin(startRad);

                const pathData = `
                  M ${x1} ${y1}
                  A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}
                  L ${ix1} ${iy1}
                  A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2}
                  Z
                `;

                // Label position
                const textR = outerR * 0.65;
                const tx = center + textR * Math.cos(midRad);
                const ty = center + textR * Math.sin(midRad);

                // Text rotation angle
                const textRot = midDeg + 90;

                return (
                  <g key={p.id}>
                    {/* Slice Shape */}
                    <path
                      d={pathData}
                      fill={p.color}
                      stroke="#C9A84C"
                      strokeWidth="1.5"
                    />

                    {/* Radial Dividing Lines */}
                    <line
                      x1={center}
                      y1={center}
                      x2={x1}
                      y2={y1}
                      stroke="#FFE899"
                      strokeWidth="1"
                      strokeOpacity="0.4"
                    />

                    {/* Label Text Group */}
                    <g transform={`translate(${tx}, ${ty}) rotate(${textRot})`}>
                      <text
                        x="0"
                        y="-4"
                        fill={p.textColor}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-sans font-black text-[10px] sm:text-[11px] tracking-tight uppercase"
                        filter="url(#shadow)"
                      >
                        {p.label}
                      </text>
                      <text
                        x="0"
                        y="8"
                        fill={p.textColor === '#0A0A0A' ? '#1A1A1A' : '#FDE68A'}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-mono font-bold text-[8px] tracking-tighter"
                      >
                        {p.subText}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Center Decorative Ring */}
              <circle cx={center} cy={center} r={innerR} fill="url(#goldHubGrad)" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>

          {/* Center Wheel Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || hasSpunToday}
            className={`absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 text-center flex flex-col items-center justify-center leading-tight transition cursor-pointer ${
              hasSpunToday 
                ? 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-black text-rose-400 border-rose-500/80 shadow-[0_0_15px_rgba(225,29,72,0.3)] cursor-not-allowed opacity-95' 
                : 'bg-gradient-to-br from-[#FFF0BB] via-[#C9A84C] to-[#8B1E1E] border-white text-[#0A0A0A] shadow-[0_0_20px_rgba(201,168,76,0.8)] hover:scale-108 active:scale-95 group'
            }`}
          >
            {hasSpunToday ? (
              <>
                <i className="fa-solid fa-lock text-xs text-rose-400 mb-0.5 animate-pulse"></i>
                <span className="font-extrabold text-[9px] sm:text-[10px] text-rose-300 uppercase tracking-tighter">HẾT LƯỢT</span>
              </>
            ) : (
              <>
                <span className="font-extrabold text-[11px] sm:text-xs text-black group-hover:text-white transition">
                  {isSpinning ? 'QUAY...' : 'QUAY!'}
                </span>
                <i className="fa-solid fa-rotate text-[10px] text-amber-900 group-hover:rotate-180 transition duration-500 mt-0.5"></i>
              </>
            )}
          </button>
        </div>

        {/* Won Prize Announcement Banner */}
        {wonPrize && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#1A1A1A] via-[#8B1E1E]/30 to-[#1A1A1A] border-2 border-[#C9A84C] text-center space-y-1 animate-bounce shadow-2xl">
            <p className="text-xs text-[#C9A84C] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <i className="fa-solid fa-gift text-amber-400"></i> CHÚC MỪNG BẠN TRÚNG THƯỞNG:
            </p>
            <h4 className="text-lg sm:text-xl font-serif-title font-black text-white uppercase text-shadow-gold">
              {wonPrize.label} ({wonPrize.subText})
            </h4>
            {wonPrize.code && (
              <p className="text-xs font-mono font-bold text-amber-300">
                Mã ưu đãi: <span className="bg-[#0A0A0A] px-2 py-0.5 rounded border border-amber-500/50 text-white select-all">{wonPrize.code}</span>
              </p>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-[#2A2A2A] text-[10px] text-gray-400 flex items-center justify-between">
          <span><i className="fa-solid fa-circle-info text-[#C9A84C]"></i> 1 lượt quay miễn phí / 24h</span>
          <span className="text-gray-300 font-semibold">Cộng quà tự động vào tài khoản</span>
        </div>

      </div>
    </div>
  );
};
