import React from 'react';
import { PosterItem } from '../data/posters';
import { Product } from '../types';

interface PosterCardProps {
  poster: PosterItem;
  onSelectPoster: (poster: PosterItem) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  posterToProductMap: (poster: PosterItem) => Product;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  poster,
  onSelectPoster,
  onAddToCart,
  posterToProductMap
}) => {
  const discountPercent = poster.originalPrice && poster.originalPrice > poster.price
    ? Math.round((1 - poster.price / poster.originalPrice) * 100)
    : 0;

  const product = posterToProductMap(poster);

  const isEven = parseInt(poster.id.replace(/\D/g, '') || '0') % 2 === 0;

  return (
    <div 
      onClick={() => onSelectPoster(poster)}
      className="group bg-[#080e1e] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer relative border border-cyan-500/35 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,245,212,0.25)] transform hover:-translate-y-1 aqua-glossy-card product-card-container"
    >
      {/* Elongated Full-Frame Vertical Poster Image */}
      <div className="relative aspect-[2/3] w-full bg-[#050914] overflow-hidden flex items-center justify-center rounded-t-2xl border-b border-cyan-500/25 nostalgic-scanline">
        <img 
          src={poster.image} 
          alt={poster.title} 
          className={`w-full h-full ${poster.id === 'poster-2' ? 'object-cover p-0' : 'object-contain p-1'} rounded-t-2xl group-hover:scale-102 transition-all duration-500 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg';
          }}
        />

        {/* Shimmer Sweep Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

        {/* Poster Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span className="bg-[#00f5d4] text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-cyan-300">
            {poster.badge}
          </span>
          <span className="bg-[#050914]/85 backdrop-blur-md text-slate-200 text-[8px] font-mono px-2 py-0.5 rounded-md border border-cyan-500/30">
            {poster.dimensions}
          </span>
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md border border-rose-400 shadow-md z-10">
            -{discountPercent}%
          </div>
        )}

        {/* Quick View Hover Button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2 pointer-events-none">
          <span className="bg-gradient-to-r from-[#00f5d4] to-cyan-400 text-slate-950 font-black text-[11px] px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition duration-300">
            <i className="fa-solid fa-expand text-[10px]"></i> Zoom Poster
          </span>
        </div>
      </div>

      {/* Poster Details Body */}
      <div className="p-3.5 flex-grow flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-cyan-300 font-bold truncate max-w-[130px] uppercase tracking-wide">{poster.series}</span>
            <span className="text-slate-300 font-mono text-[9px] bg-[#060b18] px-1.5 py-0.5 rounded border border-cyan-500/30">BANDAI</span>
          </div>

          <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 line-clamp-1 transition leading-snug">
            {poster.title}
          </h4>

          {/* Paper Spec Tag */}
          <p className="text-[10px] text-slate-400 line-clamp-1 italic">
            {poster.paperType}
          </p>
        </div>

        {/* Social Proof & Price */}
        <div className="space-y-2 pt-1 border-t border-cyan-500/20">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1 text-cyan-400 font-bold">
              <i className="fa-solid fa-star text-[9px]"></i>
              <span className="text-white">{poster.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({poster.reviewCount})</span>
            </div>
            <span className="text-emerald-400 font-medium text-[9px]">
              Đã bán {poster.soldCount}
            </span>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <div>
              <div className="text-[10px] text-slate-400">Từ khổ A4:</div>
              <div className="text-xs font-black text-[#00F2FE] font-mono">
                65.000đ <span className="text-[9px] text-slate-400 font-normal">~ 350k</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, e);
              }}
              className="btn-cart-hover-glow px-3 py-1.5 bg-gradient-to-r from-[#00f5d4] to-cyan-400 hover:brightness-110 text-slate-950 font-black text-[10px] rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,245,212,0.85)] active:scale-95 flex items-center gap-1 shadow-md cursor-pointer"
              title="Thêm Poster vào giỏ hàng"
            >
              <i className="fa-solid fa-cart-shopping text-[9px]"></i> Mua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
