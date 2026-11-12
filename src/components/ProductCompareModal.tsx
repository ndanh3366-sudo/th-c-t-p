import React from 'react';
import { Product } from '../types';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onAddToCart: (p: Product) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  compareList,
  onRemoveFromCompare,
  onAddToCart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#080e1e] border-2 border-cyan-500/40 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-[#F5F2EB] ring-1 ring-cyan-400/20">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-cyan-500/30 flex items-center justify-between bg-[#060b18]">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-widest block">Rider Spec Comparison Matrix</span>
            <h3 className="font-serif-title text-xl font-bold uppercase text-white">
              SO SÁNH <span className="aqua-gradient-text">SẢN PHẨM RIDER ({compareList.length}/3)</span>
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0d162d] border border-cyan-500/30 hover:bg-cyan-900/60 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-6">
          {compareList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <i className="fa-solid fa-code-compare text-4xl block text-cyan-400/40 mb-2"></i>
              <p className="text-base font-bold text-white">Chưa có sản phẩm nào trong danh sách so sánh</p>
              <p className="text-xs text-slate-300">Bấm biểu tượng "So sánh" ở bất kỳ sản phẩm nào ngoài Cửa hàng để so sánh chi tiết!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-cyan-500/30">
                    <th className="p-3 w-40 text-cyan-300 uppercase font-bold bg-[#060b18]">Thông Số / Chi Tiết</th>
                    {compareList.map(p => (
                      <th key={p.id} className="p-3 min-w-[220px] align-top bg-[#070d1e]">
                        <div className="relative space-y-2">
                          <button 
                            onClick={() => onRemoveFromCompare(p.id)}
                            className="absolute top-0 right-0 text-slate-400 hover:text-rose-400 p-1 cursor-pointer transition"
                            title="Xóa khỏi danh sách"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                          <img 
                            src={p.images[0]} 
                            alt={p.name} 
                            className="w-24 h-24 object-contain p-1 rounded-xl bg-[#050914] border border-cyan-500/30 mx-auto" 
                            onError={(e) => { e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'; }}
                          />
                          <h4 className="font-bold text-white text-center text-xs line-clamp-2 h-8">{p.name}</h4>
                          <div className="text-center font-bold text-[#00f5d4] text-sm font-mono">
                            {p.price.toLocaleString('vi-VN')}đ
                          </div>
                          <button
                            onClick={() => onAddToCart(p)}
                            className="btn-cart-hover-glow w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black py-2 rounded-xl text-xs hover:brightness-110 shadow-md shadow-cyan-500/20 hover:scale-105 hover:shadow-[0_0_22px_rgba(0,245,212,0.8)] transition-all duration-200 active:scale-95 cursor-pointer"
                          >
                            <i className="fa-solid fa-cart-plus mr-1"></i> Thêm Giỏ
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/20 text-slate-200">
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Dòng Phim / Series</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3 font-bold text-cyan-300">{p.series}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Kỷ Nguyên (Era)</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3 font-semibold">{p.era}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Phân Loại</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3 uppercase font-bold text-cyan-200">{p.category}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Tình Trạng Hàng</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3 font-semibold text-emerald-400">{p.condition}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Chất Liệu</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3">{p.specifications?.material || 'ABS / PVC / Diecast'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Hiệu Ứng LED & Sound</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3">{p.specifications?.effects || 'In UV sắc nét / Đèn LED & Âm Thanh'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Loại Pin</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3 font-mono">{p.specifications?.batteryType || 'Không dùng pin'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Năm Phát Hành</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3 font-mono font-bold text-cyan-300">{p.specifications?.releaseYear || '2026'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-[#060b18] text-slate-400">Đánh Giá Collector</td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-3 text-cyan-300 font-bold">
                        ★ {p.rating} ({p.reviewCount || 120} đánh giá)
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
