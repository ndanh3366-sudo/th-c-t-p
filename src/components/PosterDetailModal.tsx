import React, { useState } from 'react';
import { PosterItem, posterToProduct } from '../data/posters';
import { Product } from '../types';
import { NeonSnowflakeIcon, NeonStarIcon, NeonGiftIcon } from './NeonAquaChristmasIcons';

export interface PosterSizeOption {
  id: 'A4' | 'A3' | 'A2' | 'A1' | 'FRAME_A2';
  name: string;
  dimensions: string;
  price: number;
  originalPrice: number;
  tag?: string;
  desc: string;
}

export const POSTER_SIZES: PosterSizeOption[] = [
  { 
    id: 'A4', 
    name: 'Khổ A4', 
    dimensions: '21 x 29.7 cm', 
    price: 65000, 
    originalPrice: 95000, 
    tag: 'Tiết kiệm', 
    desc: 'Nhỏ gọn đặt bàn làm việc / kệ sách' 
  },
  { 
    id: 'A3', 
    name: 'Khổ A3', 
    dimensions: '30 x 42 cm', 
    price: 110000, 
    originalPrice: 160000, 
    tag: 'Bán chạy', 
    desc: 'Vừa vặn treo tường góc học tập' 
  },
  { 
    id: 'A2', 
    name: 'Khổ A2', 
    dimensions: '42 x 60 cm', 
    price: 160000, 
    originalPrice: 230000, 
    tag: 'Tiêu chuẩn', 
    desc: 'Chuẩn kích thước sưu tầm quốc tế' 
  },
  { 
    id: 'A1', 
    name: 'Khổ A1', 
    dimensions: '60 x 84 cm', 
    price: 260000, 
    originalPrice: 360000, 
    tag: 'Cỡ lớn', 
    desc: 'Khổ lớn cực nét phủ kín mảng tường' 
  },
  { 
    id: 'FRAME_A2', 
    name: 'Khung Tráng Gương A2', 
    dimensions: '42 x 60 cm', 
    price: 350000, 
    originalPrice: 490000, 
    tag: 'Trọn bộ VIP', 
    desc: 'Kèm khung viền nhôm đen & kính Mica bóng' 
  }
];

interface PosterDetailModalProps {
  poster: PosterItem | null;
  onClose: () => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const PosterDetailModal: React.FC<PosterDetailModalProps> = ({
  poster,
  onClose,
  onAddToCart
}) => {
  const [selectedSizeId, setSelectedSizeId] = useState<PosterSizeOption['id']>('A2');

  if (!poster) return null;

  const currentSize = POSTER_SIZES.find(s => s.id === selectedSizeId) || POSTER_SIZES[2];
  const discountPercent = Math.round((1 - currentSize.price / currentSize.originalPrice) * 100);

  const handleAddToCartWithSize = (e: React.MouseEvent) => {
    const baseProduct = posterToProduct(poster);
    const configuredProduct: Product = {
      ...baseProduct,
      id: `${poster.id}-${currentSize.id}`,
      name: `${poster.title} [${currentSize.name} - ${currentSize.dimensions}]`,
      price: currentSize.price,
      originalPrice: currentSize.originalPrice
    };
    onAddToCart(configuredProduct, e);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0A0F1D]/98 border border-[#00F2FE]/45 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 relative shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(0,242,254,0.3)] space-y-6 text-[#E0F7FA]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#121214] border border-[#00F2FE]/40 hover:border-[#00F2FE] text-[#00F2FE] hover:text-white flex items-center justify-center transition z-20 cursor-pointer shadow-[0_0_10px_rgba(0,242,254,0.3)]"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: High Res Poster Image with Rounded Glass Frame */}
          <div className="md:col-span-6 bg-[#121214] border border-[#00F2FE]/30 rounded-2xl p-3 relative overflow-hidden group shadow-lg flex flex-col gap-2.5">
            <div className="w-full bg-[#050914] rounded-xl p-2 flex items-center justify-center">
              <img 
                src={poster.image} 
                alt={poster.title} 
                className={`w-full h-auto max-h-[480px] ${poster.id === 'poster-2' ? 'object-cover h-[480px]' : 'object-contain'} rounded-lg mx-auto shadow-2xl group-hover:scale-102 transition duration-500`}
                onError={(e) => {
                  e.currentTarget.src = '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg';
                }}
              />
            </div>
            <div 
              className="w-full bg-[#0A0F1D]/90 backdrop-blur-md p-2 rounded-xl border border-[#00F2FE]/40 text-center text-xs text-[#00F2FE] font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <i className="fa-solid fa-circle-check text-[#05FFD2]"></i>
              <span>Bản In Ultra HD 1200 DPI Toei Company & Bandai Japan</span>
            </div>
          </div>

          {/* Right Column: Specifications & Size Pricing */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="bg-[#EE4D2D] text-white font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm"
                >
                  {poster.badge}
                </span>
                <span 
                  className="bg-[#121214] text-[#00F2FE] text-[10px] font-bold px-2 py-0.5 rounded border border-[#00F2FE]/30"
                >
                  {poster.series}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <i className="fa-solid fa-truck-fast"></i> Freeship Xtra
                </span>
              </div>
              <h2 className="font-serif-title text-lg sm:text-2xl font-bold text-[#E0F7FA] leading-tight">
                {poster.title}
              </h2>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 text-xs border-y border-[#00F2FE]/20 py-2.5 bg-[#121214]/50 rounded-xl px-3">
              <div className="flex items-center gap-1 text-[#FFD700] font-bold">
                <i className="fa-solid fa-star text-xs"></i>
                <span className="text-white font-mono">{poster.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({poster.reviewCount} Đánh giá)</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="text-[#05FFD2] font-bold">
                Đã bán <strong className="text-white font-mono">{poster.soldCount}</strong> tấm
              </div>
            </div>

            {/* Dynamic Pricing Box Based on Chosen Size */}
            <div 
              className="bg-[#121214] border border-[#00F2FE]/50 p-3.5 rounded-2xl flex items-center justify-between shadow-[0_0_15px_rgba(0,242,254,0.2)]"
            >
              <div>
                <span className="text-[11px] text-slate-300 block mb-0.5">
                  Giá kích thước đang chọn: <strong className="text-[#00F2FE]">{currentSize.name} ({currentSize.dimensions})</strong>
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#00F2FE] font-mono drop-shadow-[0_0_10px_rgba(0,242,254,0.6)]">
                  {currentSize.price.toLocaleString('vi-VN')}đ
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 line-through block font-mono">
                  {currentSize.originalPrice.toLocaleString('vi-VN')}đ
                </span>
                <span className="bg-[#EE4D2D] text-white font-black text-[10px] px-2 py-0.5 rounded shadow">
                  Tiết kiệm {discountPercent}%
                </span>
              </div>
            </div>

            {/* Size Options Selector - Every Size has its Own Price */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#E0F7FA] uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-crop-simple text-[#00F2FE]"></i>
                  <span>Chọn Kích Thước Khổ In (Mỗi Khổ 1 Giá):</span>
                </label>
                <span className="text-[10px] text-[#FFD700] font-mono">
                  {currentSize.name}: {currentSize.price.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POSTER_SIZES.map((s) => {
                  const isSelected = selectedSizeId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSizeId(s.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#00F2FE] bg-[#00F2FE]/15 text-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.35)] ring-1 ring-[#00F2FE]'
                          : 'border-[#00F2FE]/25 bg-[#121214] text-slate-300 hover:border-[#00F2FE]/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold">{s.name}</span>
                        {s.tag && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${isSelected ? 'bg-[#00F2FE] text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {s.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.dimensions}</div>
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800">
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{s.desc}</span>
                        <strong className="text-xs font-mono font-black text-[#05FFD2]">
                          {s.price.toLocaleString('vi-VN')}đ
                        </strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paper Quality Spec */}
            <div className="space-y-1.5 text-xs text-slate-300 bg-[#121214] p-3 rounded-2xl border border-[#00F2FE]/25">
              <div className="flex items-center gap-1.5 text-[#00F2FE] font-bold border-b border-slate-800 pb-1.5 text-xs">
                <i className="fa-solid fa-scroll"></i>
                <span>Quy Cách In & Đóng Gói Tokusatsu</span>
              </div>
              <ul className="space-y-1 text-[11px] pt-0.5 text-slate-300">
                <li>• <strong>Chất liệu giấy:</strong> Giấy Coucher Glossy 300gsm dày dặn phủ UV Nano bóng</li>
                <li>• <strong>Độ bền màu:</strong> Chống ẩm, chống bay màu lên đến 15 năm</li>
                <li>• <strong>Đóng gói:</strong> Đóng ống Carton cứng bọc xốp chống sốc, cam kết 100% không gãy gập</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-1">
              <button
                onClick={handleAddToCartWithSize}
                className="w-full py-3.5 bg-gradient-to-r from-[#00F2FE] via-[#05FFD2] to-[#00F2FE] hover:brightness-110 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(0,242,254,0.5)] hover:shadow-[0_0_30px_rgba(5,255,210,0.85)] transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-cart-plus text-base"></i>
                <span>Thêm Vào Giỏ — {currentSize.name} ({currentSize.price.toLocaleString('vi-VN')}đ)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
