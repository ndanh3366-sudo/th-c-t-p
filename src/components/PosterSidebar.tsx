import React from 'react';
import { PosterItem } from '../data/posters';
import { PosterCard } from './PosterCard';
import { Product } from '../types';

interface PosterSidebarProps {
  posters: PosterItem[];
  onSelectPoster: (poster: PosterItem) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  posterToProductMap: (poster: PosterItem) => Product;
}

export const PosterSidebar: React.FC<PosterSidebarProps> = ({
  posters,
  onSelectPoster,
  onAddToCart,
  posterToProductMap
}) => {
  return (
    <div className="space-y-4">
      {/* Header Banner for Left Poster Column */}
      <div className="bg-[#1A1A1A] metallic-sheen border border-[#C9A84C]/50 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C9A84C] text-[#0A0A0A] flex items-center justify-center font-black text-xs">
              <i className="fa-solid fa-scroll"></i>
            </div>
            <div>
              <h3 className="font-serif-title text-sm font-bold text-[#F5F2EB]">
                POSTER <span className="gold-gradient-text">TRANG CHỦ</span>
              </h3>
              <p className="text-[10px] text-gray-400">Viền sản phẩm chính hãng</p>
            </div>
          </div>
          <span className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[9px] font-bold px-2 py-0.5 rounded-full">
            {posters.length} Poster
          </span>
        </div>

        <p className="text-[11px] text-gray-300 leading-snug">
          Bộ sưu tập Poster Kamen Rider in siêu nét khép kín kéo dài xuống tận chuyên mục Tin Tức.
        </p>
      </div>

      {/* Vertical Stack of Poster Cards */}
      <div className="flex flex-col gap-4">
        {posters.map((poster) => (
          <PosterCard
            key={poster.id}
            poster={poster}
            onSelectPoster={onSelectPoster}
            onAddToCart={onAddToCart}
            posterToProductMap={posterToProductMap}
          />
        ))}
      </div>
    </div>
  );
};
