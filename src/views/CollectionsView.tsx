import React, { useState } from 'react';
import { Product, EraType } from '../types';
import { ProductCard } from '../components/ProductCard';

interface CollectionsViewProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
  onAddToCompare?: (p: Product, e: React.MouseEvent) => void;
  wishlistIds?: string[];
  onToggleFavorite?: (p: Product, e?: React.MouseEvent) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onAddToCompare,
  wishlistIds = [],
  onToggleFavorite
}) => {
  const [activeEra, setActiveEra] = useState<EraType>('Reiwa');

  const showaCount = products.filter(p => p.era === 'Showa').length;
  const heiseiCount = products.filter(p => p.era === 'Heisei').length;
  const reiwaCount = products.filter(p => p.era === 'Reiwa').length;

  const eras = [
    {
      id: 'Reiwa' as EraType,
      kanji: '令和',
      title: 'Kỷ Nguyên Reiwa (2019 — Nay)',
      riders: 'Zero-One, Saber, Revice, Geats, Gotchard, Gavv & Zeztz',
      desc: 'Thời đại của sự bùng nổ công nghệ vị lai, đai Henshin Belt tích hợp âm thanh chất lượng phòng thu, màn hình LED ma trận, thẻ bài Ride Chemy Cards và cơ chế nhai kẹo Gochizo độc bản.',
      count: reiwaCount,
      icon: 'fa-microchip'
    },
    {
      id: 'Heisei' as EraType,
      kanji: '平成',
      title: 'Kỷ Nguyên Heisei (2000 — 2019)',
      riders: 'Kuuga, Faiz 555, Kabuto, Decade, W, OOO, Build, Zi-O',
      desc: 'Kỷ nguyên vàng son in sâu trong tâm trí hàng triệu người hâm mộ Việt Nam: Tiếng gõ bàn phím Standing By của Faiz Phone, Clock Up của Kabuto, và âm thanh Henshin bất hủ qua từng đĩa phim VCD/DVD tuổi thơ.',
      count: heiseiCount,
      icon: 'fa-compact-disc'
    },
    {
      id: 'Showa' as EraType,
      kanji: '昭和',
      title: 'Kỷ Nguyên Showa (1971 — 1989)',
      riders: 'Ichigo, Nigo, V3, Riderman, X, Amazon, Stronger, Black, Black RX',
      desc: 'Những chiến binh công lý tiên phong khai mở huyền thoại Kamen Rider toàn cầu. Thiết kế tối giản, uy lực cùng đai bão Typhoon và Kingstone vĩnh cửu.',
      count: showaCount,
      icon: 'fa-motorcycle'
    }
  ];

  const eraInfo = eras.find(e => e.id === activeEra)!;
  const eraProducts = products.filter(p => p.era === activeEra);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F5F2EB]">
      {/* Header */}
      <div className="border-b border-cyan-500/25 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs uppercase font-extrabold text-cyan-300 tracking-widest">HÀNH TRÌNH 50+ NĂM LỊCH SỬ</span>
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-white text-pop">
          Bộ Sưu Tập Theo <span className="aqua-gradient-text">KỶ NGUYÊN KAMEN RIDER</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Lưu giữ trọn vẹn di sản Tokusatsu huyền thoại qua các dòng sản phẩm DX, CSM và S.H.Figuarts
        </p>
      </div>

      {/* Era Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {eras.map(e => {
          const isSelected = activeEra === e.id;
          return (
            <button
              key={e.id}
              onClick={() => setActiveEra(e.id)}
              className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0c1a36] to-[#060e22] border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.25)] scale-[1.01]'
                  : 'bg-[#080e1e] border-cyan-500/25 text-slate-300 hover:border-cyan-400/60 hover:bg-[#0c162e]'
              }`}
            >
              <div className="absolute right-3 -bottom-2 text-6xl font-black text-cyan-400/5 select-none pointer-events-none">
                {e.kanji}
              </div>

              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {e.kanji} · {e.id}
                  </span>
                  <span className="text-xs font-bold text-cyan-300">
                    {e.count} Sản Phẩm
                  </span>
                </div>

                <h3 className="font-serif-title text-base font-black text-white">
                  {e.title}
                </h3>
                <p className="text-[11px] text-cyan-200/80 font-medium line-clamp-1">
                  {e.riders}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Era Banner */}
      <div className="bg-gradient-to-r from-[#070e20] via-[#0b1736] to-[#070e20] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-[#00f5d4] border border-cyan-400/60 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              {eraInfo.kanji} • {eraInfo.id} Era Highlight
            </span>
          </div>

          <h3 className="font-serif-title text-2xl sm:text-3xl font-black text-white text-pop">
            {eraInfo.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl font-medium">
            {eraInfo.desc}
          </p>

          <p className="text-xs text-cyan-300 font-bold pt-1">
            <i className="fa-solid fa-mask mr-1.5"></i>
            {eraInfo.riders}
          </p>
        </div>
      </div>

      {/* Era Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <h4 className="font-serif-title text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Sản Phẩm Kỷ Nguyên {eraInfo.id}</span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full">
              {eraProducts.length}
            </span>
          </h4>
        </div>

        {eraProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-[#080e1e] border border-cyan-500/30 rounded-2xl p-6">
            <p>Đang cập nhật thêm sản phẩm kỷ nguyên này...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {eraProducts.map(p => (
              <ProductCard 
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
                onAddToCompare={onAddToCompare}
                isFavorite={wishlistIds.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
