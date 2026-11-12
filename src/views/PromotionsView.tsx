import React, { useState } from 'react';
import { Coupon, User } from '../types';

interface PromotionsViewProps {
  coupons: Coupon[];
  currentUser: User | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PromotionsView: React.FC<PromotionsViewProps> = ({ coupons, currentUser, showToast }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`🎟️ Đã sao chép mã voucher: ${code}`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const referralLink = currentUser 
    ? `https://nptteamstore.vn/ref/${currentUser.referralCode}`
    : 'https://nptteamstore.vn/ref/RIDER2026';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    showToast('🔗 Đã sao chép liên kết giới thiệu! Nhận 200 Rider Points khi bạn bè mua đơn đầu.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-[#F5F2EB]">
      {/* Header */}
      <div className="border-b border-cyan-500/25 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs uppercase font-extrabold text-cyan-300 tracking-widest">SIÊU ƯU ĐÃI COLLECTOR</span>
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-white text-pop">
          Ưu Đãi & <span className="aqua-gradient-text">KHO VOUCHER KAMEN RIDER</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Lưu mã giảm giá mua đai DX, CSM, mô hình S.H.Figuarts và chương trình mời bạn bè nhận Rider Points
        </p>
      </div>

      {/* Referral Program Banner */}
      <div className="bg-gradient-to-r from-[#070e20] via-[#0b1736] to-[#070e20] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="lg:col-span-8 space-y-2 relative z-10">
          <span className="inline-block bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            🤝 Giới Thiệu Bạn Bè - Cùng Nhận Quà
          </span>
          <h3 className="font-serif-title text-xl sm:text-2xl font-black text-white text-pop">
            Lan Tỏa Đam Mê Tokusatsu — Tặng 200 Rider Points
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Mỗi khi bạn bè sử dụng liên kết của bạn đặt mua đơn đai biến hình đầu tiên, bạn nhận ngay 200 Rider Points và người bạn đó nhận voucher giảm trực tiếp 100.000đ!
          </p>
        </div>

        <div className="lg:col-span-4 space-y-3 bg-[#050914] p-4 rounded-2xl border border-cyan-500/30 relative z-10">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Liên kết giới thiệu của bạn
          </span>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              className="w-full bg-[#080e22] border border-cyan-500/35 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono truncate"
            />
            <button 
              onClick={handleCopyReferral}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-xl whitespace-nowrap hover:brightness-110 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              Sao Chép
            </button>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <h3 className="font-serif-title text-xl font-bold text-white flex items-center gap-2">
            <span>Mã Giảm Giá Đang Khả Dụng</span>
            <span className="text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full">
              {coupons.length} mã
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map((c) => (
            <div 
              key={c.code}
              className="bg-[#080e1e] border border-cyan-500/35 hover:border-cyan-400 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-cyan-500/20 border border-cyan-400/50 text-[#00f5d4] text-[10px] font-black px-2.5 py-0.5 rounded-lg font-mono">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">HSD: {c.expiry}</span>
                </div>

                <h4 className="font-bold text-sm text-white">{c.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{c.description}</p>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Đơn từ {(c.minOrder / 1000000).toFixed(1)}M</span>
                <button 
                  onClick={() => handleCopyCode(c.code)}
                  className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition cursor-pointer ${
                    copiedCode === c.code
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 border border-cyan-400/50'
                  }`}
                >
                  {copiedCode === c.code ? '✓ Đã Lưu' : 'Lưu Mã'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
