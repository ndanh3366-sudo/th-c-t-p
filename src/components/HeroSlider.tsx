import React, { useState, useEffect, useRef } from 'react';
import { NeonTreeIcon, NeonReindeerIcon, NeonSnowflakeIcon, NeonStarIcon } from './NeonAquaChristmasIcons';

interface BannerSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
  iconType: 'tree' | 'globe' | 'belt' | 'rider';
}

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  const bannerSlides: BannerSlide[] = [
    {
      id: 'banner-csm',
      image: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/KR_CSM_Banner.webp',
      title: 'SIÊU PHẨM CSM & DX HENSHIN BELT HOÀNG GIA',
      subtitle: 'Đai biến hình Rider huyền thoại Bandai Japan bản quyền - Đỉnh cao sưu tầm Tokusatsu',
      tag: 'CSM & DX EXCLUSIVE',
      iconType: 'belt'
    },
    {
      id: 'banner-gotchard-gavv',
      image: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg',
      title: 'HIỆP SĨ MẶT NẠ - SIÊU PHẨM BANDAI JAPAN',
      subtitle: 'Bộ sưu tập đai biến hình DX & CSM chính hãng đầy đủ các kỉ nguyên Showa, Heisei & Reiwa',
      tag: 'NPT STORE OFFICIAL',
      iconType: 'rider'
    },
    {
      id: 'banner-shf-figurine',
      image: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/e094e508-ec72-4168-8a1d-e924fd323829.webp',
      title: 'S.H.FIGUARTS & MÔ HÌNH NGHỆ THUẬT CAO CẤP',
      subtitle: 'Từng chi tiết chế tác tinh xảo - Khớp cử động linh hoạt bản quyền Bandai Japan 100%',
      tag: 'LIMITED EDITION BANDAI',
      iconType: 'globe'
    },
    {
      id: 'banner-family-tokusatsu',
      image: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/hiep-si-mat-na-gia-dinh-sieu-pham-fpt-play-1727665332423_Landscape.jpg',
      title: 'HIỆP SĨ MẶT NẠ GIA ĐÌNH SIÊU PHẨM',
      subtitle: 'Tích điểm Rider Points - Săn Deal Chớp Nhoáng & Freeship Xtra',
      tag: 'FREESHIP XTRA & ĐỔI QUÀ',
      iconType: 'tree'
    }
  ];

  // Preload all banner images in background for zero-latency slide swaps
  useEffect(() => {
    bannerSlides.forEach(slide => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
      }
    }, 5500);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const current = bannerSlides[currentSlide];

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#0A0F1D] group border-2 border-[#00F2FE]/45 shadow-[0_0_35px_rgba(0,242,254,0.3)] hover:border-[#05FFD2] transition-all duration-300 rounded-3xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Neon Angular Corner Brackets */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-30 border-t-2 border-r-2 border-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none z-30 border-b-2 border-l-2 border-[#00F2FE] drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]" />

      {/* Container Frame - Chuẩn Khung Banner Góc Cạnh & Tinh Thể Băng */}
      <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[580px] flex items-center justify-center bg-[#070b16] nostalgic-scanline overflow-hidden">
        
        {/* Hardware-accelerated Cross-fading Slides */}
        {bannerSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out will-change-transform ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Ambient blurred glow layer */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img 
                  src={slide.image} 
                  alt="" 
                  className="w-full h-full object-cover filter blur-3xl opacity-30 transform scale-110"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-[#0A0F1D]/80"></div>
              </div>

              {/* Main Banner Image */}
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover shadow-2xl transition-transform duration-700 transform group-hover:scale-105"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg';
                }}
              />
              
              {/* Scrim Overlay for Perfect Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/55 to-transparent pointer-events-none"></div>
            </div>
          );
        })}

        {/* Top Floating Tag with Line-Art Icons */}
        <div className="absolute top-4 left-4 sm:left-6 z-20 flex items-center gap-2.5 pointer-events-none">
          <div 
            className="bg-[#0A0F1D]/90 backdrop-blur-md px-3.5 py-1.5 border border-[#00F2FE]/60 shadow-[0_0_15px_rgba(0,242,254,0.35)] flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00F2FE] rounded-lg"
          >
            {current.iconType === 'tree' ? (
              <NeonTreeIcon size={16} />
            ) : current.iconType === 'globe' ? (
              <NeonSnowflakeIcon size={16} />
            ) : (
              <NeonStarIcon size={16} />
            )}
            <span className="text-[#E0F7FA]">{current.tag}</span>
            <span className="w-1.5 h-1.5 bg-[#05FFD2] rounded-full animate-ping ml-1" />
          </div>

          <div 
            className="bg-[#121214]/90 backdrop-blur-md text-[#E0F7FA] text-xs font-mono font-bold px-3 py-1.5 border border-[#00F2FE]/30 shadow-md hidden sm:flex items-center gap-1.5 rounded-lg"
          >
            <span className="text-[#00F2FE]">0{currentSlide + 1}</span>
            <span className="text-slate-500">/</span>
            <span>0{bannerSlides.length}</span>
          </div>
        </div>

        {/* Bottom Banner Title Overlay - Angular Glassmorphism Sheet */}
        <div 
          className="absolute bottom-5 left-4 sm:left-6 right-16 sm:right-32 z-20 bg-[#0A0F1D]/88 backdrop-blur-xl p-4 sm:p-6 border border-[#00F2FE]/45 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.2)] space-y-2 transition-all duration-300 rounded-2xl"
        >
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#00F2FE] font-mono uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1">
              <NeonReindeerIcon size={14} />
              <span>BANDAI JAPAN TOKUSATSU</span>
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-[#FFD700] flex items-center gap-1">
              <NeonStarIcon size={12} />
              <span>HOLIDAY SPECIAL 2026</span>
            </span>
          </div>

          <h3 className="font-serif-title text-base sm:text-2xl font-black text-[#E0F7FA] uppercase tracking-wide leading-tight drop-shadow-md">
            {current.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-medium line-clamp-1 leading-normal">
            {current.subtitle}
          </p>
        </div>

        {/* Angular Navigation Arrows with Intense Aqua Neon Glow */}
        <button 
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-[#0A0F1D]/90 hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#0A0F1D] border border-[#00F2FE]/50 hover:border-[#05FFD2] flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.8)] active:scale-95 cursor-pointer rounded-full"
          aria-label="Previous Banner"
        >
          <i className="fa-solid fa-chevron-left text-sm sm:text-base"></i>
        </button>

        <button 
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-[#0A0F1D]/90 hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#0A0F1D] border border-[#00F2FE]/50 hover:border-[#05FFD2] flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.8)] active:scale-95 cursor-pointer rounded-full"
          aria-label="Next Banner"
        >
          <i className="fa-solid fa-chevron-right text-sm sm:text-base"></i>
        </button>

        {/* Angular Slide Indicators */}
        <div 
          className="absolute bottom-5 right-4 z-20 hidden sm:flex items-center gap-2 bg-[#0A0F1D]/90 backdrop-blur-md px-3.5 py-2 border border-[#00F2FE]/40 shadow-lg rounded-full"
        >
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 transition-all duration-300 cursor-pointer rounded-full ${
                index === currentSlide 
                  ? 'w-7 bg-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.9)]' 
                  : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
