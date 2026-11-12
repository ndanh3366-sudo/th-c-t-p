import React, { useState } from 'react';

interface AboutWebModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutWebModal: React.FC<AboutWebModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'journey' | 'team' | 'commitments'>('journey');

  const riderLogos = [
    { name: 'Kamen Rider Revice Logo', src: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png' },
    { name: 'Kamen Rider Saber Logo', src: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_saber_logo_by_driftingcar_dgh9vay-pre.png' },
    { name: 'Kamen Rider Kiva Logo', src: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_kiva_logo_by_driftingcar_dg7tj5z-pre.png' },
    { name: 'Kamen Rider Knight Logo', src: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_knight_logo_by_driftingcar_dg73k3x-414w-2x.png' },
    { name: 'Kamen Rider Femme Logo', src: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_femme_logo_by_driftingcar_dg73lkh-pre.png' },
  ];

  const milestones = [
    {
      year: '2018',
      tag: 'KHỞI NGUỒN ĐAM MÊ',
      title: 'Tình Bạn & Căn Phòng Tràn Ngập Đai Henshin',
      desc: 'NPTTEAMSTORE bắt nguồn từ một căn phòng nhỏ của 5 người anh em Team NPT (Đoàn Tiến Đạt, Vũ Tạ Hữu Luân, Hoàng Trọng Hiệp, Nguyễn Thành Danh, Vũ Thanh Bình). Đam mê những thước phim Kamen Rider từ thuở nhỏ, nhóm thường xuyên unbox những chiếc đai xách tay từ Akihabara và ấp ủ ước mơ lan tỏa văn hóa Tokusatsu.',
      icon: 'fa-solid fa-fire'
    },
    {
      year: '2020 - 2021',
      tag: 'BƯỚC NGOẶT LỊCH SỬ',
      title: 'Nỗi Trăn Trở Hàng Giả & Quyết Định Lập Website',
      desc: 'Chứng kiến thị trường Việt Nam ngập tràn đồ chơi bootleg nhái, đai cũ bị luộc chip âm thanh và nhiều bạn trẻ bị lừa đảo trên mạng, Trưởng nhóm Đoàn Tiến Đạt cùng anh em Team NPT quyết tâm: “Phải xây dựng một trang web độc lập, minh bạch 100% chuẩn Bandai Japan nguyên seal để bảo vệ niềm tin của anh em Collector!”. Cái tên NPTTEAMSTORE (Niềm Tin - Phong Cách - Tận Tâm) chính thức ra đời.',
      icon: 'fa-solid fa-shield-halved'
    },
    {
      year: '2022 - 2023',
      tag: 'NHỮNG ĐÊM TRẮNG VIẾT CODE',
      title: 'Đoàn Tiến Đạt Trực Tiếp Lập Trình & Đặt Nền Móng',
      desc: 'Hàng trăm đêm thức trắng để thiết kế từng giao diện Tokusatsu vị lai, tích hợp âm thanh click chuột cơ học, cơ chế tra cứu và kiểm định chất lượng. Phó nhóm Vũ Tạ Hữu Luân kết nối đường nhập khẩu chính ngạch Nhật Bản cho các dòng CSM cao cấp; Hiệp, Danh và Bình hoàn thiện quy trình kiểm định mạch loa 5 bước gắt gao.',
      icon: 'fa-solid fa-code'
    },
    {
      year: '2024 - 2025',
      tag: 'KHAI TRƯƠNG SHOWROOM',
      title: 'Mở Rộng 3 Showroom Lớn Tại 3 Miền',
      desc: 'Website cán mốc 20.000 đơn hàng. Nhằm đem đến trải nghiệm thực tế “nghe tận tai - thử tận tay”, chuỗi showroom tại TP.HCM (Bến Thành), Hà Nội (Đống Đa), Đà Nẵng (Thanh Khê) được khai trương với hơn 500+ bộ đai mẫu và mô hình S.H.Figuarts cho khách hàng trải nghiệm miễn phí.',
      icon: 'fa-solid fa-store'
    },
    {
      year: '2026',
      tag: 'KỶ NGUYÊN WEB ĐỘNG',
      title: 'Nâng Cấp Web Động Full-Stack & 50.000 Thành Viên',
      desc: 'NPTTEAMSTORE chuyển mình thành nền tảng Web Động hiện đại: dữ liệu thời gian thực, sàn đấu giá trực tiếp tính từng giây, tra cứu mã đơn hàng tự động, vòng quay may mắn và diễn đàn gắn kết hơn 50.000 tín đồ Tokusatsu trên cả nước.',
      icon: 'fa-solid fa-bolt'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#181524] via-[#0D0B12] to-[#08070C] border-2 border-[#C9A84C] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(201,168,76,0.35)] text-[#F5F2EB] my-8 overflow-hidden gold-silver-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Gold Light Burst */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B1E1E]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1A1A1A] hover:bg-[#8B1E1E] text-gray-400 hover:text-white border border-[#2A2A2A] hover:border-[#C9A84C] flex items-center justify-center transition duration-300 z-10 shadow-lg"
          title="Đóng cửa sổ"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Header Title Section */}
        <div className="text-center space-y-3 pb-5 border-b border-[#C9A84C]/30 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/50 px-4 py-1 rounded-full text-[#C9A84C] text-xs font-black uppercase tracking-widest">
            <i className="fa-solid fa-crown text-amber-300"></i> HÀNH TRÌNH THÀNH LẬP & TIỂU SỬ WEBSITE
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#070c1e] rounded-2xl p-1 border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.6)] flex items-center justify-center overflow-hidden">
              <img 
                src="/Logo & Thương Hiệu (Brand Logo)/npt_letter_logo.jpg" 
                alt="NPTTEAMSTORE NPT Letter Emblem" 
                className="w-full h-full object-cover rounded-xl filter drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                onError={(e) => { e.currentTarget.src = '/logo-rider.jpg'; }}
              />
            </div>
            <h2 className="font-serif-title text-2xl sm:text-4xl font-black tracking-wider text-white uppercase text-pop">
              HÀNH TRÌNH <span className="gold-gradient-text">NPTTEAMSTORE</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl">
              Từ Giấc Mơ Henshin Tuổi Thơ Đến Hệ Thống Phân Phối Tokusatsu Chuẩn Bandai Japan Số 1 Việt Nam
            </p>
          </div>

          {/* Navigation Pill Tabs inside Modal */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('journey')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'journey'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                  : 'bg-[#0f1424] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              📜 Hành Trình Lập Web
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'team'
                  ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/30'
                  : 'bg-[#0f1424] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              👥 Đội Ngũ Sáng Lập
            </button>
            <button
              onClick={() => setActiveTab('commitments')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'commitments'
                  ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/30'
                  : 'bg-[#0f1424] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              ⭐ Cam Kết & Showroom
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="mt-5 space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-xs sm:text-sm leading-relaxed text-gray-300">
          
          {/* TAB 1: HÀNH TRÌNH THÀNH LẬP WEB */}
          {activeTab === 'journey' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-amber-500/10 border border-amber-400/40 p-4 rounded-2xl">
                <h4 className="font-serif-title font-black text-amber-300 text-sm sm:text-base uppercase flex items-center gap-2 mb-1">
                  <i className="fa-solid fa-sparkles text-amber-400"></i>
                  LÝ DO NPTTEAMSTORE RA ĐỜI
                </h4>
                <p className="text-xs text-slate-200">
                  “Chúng tôi lập nên website NPTTEAMSTORE vì không thể nhìn thấy niềm đam mê của anh em Collector Việt Nam bị phụ lòng bởi hàng nhái bootleg và những chiếc đai cũ hỏng mạch. Đây là ngôi nhà chung nơi mọi người hoàn toàn yên tâm 100% về nguồn gốc Bandai Japan.”
                </p>
                <div className="mt-2 text-[11px] font-bold text-cyan-300">
                  — Đoàn Tiến Đạt (Trưởng nhóm sáng lập NPTTEAMSTORE)
                </div>
              </div>

              {/* Chronological Timeline */}
              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-rose-500 before:to-cyan-400 pl-8">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative space-y-1.5 bg-[#091024]/80 border border-cyan-500/30 p-3.5 rounded-xl hover:border-amber-400 transition">
                    <div className="absolute -left-8 top-3 w-4 h-4 rounded-full bg-amber-400 border-2 border-black shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                        {m.year}
                      </span>
                      <span className="text-[10px] font-black uppercase text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                        {m.tag}
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                      <i className={`${m.icon} text-amber-400 text-xs`}></i>
                      {m.title}
                    </h5>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ĐỘI NGŨ SÁNG LẬP TEAM NPT */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {/* Creator Profile Box - Leader */}
              <div className="bg-gradient-to-r from-[#200e05] via-[#101428] to-[#070b14] border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute -top-3 -left-2 z-20 flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-300 text-black p-1 rounded-full shadow-lg border-2 border-yellow-200">
                      <span className="text-base leading-none">👑</span>
                    </div>
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#060a18] p-0.5 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                      <img 
                        src="/Ảnh Sản Phẩm/teamnpt/Đoàn Tiến Đạt.jpg" 
                        alt="Đoàn Tiến Đạt - Trưởng Nhóm" 
                        className="w-full h-full object-cover rounded-[14px]"
                        onError={(e) => {
                          e.currentTarget.src = '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png';
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-center sm:text-left flex-grow">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                        👑 TRƯỞNG NHÓM SÁNG LẬP
                      </span>
                      <span className="bg-amber-400/20 border border-amber-400/60 text-amber-300 text-[9px] font-black px-2.5 py-0.5 rounded-full">
                        KIẾN TRÚC SƯ WEBSITE
                      </span>
                    </div>
                    <h3 className="font-serif-title text-base sm:text-lg font-black text-white text-pop flex items-center justify-center sm:justify-start gap-1.5">
                      Đoàn Tiến Đạt <span className="text-amber-400">👑</span>
                    </h3>
                    <p className="text-xs text-slate-200">
                      Trực tiếp lên ý tưởng, thiết kế kiến trúc phần mềm và lập trình toàn bộ hệ thống website NPTTEAMSTORE.
                    </p>
                  </div>
                </div>

                {/* Sub-row: Vice Leader & Board of Directors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                  {/* Vice Leader */}
                  <div className="bg-[#0b1022] border-2 border-slate-300/70 rounded-xl p-3 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#060a18] p-0.5 border-2 border-slate-200 shadow-[0_0_12px_rgba(226,232,240,0.4)]">
                        <img 
                          src="/Ảnh Sản Phẩm/teamnpt/Vũ Tạ Hữu Luân.jpg" 
                          alt="Vũ Tạ Hữu Luân" 
                          className="w-full h-full object-cover rounded-[8px]"
                        />
                      </div>
                      <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-300 flex items-center justify-center text-[10px]">
                        ⚔️
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-950 font-bold mb-0.5">
                        ⚔️ PHÓ NHÓM ĐIỀU HÀNH
                      </span>
                      <h4 className="font-bold text-white text-xs truncate">Vũ Tạ Hữu Luân</h4>
                      <p className="text-[10px] text-slate-300">Quan hệ đối tác Bandai Japan & Cố vấn chiến lược</p>
                    </div>
                  </div>

                  {/* Board of Administrators */}
                  <div className="bg-[#0a1428] border-2 border-cyan-500/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-400/60 flex items-center justify-center text-xl shrink-0 text-cyan-300">
                      🛡️
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 mb-0.5">
                        BAN QUẢN TRỊ ĐỒNG SÁNG LẬP
                      </span>
                      <h4 className="font-bold text-white text-xs truncate">Hoàng Trọng Hiệp, Nguyễn Thành Danh, Vũ Thanh Bình</h4>
                      <p className="text-[10px] text-slate-300">Kho vận chống shock, kiểm định mạch chip & chăm sóc khách hàng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAM KẾT & SHOWROOM */}
          {activeTab === 'commitments' && (
            <div className="space-y-4">
              {/* Showroom Photo Section */}
              <div className="space-y-2">
                <h4 className="font-serif-title text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <i className="fa-solid fa-store text-amber-400"></i>
                  HỆ THỐNG SHOWROOM TRẢI NGHIỆM THỰC TẾ
                </h4>
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/70 p-1 bg-[#060b18] shadow-2xl group">
                  <div className="relative h-44 sm:h-56 rounded-xl overflow-hidden bg-black">
                    <img 
                      src="/Ảnh Showroom & Cửa Hàng/20240708_161850.jpg" 
                      alt="Không gian Showroom NPTTEAMSTORE" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-4 flex flex-col justify-end">
                      <span className="bg-rose-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase w-fit mb-1 border border-amber-400 shadow">
                        Showroom TP.HCM & Hà Nội & Đà Nẵng
                      </span>
                      <p className="font-bold text-white text-xs sm:text-sm">Hơn 500+ bộ đai Henshin Belt & Mô hình S.H.Figuarts trưng bày trải nghiệm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rider Logos Gallery */}
              <div className="space-y-2 pt-2">
                <h4 className="font-serif-title text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <i className="fa-solid fa-crown text-amber-400"></i>
                  BIỂU TƯỢNG BẢN QUYỀN BANDAI
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {riderLogos.map((logo, index) => (
                    <div key={index} className="bg-[#060a16] border-2 border-amber-400/40 hover:border-amber-400 rounded-xl p-2 flex flex-col items-center justify-center gap-1.5 transition group shadow-sm">
                      <div className="w-full h-10 bg-[#030610] rounded-lg p-1 border border-white/10 flex items-center justify-center">
                        <img src={logo.src} alt={logo.name} className="max-w-full max-h-full object-contain filter group-hover:scale-105 transition duration-300" />
                      </div>
                      <span className="text-[9px] text-slate-300 font-bold text-center line-clamp-1">{logo.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Core Commitments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#0e162a] p-3 rounded-xl border border-cyan-500/40 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-400 text-[#0A0A0A] font-black flex items-center justify-center shrink-0 text-xs">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">100% Bandai Japan Seal</h5>
                    <p className="text-[11px] text-gray-300">Đền 300% nếu phát hiện hàng nhái hay bootleg.</p>
                  </div>
                </div>

                <div className="bg-[#0e162a] p-3 rounded-xl border border-cyan-500/40 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#8B1E1E] text-white font-black flex items-center justify-center shrink-0 text-xs">
                    <i className="fa-solid fa-screwdriver-wrench"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Bảo Hành Mạch Loa 30 Ngày</h5>
                    <p className="text-[11px] text-gray-300">1-đổi-1 nếu phát sinh lỗi mạch loa từ nhà sản xuất.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact & Showroom Footer Banner */}
          <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <i className="fa-solid fa-location-dot text-cyan-400"></i>
                Hệ Thống Showroom: <span className="text-gray-200 font-normal">Hà Nội • Đà Nẵng • TP. Hồ Chí Minh</span>
              </p>
              <p className="text-gray-300 flex items-center gap-1.5 justify-center sm:justify-start">
                <i className="fa-solid fa-phone text-cyan-400"></i>
                Hotline / Zalo: <strong className="text-cyan-300">0988.888.888</strong> (NPTTEAMSTORE)
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#8B1E1E] text-white font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 transition shrink-0"
            >
              ⚡ Đã Hiểu - Khám Phá Store Ngay
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
