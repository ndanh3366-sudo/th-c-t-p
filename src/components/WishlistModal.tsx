import React from 'react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (product: Product, e?: React.MouseEvent) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
  onClearWishlist: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
  onClearWishlist,
  showToast
}) => {
  if (!isOpen) return null;

  const handleAddAllToCart = () => {
    wishlistProducts.forEach(product => {
      onAddToCart(product);
    });
    showToast(`🛒 Đã chuyển tất cả ${wishlistProducts.length} sản phẩm yêu thích vào Giỏ Hàng!`, 'success');
  };

  const handleShareWishlist = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Đã sao chép liên kết Danh Sách Yêu Thích Rider!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#141414] border border-[#C9A84C]/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative laser-scan-line">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#2A2A2A] flex items-center justify-between bg-gradient-to-r from-[#1A1A1A] via-[#222222] to-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-950/60 border border-rose-600/50 flex items-center justify-center text-rose-500 shadow-lg">
              <i className="fa-solid fa-heart text-lg animate-pulse"></i>
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#F5F2EB] flex items-center gap-2">
                Danh Sách Yêu Thích Rider
                <span className="bg-rose-600 text-white text-xs font-mono font-extrabold px-2 py-0.5 rounded-full">
                  {wishlistProducts.length}
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Lưu trữ những đai biến hình, vũ khí & mô hình Bandai bạn mong muốn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Action Bar */}
        {wishlistProducts.length > 0 && (
          <div className="px-6 py-2.5 bg-[#0D0D0D] border-b border-[#2A2A2A] flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={handleShareWishlist}
              className="text-[#C9A84C] hover:underline flex items-center gap-1.5 font-semibold"
            >
              <i className="fa-solid fa-share-nodes"></i> Chia sẻ danh sách
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddAllToCart}
                className="btn-cart-gold-glow bg-[#C9A84C] hover:bg-[#dfba5c] text-black font-extrabold px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(201,168,76,0.75)] active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <i className="fa-solid fa-cart-arrow-down"></i> Thêm tất cả vào giỏ
              </button>
              <button
                onClick={onClearWishlist}
                className="text-gray-400 hover:text-rose-400 transition"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-gray-600 text-3xl">
                <i className="fa-regular fa-heart"></i>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#F5F2EB] text-base">Danh sách yêu thích đang trống!</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Hãy bấm vào biểu tượng trái tim ❤️ ở bất kỳ đai DX, CSM hay mô hình nào để lưu lại danh sách riêng của bạn.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#8B1E1E] text-black font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition"
              >
                Khám Phá Sản Phẩm Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C]/50 rounded-2xl p-3.5 flex gap-3.5 items-center group relative transition shadow-md"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-20 h-20 rounded-xl object-contain p-1 bg-[#0D0D0D] border border-[#2A2A2A] cursor-pointer group-hover:scale-105 transition"
                    onError={(e) => {
                      e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg';
                    }}
                  />

                  <div className="flex-grow min-w-0 space-y-1">
                    <span className="text-[10px] text-[#C9A84C] font-semibold block truncate">
                      {product.series}
                    </span>
                    <h4
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="font-bold text-xs text-[#F5F2EB] hover:text-[#C9A84C] truncate cursor-pointer transition"
                    >
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-xs font-black text-[#C9A84C]">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] text-gray-500 line-through">
                          {product.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>

                    {/* Action buttons inside card */}
                    <div className="pt-1.5 flex items-center gap-2">
                      <button
                        onClick={(e) => onAddToCart(product, e)}
                        className="btn-cart-gold-glow bg-[#222222] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-black border border-[#2A2A2A] hover:border-[#C9A84C] px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_16px_rgba(201,168,76,0.75)] active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-cart-plus"></i> Thêm Giỏ
                      </button>
                      <button
                        onClick={(e) => onRemoveFromWishlist(product, e)}
                        className="text-gray-500 hover:text-rose-500 p-1 text-xs transition"
                        title="Xóa khỏi yêu thích"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#0D0D0D] flex items-center justify-between text-xs text-gray-400">
          <span>Tổng số lượng thích: <strong className="text-rose-400">{wishlistProducts.length} món</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#222222] hover:bg-[#2A2A2A] text-white font-bold rounded-xl transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
