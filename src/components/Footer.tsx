import React, { useState } from 'react';
import { NeonTreeIcon, NeonSnowflakeIcon, NeonStarIcon, NeonGiftIcon, NeonReindeerIcon } from './NeonAquaChristmasIcons';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenTribute?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, showToast, onOpenTribute }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showToast(`🎉 Đã đăng ký nhận bản tin ưu đãi Kamen Rider cho email: ${newsletterEmail}`, 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-[#0A0F1D] border-t border-[#00F2FE]/30 text-slate-300 text-xs mt-16 pt-10 pb-20 md:pb-10 relative">
      {/* Top Newsletter Bar with Angular Chamfers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div 
          className="bg-[#121214] border border-[#00F2FE]/45 p-6 sm:p-7 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.2)] rounded-2xl"
        >
          <div className="space-y-1.5 text-center lg:text-left">
            <h3 className="font-serif-title text-lg sm:text-xl font-bold text-white flex items-center gap-2 justify-center lg:justify-start">
              <NeonTreeIcon size={20} glow={true} />
              <span>Đăng Ký Nhận Tin</span>
              <span className="text-[#00F2FE] drop-shadow-[0_0_10px_rgba(0,242,254,0.7)] font-black">RIDER EXCLUSIVE</span>
              <NeonSnowflakeIcon size={16} />
            </h3>
            <p className="text-xs text-slate-300 max-w-lg">
              Nhận ngay thông báo đai CSM đặt trước, sự kiện Flash Sale và tặng 100 Rider Points khi tạo tài khoản mới.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 w-full lg:w-auto max-w-md">
            <input 
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              className="w-full bg-[#0A0F1D] border border-[#00F2FE]/40 focus:border-[#00F2FE] px-4 py-2.5 text-xs text-[#E0F7FA] focus:outline-none placeholder-slate-400 font-medium focus:shadow-[0_0_15px_rgba(0,242,254,0.4)] rounded-full"
            />
            <button 
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] hover:brightness-110 text-slate-950 font-black transition duration-200 whitespace-nowrap shadow-[0_0_15px_rgba(0,242,254,0.5)] cursor-pointer rounded-full"
            >
              Đăng Ký
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#00F2FE]/20">
        {/* Brand Info */}
        <div className="space-y-4">
          <div 
            onClick={() => onOpenTribute ? onOpenTribute() : setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Bấm vào logo để xem Tri Ân Thành Viên Team NPT"
          >
            <div 
              className="w-12 h-12 bg-[#080d1a] border-2 border-[#00F2FE] rounded-2xl p-0.5 shadow-[0_0_20px_rgba(0,242,254,0.6)] group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center"
            >
              <img 
                src="/Logo & Thương Hiệu (Brand Logo)/npt_letter_logo.jpg" 
                alt="NPTTEAMSTORE NPT Letter Logo" 
                className="w-full h-full object-cover rounded-xl logo-chroma-pulse"
                onError={(e) => {
                  e.currentTarget.src = '/logo-rider.jpg';
                }}
              />
            </div>
            <div>
              <h4 className="font-serif-title text-xl font-black tracking-wider text-white uppercase group-hover:text-[#00F2FE] transition-colors">
                NPTTEAM<span className="text-[#00F2FE] drop-shadow-[0_0_10px_rgba(0,242,254,0.8)]">STORE</span>
              </h4>
              <p className="text-[10px] text-[#00F2FE] tracking-wider uppercase font-extrabold flex items-center gap-1">
                <span>昭和 · 平成 · 令和 · Bandai Official</span>
                <NeonStarIcon size={10} />
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Nơi lưu giữ ký ức tuổi thơ & ngọn lửa đam mê Kamen Rider qua 4 kỷ nguyên Showa - Heisei - Reiwa. Cam kết 100% New Seal chính hãng Bandai Japan, bảo hành 1-đổi-1 toàn quốc.
          </p>

          {/* Social Platform Badges */}
          <div className="space-y-2 pt-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kênh Truyền Thông & Gian Hàng:</p>
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-3 py-2 bg-[#121214] border border-[#00F2FE]/30 hover:border-[#00F2FE] hover:text-[#00F2FE] transition duration-200 group rounded-lg"
              >
                <i className="fa-brands fa-facebook text-base text-[#00F2FE]"></i>
                <span className="text-[11px] font-bold text-[#E0F7FA]">Facebook</span>
              </a>

              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-3 py-2 bg-[#121214] border border-rose-500/40 hover:border-rose-400 text-rose-400 transition duration-200 group rounded-lg"
              >
                <i className="fa-brands fa-youtube text-base"></i>
                <span className="text-[11px] font-bold text-[#E0F7FA]">YouTube</span>
              </a>

              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-3 py-2 bg-[#121214] border border-indigo-500/40 hover:border-indigo-400 text-indigo-400 transition duration-200 group rounded-lg"
              >
                <i className="fa-brands fa-discord text-base"></i>
                <span className="text-[11px] font-bold text-[#E0F7FA]">Discord</span>
              </a>

              <a 
                href="https://nptteamstore.vn" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-3 py-2 bg-[#121214] border border-[#00F2FE]/40 hover:border-[#00F2FE] text-[#00F2FE] transition duration-200 group rounded-lg"
              >
                <i className="fa-solid fa-store text-base"></i>
                <span className="text-[11px] font-bold text-[#E0F7FA]">NPT Store</span>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-bold text-[#E0F7FA] uppercase tracking-wider text-xs border-l-2 border-[#00F2FE] pl-2.5 flex items-center gap-1.5">
            <span>Danh Mục Nổi Bật</span>
            <NeonSnowflakeIcon size={12} />
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button 
                onClick={() => setActiveTab('feedback')} 
                className="hover:text-[#00F2FE] transition cursor-pointer text-[#FFD700] font-black flex items-center gap-1.5"
              >
                <i className="fa-solid fa-award text-xs text-[#FFD700]"></i>
                <span>Vinh Danh & Nhận Xét Khách Hàng</span>
              </button>
            </li>
            <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#00F2FE] transition cursor-pointer">Đai biến hình Henshin Belt DX</button></li>
            <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#00F2FE] transition cursor-pointer">Dòng CSM Complete Selection</button></li>
            <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#00F2FE] transition cursor-pointer">Mô hình S.H.Figuarts (SHF)</button></li>
            <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#00F2FE] transition cursor-pointer">Vũ khí & Ride Chemy Cards</button></li>
            <li><button onClick={() => setActiveTab('auction')} className="hover:text-[#00F2FE] transition cursor-pointer">Đấu giá hàng hiếm (Collector Auction)</button></li>
            <li><button onClick={() => setActiveTab('quiz')} className="hover:text-[#00F2FE] transition cursor-pointer">Trắc nghiệm: Bạn là Kamen Rider nào?</button></li>
          </ul>
        </div>

        {/* Support & Policies */}
        <div className="space-y-3">
          <h4 className="font-bold text-[#E0F7FA] uppercase tracking-wider text-xs border-l-2 border-[#00F2FE] pl-2.5 flex items-center gap-1.5">
            <span>Chính Sách & Hỗ Trợ</span>
            <NeonStarIcon size={12} />
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button 
                onClick={() => setActiveTab('feedback')} 
                className="hover:text-[#05FFD2] transition cursor-pointer text-[#00F2FE] font-bold flex items-center gap-1.5"
              >
                <i className="fa-solid fa-comments text-xs text-[#00F2FE]"></i>
                <span>Gửi Nhận Xét & Đánh Giá Store</span>
              </button>
            </li>
            <li><button onClick={() => setActiveTab('warranty')} className="hover:text-[#00F2FE] transition cursor-pointer">Chính sách bảo hành 1-đổi-1</button></li>
            <li><button onClick={() => setActiveTab('warranty')} className="hover:text-[#00F2FE] transition cursor-pointer">Hướng dẫn bảo quản mạch loa DX/CSM</button></li>
            <li><button onClick={() => setActiveTab('promotions')} className="hover:text-[#00F2FE] transition cursor-pointer">Chương trình tích điểm Rider Points</button></li>
            <li><button onClick={() => setActiveTab('contact')} className="hover:text-[#00F2FE] transition cursor-pointer">Gửi Ticket hỗ trợ kỹ thuật</button></li>
            <li><button onClick={() => setActiveTab('about')} className="hover:text-[#00F2FE] transition cursor-pointer">Quy trình kiểm định hàng Bandai</button></li>
          </ul>
        </div>

        {/* Store Showrooms with Showroom Photo */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs border-l-2 border-[#00F2FE] pl-2.5 text-pop flex items-center gap-1.5">
            <span>Hệ Thống Showroom NPT</span>
            <NeonReindeerIcon size={14} />
          </h4>
          <div className="space-y-2.5 text-xs text-slate-300 font-medium">
            <div 
              className="w-full h-24 overflow-hidden border border-[#00F2FE]/45 shadow-[0_0_12px_rgba(0,242,254,0.2)] relative group rounded-lg"
            >
              <img 
                src="/Ảnh Showroom & Cửa Hàng/20240708_161850.jpg" 
                alt="Showroom NPTTEAMSTORE Trưng Bày Tokusatsu" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-bold text-[#00F2FE] flex items-center gap-1">
                  <i className="fa-solid fa-store text-[#00F2FE]"></i> Showroom Trưng Bày Đai & Mô Hình
                </span>
              </div>
            </div>
            <p><i className="fa-solid fa-location-dot text-[#00F2FE] mr-2"></i><strong>TP.HCM:</strong> 158 Nguyễn Trãi, Quận 1</p>
            <p><i className="fa-solid fa-location-dot text-[#00F2FE] mr-2"></i><strong>Hà Nội:</strong> 88 Chùa Bộc, Đống Đa</p>
            <p><i className="fa-solid fa-phone text-[#00F2FE] mr-2"></i>Hotline: <strong className="text-white">1900 8888</strong></p>
            <p><i className="fa-solid fa-clock text-[#00F2FE] mr-2"></i>Mở cửa: 08:30 - 21:30</p>
          </div>
        </div>
      </div>

      {/* Festive Christmas Holiday Greeting Strip with Line-Art Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <div 
          className="bg-[#121214] border border-[#00F2FE]/40 p-3.5 text-center shadow-[0_0_15px_rgba(0,242,254,0.2)] rounded-lg"
        >
          <p className="text-xs sm:text-sm font-bold text-[#E0F7FA] flex items-center justify-center gap-2.5 flex-wrap">
            <NeonTreeIcon size={16} glow={true} />
            <span>Chúc quý khách & toàn thể Tokusatsu Collector một mùa Giáng Sinh an lành, ấm áp & may mắn!</span>
            <NeonSnowflakeIcon size={16} glow={true} />
            <NeonStarIcon size={15} glow={true} />
            <NeonGiftIcon size={16} glow={true} />
            <NeonReindeerIcon size={16} glow={true} />
          </p>
        </div>
      </div>

      {/* Bottom Copyright & Author Credit */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-300">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-[#E0F7FA] font-medium">
            &copy; 2026 NPTTEAMSTORE - Kamen Rider Official Store Japan. Bản quyền thuộc về <strong className="text-[#00F2FE] font-bold">Team NPT</strong>.
          </p>
          <p className="text-[10px] text-slate-400">
            Hệ thống phân phối đai biến hình DX, CSM & mô hình S.H.Figuarts chính hãng Bandai tại Việt Nam.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span 
            className="bg-[#121214] border border-[#00F2FE]/50 px-3 py-1 text-[#00F2FE] font-bold text-[10px] shadow-[0_0_8px_rgba(0,242,254,0.3)] flex items-center gap-1.5 rounded-full"
          >
            <span className="w-2 h-2 rounded-full bg-[#05FFD2] inline-block animate-ping"></span>
            <span>Máy Chủ: Trực Tuyến 24/7</span>
          </span>
          <span 
            className="bg-[#121214] border border-[#FFD700]/50 px-3 py-1 text-[#FFD700] font-bold text-[10px] shadow-sm flex items-center gap-1.5 rounded-full"
          >
            <i className="fa-solid fa-crown text-[#FFD700]"></i> Trưởng nhóm: Đoàn Tiến Đạt
          </span>
          <span 
            className="bg-[#121214] border border-[#00F2FE]/40 px-3 py-1 text-[#00F2FE] font-bold text-[10px] shadow-sm flex items-center gap-1.5 rounded-full"
          >
            <i className="fa-solid fa-shield text-[#00F2FE]"></i> Phó nhóm: Vũ Tạ Hữu Luân
          </span>
          <span 
            className="bg-[#121214] border border-[#00F2FE]/30 px-3 py-1 text-slate-300 font-bold text-[10px] shadow-sm flex items-center gap-1.5 rounded-full"
          >
            <i className="fa-solid fa-users text-[#00F2FE]"></i> Ban Quản Trị: Team NPT
          </span>
        </div>
      </div>
    </footer>
  );
};
