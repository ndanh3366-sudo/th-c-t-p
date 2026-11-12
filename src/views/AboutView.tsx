import React, { useState } from 'react';

export const AboutView: React.FC = () => {
  const [activeStoryChapter, setActiveStoryChapter] = useState<number>(0);

  const storyChapters = [
    {
      year: '2018',
      phase: 'GIAI ĐOẠN 1: KHỞI NGUỒN ĐAM MÊ',
      title: 'Tia Sáng Đam Mê & Căn Phòng Nhỏ Tokusatsu',
      badge: 'BẮT ĐẦU TỪ TÌNH BẠN',
      icon: 'fa-solid fa-fire-flame-curved',
      accentColor: 'from-amber-400 to-orange-500',
      borderColor: 'border-amber-400/60',
      glowColor: 'shadow-amber-500/20',
      description: 'NPTTEAMSTORE khởi đầu không phải như một doanh nghiệp lớn, mà là một căn phòng nhỏ tràn ngập hộp đai Henshin Belt của 5 người bạn thân yêu thích Kamen Rider từ thuở ấu thơ. Trưởng nhóm Đoàn Tiến Đạt cùng Vũ Tạ Hữu Luân, Hoàng Trọng Hiệp, Nguyễn Thành Danh và Vũ Thanh Bình đã cùng nhau thức thâu đêm để đón xem từng tập phim Kuuga, Ryuki, Faiz, Decade, Build.',
      details: [
        'Tụ họp giao lưu, unbox từng chiếc đai xách tay gửi từ khu phố điện tử Akihabara và Nakano Broadway (Tokyo).',
        'Tôn chỉ đầu tiên được khắc ghi: “Một khi đã Henshin, nhất định phải là đai thật và chuẩn âm thanh nguyên bản!”.',
        'Nhận thấy ở Việt Nam còn rất ít sân chơi chân chính cho người sưu tầm Tokusatsu.'
      ]
    },
    {
      year: '2020 - 2021',
      phase: 'GIAI ĐOẠN 2: CÚ SỐC THỊ TRƯỜNG & KHÁT VỌNG',
      title: 'Nỗi Trăn Trở Về Hàng Giả & Quyết Định Lịch Sử',
      badge: 'BƯỚC NGOẶT ĐỘNG LỰC',
      icon: 'fa-solid fa-triangle-exclamation',
      accentColor: 'from-rose-500 to-red-600',
      borderColor: 'border-rose-400/60',
      glowColor: 'shadow-rose-500/20',
      description: 'Giai đoạn 2020 - 2021, thị trường đồ chơi Tokusatsu tại Việt Nam bùng nổ nhưng đầy cạm bẫy: hàng nhái bootleg tinh vi trôi nổi, đai cũ bị luộc chip âm thanh, chết mắt đọc hồng ngoại, lẫy gãy dán keo 502 được bán giá cao trên mạng. Rất nhiều bạn học sinh và Collector trẻ bị lừa mất số tiền gom góp cả năm.',
      details: [
        'Buổi họp khẩn của Team NPT cuối năm 2020 đưa ra tuyên ngôn: “Không thể để đam mê của anh em Collector Việt Nam bị lợi dụng bởi hàng giả!”.',
        'Đoàn Tiến Đạt đề xuất thành lập một nền tảng website chuyên nghiệp, minh bạch 100% với tiêu chuẩn Bandai Japan nguyên seal.',
        'Đặt tên thương hiệu NPTTEAMSTORE: Tượng trưng cho Niềm Tin (N) - Phong Cách (P) - Tận Tâm (T).'
      ]
    },
    {
      year: '2022 - 2023',
      phase: 'GIAI ĐOẠN 3: NHỮNG ĐÊM TRẮNG LẬP TRÌNH',
      title: 'Hành Trình Viết Dòng Code Đầu Tiên & Đặt Nền Móng',
      badge: 'KIẾN TẠO HỆ THỐNG',
      icon: 'fa-solid fa-code',
      accentColor: 'from-cyan-400 to-blue-500',
      borderColor: 'border-cyan-400/60',
      glowColor: 'shadow-cyan-500/20',
      description: 'Hàng trăm đêm thức trắng bắt đầu. Trưởng nhóm Đoàn Tiến Đạt trực tiếp làm kiến trúc sư hệ thống, tự tay thiết kế từng đường nét giao diện mang phong cách Tokusatsu vị lai, tích hợp hiệu ứng âm thanh click chuột cơ học, cơ chế tra cứu và kiểm định chất lượng.',
      details: [
        'Đoàn Tiến Đạt hoàn thiện kiến trúc website, xây dựng hệ thống quản lý sản phẩm và bảo mật đơn hàng.',
        'Vũ Tạ Hữu Luân kết nối trực tiếp các đơn vị xuất khẩu uy tín tại Nhật Bản, đưa các dòng CSM và Premium Bandai về Việt Nam chính ngạch.',
        'Hoàng Trọng Hiệp, Nguyễn Thành Danh và Vũ Thanh Bình xây dựng kho kiểm soát độ ẩm và quy trình test mạch loa 5 bước nghiêm ngặt.'
      ]
    },
    {
      year: '2024 - 2025',
      phase: 'GIAI ĐOẠN 4: BÙNG NỔ UY TÍN & SHOWROOM',
      title: 'Hiện Thực Hóa Giấc Mơ Trải Nghiệm Ba Miền',
      badge: 'MỞ RỘNG TOÀN QUỐC',
      icon: 'fa-solid fa-store',
      accentColor: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-400/60',
      glowColor: 'shadow-emerald-500/20',
      description: 'NPTTEAMSTORE nhanh chóng trở thành trang web quen thuộc của mọi Collector Việt Nam với hơn 20.000 đơn hàng giao thành công. Để người hâm mộ được “sờ tận tay - nghe tận tai”, Team NPT quyết định mở rộng chuỗi showroom trải nghiệm tại TP. Hồ Chí Minh, Hà Nội và Đà Nẵng.',
      details: [
        'Khai trương 3 showroom lớn với hơn 500+ bộ đai mẫu và mô hình S.H.Figuarts cho khách hàng trải nghiệm miễn phí.',
        'Chính sách bảo hành 1-đổi-1 trong 30 ngày và bảo dưỡng mạch loa trọn đời được triển khai toàn diện.',
        'Hơn 50.000 thành viên tích cực tham gia các sự kiện đấu giá và Rider Quiz trên nền tảng.'
      ]
    },
    {
      year: '2026',
      phase: 'GIAI ĐOẠN 5: KỶ NGUYÊN WEB ĐỘNG HIỆN ĐẠI',
      title: 'Hệ Sinh Thái Web Động Đa Tính Năng Thời Gian Thực',
      badge: 'CHUYỂN MÌNH CÔNG NGHỆ',
      icon: 'fa-solid fa-bolt',
      accentColor: 'from-yellow-400 via-amber-300 to-yellow-500',
      borderColor: 'border-yellow-400/80',
      glowColor: 'shadow-yellow-500/30',
      description: 'NPTTEAMSTORE chính thức nâng cấp thành nền tảng Web Động (Dynamic Full-Stack Web) với hệ thống cơ sở dữ liệu thời gian thực, đồng bộ phiên đấu giá sản phẩm hiếm, tính năng tra cứu hành trình đơn hàng tự động, vòng quay may mắn nhận voucher và diễn đàn giao lưu kết nối anh em ba miền.',
      details: [
        'Hệ thống REST API đồng bộ dữ liệu kho hàng, kiểm định và bảo hành điện tử chính xác tuyệt đối.',
        'Sàn đấu giá Hoàng Gia đếm ngược theo giây, đảm bảo tính công bằng và minh bạch nhất cho mọi Collector.',
        'Tuyên ngôn tương lai: “Giữ trọn ngọn lửa tuổi thơ - Đem trải nghiệm Henshin chuẩn mực Bandai Japan đến từng ngôi nhà!”.'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-[#F5F2EB]">
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
          <i className="fa-solid fa-shield-halved text-cyan-400 animate-pulse"></i>
          <span>HÀNH TRÌNH THÀNH LẬP & PHÁT TRIỂN NPTTEAMSTORE</span>
        </div>
        <h1 className="font-serif-title text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-white text-pop">
          Từ Đam Mê Tuổi Thơ Đến <span className="gold-gradient-text">BIỂU TƯỢNG TOKUSATSU</span> Số 1 Việt Nam
        </h1>
        <p className="text-xs sm:text-base text-slate-200 leading-relaxed max-w-3xl mx-auto font-medium">
          Câu chuyện về cách <strong>Team NPT</strong> biến tình yêu dành cho những chiếc đai biến hình Kamen Rider thành một hệ sinh thái thương mại điện tử chuyên nghiệp, minh bạch và kiên định với tôn chỉ: <em>“100% Bandai Japan – Trọn vẹn tinh thần Henshin!”</em>
        </p>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { num: '2018', label: 'Năm Khởi Nguồn Đam Mê', icon: 'fa-solid fa-calendar-check', color: 'text-amber-400' },
          { num: '50.000+', label: 'Collector Gắn Kết Cả Nước', icon: 'fa-solid fa-users', color: 'text-cyan-400' },
          { num: '100%', label: 'Bandai Japan Nguyên Seal', icon: 'fa-solid fa-certificate', color: 'text-emerald-400' },
          { num: '3 Miền', label: 'Hệ Thống Showroom Trải Nghiệm', icon: 'fa-solid fa-map-location-dot', color: 'text-rose-400' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-b from-[#0e162f] to-[#070b18] border-2 border-cyan-500/30 p-4 rounded-2xl text-center space-y-1 shadow-lg hover:border-amber-400 transition">
            <i className={`${stat.icon} ${stat.color} text-2xl mb-1`}></i>
            <div className={`font-serif-title text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.num}</div>
            <div className="text-[11px] text-slate-300 font-semibold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CORE TIMELINE: HÀNH TRÌNH THÀNH LẬP NPTTEAMSTORE */}
      <div className="bg-gradient-to-b from-[#0c1328] via-[#091024] to-[#060a18] border-2 border-amber-400/70 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-400/30 pb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400/20 border border-amber-400 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                BIÊN NIÊN SỬ WEBSITE
              </span>
              <span className="text-xs text-cyan-300 font-bold uppercase">5 CỘT MỐC LỊCH SỬ</span>
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-white text-pop flex items-center gap-2">
              <i className="fa-solid fa-route text-amber-400"></i>
              Hành Trình Thành Lập: <span className="gold-gradient-text">NPTTEAMSTORE</span>
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-sm text-center sm:text-right">
            Nhấp chọn từng mốc thời gian để xem chi tiết từng giai đoạn hình thành và mở rộng website
          </p>
        </div>

        {/* Timeline Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 relative z-10">
          {storyChapters.map((chapter, idx) => {
            const isSelected = activeStoryChapter === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStoryChapter(idx)}
                className={`p-3 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? `bg-gradient-to-br from-[#182346] to-[#0c1328] ${chapter.borderColor} shadow-lg shadow-cyan-500/20 scale-[1.02]`
                    : 'bg-[#060a16]/80 border-slate-700/60 hover:border-cyan-500/50 hover:bg-[#0b1227]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono font-black text-xs ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                    {chapter.year}
                  </span>
                  <i className={`${chapter.icon} text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`}></i>
                </div>
                <div className="mt-2 font-bold text-[11px] leading-tight text-white line-clamp-1">
                  {chapter.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Chapter Details Box */}
        {(() => {
          const ch = storyChapters[activeStoryChapter];
          return (
            <div className={`bg-[#060b18] border-2 ${ch.borderColor} rounded-2xl p-6 sm:p-8 space-y-5 relative z-10 shadow-2xl transition duration-500`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                    {ch.phase}
                  </span>
                  <h3 className="font-serif-title text-xl sm:text-2xl font-black text-white text-pop flex items-center gap-2">
                    <span>{ch.title}</span>
                    <span className="text-amber-400 font-mono text-lg font-bold">({ch.year})</span>
                  </h3>
                </div>
                <span className="bg-[#0b1227] border border-amber-400/40 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-xl self-start sm:self-center shadow">
                  {ch.badge}
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {ch.description}
              </p>

              <div className="bg-[#0a1024] border border-cyan-500/30 rounded-xl p-4 sm:p-5 space-y-2.5">
                <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-emerald-400"></i>
                  Những Dấu Ấn Then Chốt Trong Giai Đoạn Này:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {ch.details.map((item, i) => (
                    <div key={i} className="bg-[#060a16] border border-white/10 p-3 rounded-lg flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* TEAM NPT ORGANIZATIONAL STRUCTURE SHOWCASE */}
      <div className="bg-gradient-to-b from-[#0a1024] via-[#0d1633] to-[#080d1e] border-2 border-cyan-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 ring-1 ring-cyan-300/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-cyan-500/30 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-400 to-blue-500 p-0.5 shadow-md shadow-cyan-400/20 shrink-0">
              <div className="w-full h-full bg-[#060a18] rounded-[10px] p-1 flex items-center justify-center border border-cyan-300/40">
                <img 
                  src="/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png" 
                  alt="Team NPT Logo" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cyan-400/20 border border-cyan-400/60 text-cyan-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  NHỮNG NGƯỜI ĐẶT VIÊN GẠCH ĐẦU TIÊN
                </span>
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  TEAM NPT SÁNG LẬP
                </span>
              </div>
              <h3 className="font-serif-title text-xl sm:text-2xl font-black text-white text-pop">
                Đội Ngũ Sáng Lập: <span className="aqua-gradient-text">Team NPT</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#0b1022] border border-cyan-400/50 px-3 py-1.5 rounded-xl font-bold text-cyan-300 flex items-center gap-1.5">
              <span>👑 Trưởng nhóm</span>
            </span>
            <span className="bg-[#0b1022] border border-slate-300/50 px-3 py-1.5 rounded-xl font-bold text-slate-200 flex items-center gap-1.5">
              <span>⚔️ Phó nhóm</span>
            </span>
            <span className="bg-[#0b1022] border border-cyan-500/50 px-3 py-1.5 rounded-xl font-bold text-cyan-200 flex items-center gap-1.5">
              <span>🛡️ Ban Quản Trị</span>
            </span>
          </div>
        </div>

        {/* Top 2: Trưởng nhóm & Phó nhóm */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
          
          {/* TRƯỞNG NHÓM: ĐOÀN TIẾN ĐẠT - VIỀN VÀNG + VƯƠNG MIỆN + LÀM TOÀN BỘ CÔNG VIỆC (7 cols) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-[#240810] via-[#150a1d] to-[#08020a] border-2 border-amber-400/90 rounded-2xl p-5 shadow-[0_0_35px_rgba(245,158,11,0.25)] relative overflow-hidden group">
            <div className="absolute top-2 right-3 text-7xl opacity-10 select-none pointer-events-none text-amber-300">
              👑
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute -top-3 -left-2 z-20 flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-300 text-black p-1 rounded-full shadow-lg border-2 border-yellow-200 animate-bounce">
                  <span className="text-base leading-none">👑</span>
                </div>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#08020a] p-0.5 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] group-hover:scale-105 transition">
                  <img 
                    src="/Ảnh Sản Phẩm/teamnpt/Đoàn Tiến Đạt.jpg" 
                    alt="Đoàn Tiến Đạt" 
                    className="w-full h-full object-cover rounded-[14px]"
                    onError={(e) => {
                      e.currentTarget.src = '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png';
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-black/90 p-0.5 border border-amber-400 overflow-hidden shadow">
                  <img src="/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png" alt="Crest" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Leader Details */}
              <div className="space-y-2 text-center sm:text-left flex-grow">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                    👑 TRƯỞNG NHÓM SÁNG LẬP
                  </span>
                  <span className="bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    KIẾN TRÚC SƯ WEBSITE & TỔNG ĐIỀU HÀNH
                  </span>
                </div>

                <h4 className="font-serif-title font-black text-xl text-white text-pop flex items-center justify-center sm:justify-start gap-2">
                  <span>Đoàn Tiến Đạt</span>
                  <span className="text-amber-400 text-base">👑</span>
                </h4>
                <p className="text-[11px] text-cyan-300 font-bold">
                  Sáng lập nền tảng • Trực tiếp thiết kế & xây dựng hệ thống website NPTTEAMSTORE
                </p>

                {/* Scope bar */}
                <div className="bg-[#0b1022] border border-cyan-500/30 rounded-xl p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300">Đóng góp cho web:</span>
                    <span className="font-mono font-black text-amber-300">KIẾN TRÚC & PHÁT TRIỂN TOÀN DIỆN</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-amber-400/40">
                    <div className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 rounded-full w-full"></div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-200 italic bg-amber-950/30 border border-amber-400/30 p-2.5 rounded-xl">
                  “Chúng tôi xây dựng website này bằng tình yêu thuần khiết của những đứa trẻ mê Tokusatsu, để bất kỳ ai đến với NPTTEAMSTORE đều tìm thấy sự an tâm tuyệt đối.”
                </p>
              </div>
            </div>
          </div>

          {/* PHÓ NHÓM: VŨ TẠ HỮU LUÂN */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#0c162f] via-[#091124] to-[#050914] border-2 border-slate-300/80 rounded-2xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)] relative overflow-hidden group">
            <div className="absolute top-2 right-3 text-7xl opacity-10 select-none pointer-events-none text-slate-200">
              ⚔️
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute -top-3 -left-2 z-20 flex items-center justify-center bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 p-1 rounded-full shadow-lg border-2 border-white animate-pulse">
                  <span className="text-base leading-none">⚔️</span>
                </div>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#08020a] p-0.5 border-2 border-slate-200 shadow-[0_0_18px_rgba(226,232,240,0.5)] group-hover:scale-105 transition">
                  <img 
                    src="/Ảnh Sản Phẩm/teamnpt/Vũ Tạ Hữu Luân.jpg" 
                    alt="Vũ Tạ Hữu Luân" 
                    className="w-full h-full object-cover rounded-[14px]"
                    onError={(e) => {
                      e.currentTarget.src = '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png';
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-black/90 p-0.5 border border-slate-300 overflow-hidden shadow">
                  <img src="/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_knight_logo_by_driftingcar_dg73k3x-414w-2x.png" alt="Crest" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Vice Leader Details */}
              <div className="space-y-2 text-center sm:text-left flex-grow">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                    ⚔️ PHÓ NHÓM ĐIỀU HÀNH
                  </span>
                  <span className="bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    QUAN HỆ ĐỐI TÁC BANDAI
                  </span>
                </div>

                <h4 className="font-serif-title font-black text-xl text-white text-pop flex items-center justify-center sm:justify-start gap-2">
                  <span>Vũ Tạ Hữu Luân</span>
                  <span className="text-slate-300 text-base">⚔️</span>
                </h4>
                <p className="text-[11px] text-slate-300 font-semibold">
                  Phó nhóm • Phụ trách kết nối chuỗi cung ứng Bandai Japan & Chiến lược phát triển
                </p>

                <p className="text-[11px] text-slate-200 italic bg-[#0d162d] border border-cyan-500/20 p-2.5 rounded-xl">
                  “Một trang web uy tín phải được xây dựng từ những sản phẩm thật và dịch vụ tận tâm nhất đến từng khách hàng.”
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom 3: Ban Điều Hành & Quản Trị Viên */}
        <div className="space-y-2 pt-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <h4 className="font-serif-title text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-wider">
              BAN QUẢN TRỊ & ĐỒNG SÁNG LẬP HỆ SINH THÁI WEBSITE
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Hiệp */}
            <div className="bg-[#091122]/90 border border-cyan-500/40 rounded-2xl p-3.5 flex items-center gap-3 transition hover:border-cyan-400">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#08020a] p-0.5 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <img 
                    src="/Ảnh Sản Phẩm/teamnpt/Hoàng Trọng Hiệp.jpg" 
                    alt="Hoàng Trọng Hiệp" 
                    className="w-full h-full object-cover rounded-[8px]"
                  />
                </div>
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center text-[10px]">
                  📦
                </div>
              </div>
              <div className="min-w-0">
                <span className="inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 mb-0.5">
                  QUẢN TRỊ KHO VẬN
                </span>
                <h5 className="font-bold text-white text-xs truncate">Hoàng Trọng Hiệp</h5>
                <p className="text-[10px] text-slate-300 line-clamp-2">Kiểm soát quy trình đóng gói 3 lớp xốp khí chống va đập góc hộp cho web.</p>
              </div>
            </div>

            {/* Danh */}
            <div className="bg-[#091122]/90 border border-cyan-500/40 rounded-2xl p-3.5 flex items-center gap-3 transition hover:border-cyan-400">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#08020a] p-0.5 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <img 
                    src="/Ảnh Sản Phẩm/teamnpt/Nguyễn Thành Danh.jpg" 
                    alt="Nguyễn Thành Danh" 
                    className="w-full h-full object-cover rounded-[8px]"
                  />
                </div>
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center text-[10px]">
                  💎
                </div>
              </div>
              <div className="min-w-0">
                <span className="inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 mb-0.5">
                  KIỂM ĐỊNH KỸ THUẬT
                </span>
                <h5 className="font-bold text-white text-xs truncate">Nguyễn Thành Danh</h5>
                <p className="text-[10px] text-slate-300 line-clamp-2">Thiết lập quy trình test mạch chip âm thanh và hệ thống bảo hành 1-đổi-1.</p>
              </div>
            </div>

            {/* Bình */}
            <div className="bg-[#091122]/90 border border-cyan-500/40 rounded-2xl p-3.5 flex items-center gap-3 transition hover:border-cyan-400">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#08020a] p-0.5 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <img 
                    src="/Ảnh Sản Phẩm/teamnpt/Vũ Thanh Bình.png" 
                    alt="Vũ Thanh Bình" 
                    className="w-full h-full object-cover rounded-[8px]"
                  />
                </div>
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center text-[10px]">
                  ✨
                </div>
              </div>
              <div className="min-w-0">
                <span className="inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 mb-0.5">
                  TRUYỀN THÔNG CỘNG ĐỒNG
                </span>
                <h5 className="font-bold text-white text-xs truncate">Vũ Thanh Bình</h5>
                <p className="text-[10px] text-slate-300 line-clamp-2">Điều phối diễn đàn Tokusatsu, tổ chức Rider Quiz và các hoạt động tri ân.</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3 Pillar Commitments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#0b1022] border-2 border-amber-400/30 p-5 rounded-2xl space-y-2.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xl">
            <i className="fa-solid fa-stamp"></i>
          </div>
          <h3 className="font-serif-title text-base font-bold text-white">100% Bandai Japan Seal</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mọi sản phẩm nhập khẩu trực tiếp từ Bandai Namco Nhật Bản, có tem kiểm định chống hàng giả nghiêm ngặt.
          </p>
        </div>

        <div className="bg-[#0b1022] border-2 border-cyan-400/30 p-5 rounded-2xl space-y-2.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-xl">
            <i className="fa-solid fa-shield-cat"></i>
          </div>
          <h3 className="font-serif-title text-base font-bold text-white">Quy Trình Kiểm Định 5 Bước</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kiểm tra tỉ mỉ mạch chip âm thanh, hệ thống LED đa tầng và các khớp cơ học trước khi giao tới tay khách hàng.
          </p>
        </div>

        <div className="bg-[#0b1022] border-2 border-emerald-400/30 p-5 rounded-2xl space-y-2.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-xl">
            <i className="fa-solid fa-award"></i>
          </div>
          <h3 className="font-serif-title text-base font-bold text-white">Bảo Hành 1-Đổi-1 Toàn Quốc</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Đổi mới ngay trong 30 ngày nếu phát sinh lỗi mạch loa hoặc chip nhận diện thẻ/buckle từ nhà sản xuất.
          </p>
        </div>
      </div>

      {/* Showrooms Tour Section */}
      <div className="bg-gradient-to-r from-[#0a1024] via-[#0d1633] to-[#0a1024] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <span className="bg-rose-900/40 border border-rose-500/60 text-rose-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            🏛️ SHOWROOM THỰC TẾ 100%
          </span>
          <h3 className="font-serif-title text-xl sm:text-2xl font-black text-white text-pop">
            Hệ Thống Trưng Bày Showroom NPTTEAMSTORE
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            Không gian trải nghiệm dùng thử đai DX & ngắm nhìn các bộ sưu tập CSM giới hạn trực tiếp
          </p>
        </div>

        {/* Real Showroom Photos Gallery Grid with tight-fitting crisp frames */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-[#060b18] border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl overflow-hidden group transition duration-300 shadow-xl flex flex-col p-1.5">
            <div className="relative h-44 bg-[#040814] rounded-xl overflow-hidden border border-cyan-500/20">
              <img 
                src="/Ảnh Showroom & Cửa Hàng/20240708_161850.jpg" 
                alt="Showroom TP.HCM Trưng Bày Mô Hình" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => { e.currentTarget.src = '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg'; }}
              />
              <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase shadow">
                TP. HỒ CHÍ MINH
              </span>
            </div>
            <div className="p-3 space-y-1 text-xs">
              <h4 className="font-bold text-amber-300 text-sm">Showroom Bến Thành (TP.HCM)</h4>
              <p className="text-slate-300">158 Nguyễn Trãi, Phường Bến Thành, Quận 1</p>
              <p className="text-slate-400 text-[11px]">Khu vực trải nghiệm âm thanh 3D & Thử đai biến hình 1:1</p>
            </div>
          </div>

          <div className="bg-[#060b18] border-2 border-amber-400/40 hover:border-amber-400 rounded-2xl overflow-hidden group transition duration-300 shadow-xl flex flex-col p-1.5">
            <div className="relative h-44 bg-[#040814] rounded-xl overflow-hidden border border-amber-500/20">
              <img 
                src="/Bộ Sưu Tập Poster Dọc/3yya7pw1zck91.jpg" 
                alt="Showroom Hà Nội Trưng Bày Đai CSM" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => { e.currentTarget.src = '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg'; }}
              />
              <span className="absolute top-2 left-2 bg-amber-400 text-black font-black text-[9px] px-2 py-0.5 rounded-md uppercase shadow">
                HÀ NỘI
              </span>
            </div>
            <div className="p-3 space-y-1 text-xs">
              <h4 className="font-bold text-amber-300 text-sm">Showroom Đống Đa (Hà Nội)</h4>
              <p className="text-slate-300">88 Chùa Bộc, Quận Đống Đa, Hà Nội</p>
              <p className="text-slate-400 text-[11px]">Tủ trưng bày trọn bộ Heisei & Reiwa CSM Limited Collection</p>
            </div>
          </div>

          <div className="bg-[#060b18] border-2 border-emerald-400/40 hover:border-emerald-400 rounded-2xl overflow-hidden group transition duration-300 shadow-xl flex flex-col p-1.5">
            <div className="relative h-44 bg-[#040814] rounded-xl overflow-hidden border border-emerald-500/20">
              <img 
                src="/Sản Phẩm Đấu Giá Hoàng Gia/DX Don Onitaijin Gold Mekki Version.jpg" 
                alt="Showroom Đà Nẵng Trung Tâm Bảo Hành" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => { e.currentTarget.src = '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/e094e508-ec72-4168-8a1d-e924fd323829.webp'; }}
              />
              <span className="absolute top-2 left-2 bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase shadow">
                ĐÀ NẴNG
              </span>
            </div>
            <div className="p-3 space-y-1 text-xs">
              <h4 className="font-bold text-amber-300 text-sm">Showroom Thanh Khê (Đà Nẵng)</h4>
              <p className="text-slate-300">42 Điện Biên Phủ, Quận Thanh Khê</p>
              <p className="text-slate-400 text-[11px]">Trung tâm bảo hành kỹ thuật & sửa chữa mạch loa đai chính hãng</p>
            </div>
          </div>

        </div>

        {/* Rider Logos Collection */}
        <div className="space-y-3 pt-4 border-t border-cyan-500/25">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-title font-black text-sm sm:text-base text-white uppercase flex items-center gap-2">
              <i className="fa-solid fa-crown text-amber-400"></i> BIỂU TƯỢNG BẢN QUYỀN BANDAI JAPAN
            </h4>
            <span className="text-xs text-amber-300 font-bold">6 BIỂU TƯỢNG VIỀN SÁT</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Kamen Rider Saber', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_saber_logo_by_driftingcar_dgh9vay-pre.png', color: 'border-cyan-400/50 hover:border-cyan-400' },
              { name: 'Kamen Rider Kiva', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_kiva_logo_by_driftingcar_dg7tj5z-pre.png', color: 'border-amber-400/50 hover:border-amber-400' },
              { name: 'Team NPT Crest', logo: '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png', color: 'border-amber-400/60 hover:border-amber-300' },
              { name: 'Kamen Rider Femme', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_femme_logo_by_driftingcar_dg73lkh-pre.png', color: 'border-purple-400/50 hover:border-purple-400' },
              { name: 'Kamen Rider Revice', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png', color: 'border-rose-400/50 hover:border-rose-400' },
              { name: 'Kamen Rider Knight', logo: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_knight_logo_by_driftingcar_dg73k3x-414w-2x.png', color: 'border-slate-300/50 hover:border-slate-200' }
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`bg-[#060a16] border-2 ${item.color} p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center group transition duration-300 hover:shadow-md shadow-sm`}
              >
                <div className="w-full h-12 bg-[#030610] rounded-lg p-1 border border-white/10 flex items-center justify-center group-hover:scale-105 transition">
                  <img src={item.logo} alt={item.name} className="max-h-full max-w-full object-contain filter drop-shadow" />
                </div>
                <span className="text-[10px] font-bold text-slate-200 line-clamp-1">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Poster Showcase Art Gallery */}
        <div className="space-y-3 pt-4 border-t border-cyan-500/25">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-title font-black text-sm sm:text-base text-white uppercase flex items-center gap-2">
              <i className="fa-solid fa-scroll text-amber-400"></i> BỘ SƯU TẬP POSTER ART TOKUSATSU
            </h4>
            <span className="text-xs text-amber-300 font-bold">POSTER HOÀNG GIA</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: 'Gavv Climax Arc', image: '/Bộ Sưu Tập Poster Dọc/brand-new-official-poster-for-gavvs-latest-arc-v0-tgav2jhk04te1.webp' },
              { title: 'Gavv Poppin Gummy', image: '/Bộ Sưu Tập Poster Dọc/new-gavv-poster-v0-48h4kp8apa8e1.webp' },
              { title: 'Grease Kingdom', image: '/Bộ Sưu Tập Poster Dọc/greaseposter.webp' },
              { title: 'All Stars Generation', image: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg' },
              { title: 'Ultra HD Limited', image: '/Bộ Sưu Tập Poster Dọc/3yya7pw1zck91.jpg' },
              { title: 'Movie Special Art', image: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/e094e508-ec72-4168-8a1d-e924fd323829.webp' }
            ].map((p, idx) => (
              <div key={idx} className="bg-[#060a16] border-2 border-cyan-500/30 hover:border-amber-400 rounded-xl overflow-hidden p-1 group transition duration-300 flex flex-col">
                <div className="h-32 bg-[#030610] rounded-lg overflow-hidden relative">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="py-1 px-1 text-center">
                  <span className="text-[10px] font-bold text-slate-200 line-clamp-1">{p.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
