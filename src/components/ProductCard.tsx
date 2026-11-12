import React from 'react';
import { Product } from '../types';
import { playLaserClashSound, playHenshinSound } from '../utils/sound';
import { NeonTreeIcon, NeonSnowflakeIcon, NeonStarIcon } from './NeonAquaChristmasIcons';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onAddToCompare?: (product: Product, e: React.MouseEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard = React.memo<ProductCardProps>(({ 
  product, 
  onSelect, 
  onAddToCart, 
  onAddToCompare,
  isFavorite = false,
  onToggleFavorite
}) => {
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  // Real-time simulated viewers count for dynamic feel (based on product ID)
  const viewersCount = React.useMemo(() => {
    const hash = product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (hash % 18) + 8;
  }, [product.id]);

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-[#0A0F1D]/95 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 ease-out flex flex-col cursor-pointer relative border border-[#00F2FE]/40 hover:border-[#00F2FE] shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(0,242,254,0.45)] transform hover:-translate-y-1.5 product-card-container"
    >
      {/* Decorative High-Tech Neon Corner Notches */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FFD700] pointer-events-none z-20 opacity-80 group-hover:opacity-100 drop-shadow-[0_0_6px_#FFD700] rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00F2FE] pointer-events-none z-20 opacity-80 group-hover:opacity-100 drop-shadow-[0_0_6px_#00F2FE] rounded-bl-2xl" />

      {/* Glossy Sheen Sweep on Card Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#00F2FE]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>

      {/* Image Container: Ảnh sản phẩm được phóng to tối đa, tràn viền đẹp mắt nhưng 100% trọn vẹn nhờ object-contain & p-1.5 sm:p-2.5 */}
      <div className="relative aspect-square sm:aspect-[4/4] w-full bg-[#050814] overflow-hidden flex items-center justify-center p-1.5 sm:p-2.5 border-b border-[#00F2FE]/25">
        {/* Subtle Ambient Radial Glow behind the Toy */}
        <div className="absolute inset-0 bg-radial from-[#00F2FE]/15 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Primary Image - Phóng to tối đa nhưng trọn vẹn 100% không bị che góc hay mất chi tiết */}
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className={`w-full h-full object-contain filter drop-shadow-[0_6px_22px_rgba(0,0,0,0.85)] transition-all duration-300 ease-out ${
            product.images[1] && product.images[1] !== product.images[0]
              ? 'group-hover:opacity-0 group-hover:scale-103' 
              : 'group-hover:scale-103'
          }`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg';
          }}
        />

        {/* Secondary Hover Image (if available) */}
        {product.images[1] && product.images[1] !== product.images[0] && (
          <img 
            src={product.images[1]} 
            alt={`${product.name} alternate view`} 
            className="absolute inset-0 m-auto w-full h-full object-contain p-1.5 sm:p-2.5 opacity-0 group-hover:opacity-100 group-hover:scale-103 transition-all duration-300 ease-out filter drop-shadow-[0_6px_22px_rgba(0,0,0,0.85)]"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Control & Badge Bar: Nằm ngay dưới ảnh, tuyệt đối không che ảnh */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1 bg-[#070b16]/60 border-b border-[#00F2FE]/15 z-20">
        <div className="flex items-center gap-1.5 pointer-events-none">
          <span className="bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/50 text-[9px] font-black px-2 py-0.5 tracking-wider uppercase rounded-sm shadow-sm flex items-center gap-1">
            <i className="fa-solid fa-certificate text-[8px]"></i>
            Bandai Japan
          </span>
          {discountPercent > 0 && (
            <span className="bg-[#EE4D2D] text-white font-black text-[9px] px-1.5 py-0.5 rounded-sm shadow-sm animate-pulse">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick Actions (Sound, Favorite, Compare) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (product.category === 'csm' || product.isCSM) {
                playHenshinSound();
              } else {
                playLaserClashSound();
              }
            }}
            className="w-6 h-6 flex items-center justify-center transition shadow-sm bg-[#0A0F1D] text-[#00F2FE] hover:text-white hover:bg-[#00F2FE]/30 border border-[#00F2FE]/40 hover:border-[#00F2FE] active:scale-90 cursor-pointer rounded-full"
            title="Nghe âm thanh Henshin mẫu"
          >
            <i className="fa-solid fa-volume-high text-[9px]"></i>
          </button>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => onToggleFavorite(product, e)}
              className={`w-6 h-6 flex items-center justify-center transition shadow-sm cursor-pointer rounded-full ${
                isFavorite 
                  ? 'bg-rose-600 text-white border border-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' 
                  : 'bg-[#0A0F1D] text-slate-300 hover:text-rose-400 border border-[#00F2FE]/40 hover:border-rose-400'
              }`}
              title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            >
              <i className="fa-solid fa-heart text-[9px]"></i>
            </button>
          )}

          {onAddToCompare && (
            <button
              type="button"
              onClick={(e) => onAddToCompare(product, e)}
              className="w-6 h-6 flex items-center justify-center transition shadow-sm bg-[#0A0F1D] text-slate-300 hover:text-[#00F2FE] border border-[#00F2FE]/40 hover:border-[#00F2FE] cursor-pointer rounded-full"
              title="So sánh"
            >
              <i className="fa-solid fa-code-compare text-[9px]"></i>
            </button>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          {/* Badge Row (Nằm ngoài ảnh, không che ảnh) */}
          <div className="flex flex-wrap items-center gap-1">
            {product.isFlashSale && (
              <span className="bg-[#EE4D2D]/20 text-[#EE4D2D] text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider border border-[#EE4D2D]/50 rounded-sm">
                ⚡ FLASH SALE
              </span>
            )}
            {product.isHot && (
              <span className="bg-[#00F2FE]/15 text-[#00F2FE] text-[8px] font-bold px-1.5 py-0.5 border border-[#00F2FE]/40 rounded-sm flex items-center gap-0.5">
                <NeonTreeIcon size={9} />
                <span>Hot</span>
              </span>
            )}
            {product.isCSM && (
              <span className="bg-[#FFD700]/20 text-[#FFD700] text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider border border-[#FFD700]/50 rounded-sm">
                CSM HOÀNG GIA
              </span>
            )}
            <span className="text-[9px] text-slate-400 font-mono ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05FFD2] animate-ping" />
              <span>{viewersCount} đang xem</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#00F2FE] font-bold truncate max-w-[130px] uppercase tracking-wider drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]">
              {product.series}
            </span>
            <span className="text-[#E0F7FA] text-[10px] bg-[#121214] border border-[#00F2FE]/30 px-2 py-0.5 font-medium rounded-sm">
              {product.condition}
            </span>
          </div>

          <h3 className="font-extrabold text-sm sm:text-[15px] text-[#E0F7FA] group-hover:text-[#00F2FE] line-clamp-2 transition duration-200 leading-snug drop-shadow-sm">
            {product.name}
          </h3>

          {/* Social Proof */}
          <div className="flex items-center justify-between text-xs pt-0.5 text-slate-300">
            <div className="flex items-center gap-1 text-[#FFD700]">
              <NeonStarIcon size={12} />
              <span className="font-bold text-[#E0F7FA]">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
            </div>
            <div className="text-[#05FFD2] text-xs font-semibold flex items-center gap-1">
              <NeonSnowflakeIcon size={11} />
              <span>Đã bán {product.soldCount || 120}</span>
            </div>
          </div>
        </div>

        {/* Flash Sale Progress bar if active */}
        {product.isFlashSale && product.flashSaleStock && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-300 font-medium">
              <span className="text-rose-400 font-bold">⚡ Sắp hết hàng</span>
              <span>Còn: {product.flashSaleStock}</span>
            </div>
            <div className="w-full bg-[#121214] h-1.5 overflow-hidden border border-[#00F2FE]/30 rounded-full">
              <div 
                className="bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] h-full shadow-[0_0_8px_#00F2FE] rounded-full"
                style={{ width: `${Math.min(100, (product.flashSaleStock / 30) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-2.5 border-t border-[#00F2FE]/25 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#00F2FE] font-mono tracking-tight drop-shadow-[0_0_10px_rgba(0,242,254,0.6)]">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-mono">
                {product.originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          <button 
            onClick={(e) => onAddToCart(product, e)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] hover:brightness-110 text-slate-950 font-black shadow-[0_0_15px_rgba(0,242,254,0.5)] hover:shadow-[0_0_25px_rgba(5,255,210,0.9)] hover:scale-105 flex items-center gap-1.5 text-xs sm:text-sm transition-all duration-200 active:scale-95 cursor-pointer rounded-full"
            title="Thêm vào giỏ hàng"
          >
            <i className="fa-solid fa-cart-plus text-xs"></i>
            <span>Mua</span>
          </button>
        </div>
      </div>
    </div>
  );
});
