import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOpenCheckout: (appliedCoupon?: Coupon, pointsUsed?: number) => void;
  coupons: Coupon[];
  userPoints?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onOpenCheckout,
  coupons,
  userPoints = 0
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Calculate voucher discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      couponDiscount = (subtotal * appliedCoupon.value) / 100;
    } else {
      couponDiscount = appliedCoupon.value;
    }
  }



  // Calculate Points discount (1 point = 1,000 VND)
  const pointsDiscount = usePoints ? Math.min(subtotal - couponDiscount, userPoints * 1000) : 0;
  const pointsUsedCount = usePoints ? pointsDiscount / 1000 : 0;

  const total = Math.max(0, subtotal - couponDiscount - pointsDiscount);
  const freeShipThreshold = 1000000;
  const remainingForFreeShip = Math.max(0, freeShipThreshold - subtotal);

  const handleApplyCoupon = () => {
    const codeClean = couponCode.trim().toUpperCase();
    if (!codeClean) return;
    const found = coupons.find(c => c.code === codeClean);
    if (!found) {
      setCouponMsg({ text: 'Mã voucher không hợp lệ hoặc đã hết hạn!', isError: true });
      return;
    }
    if (subtotal < found.minOrder) {
      setCouponMsg({ text: `Đơn hàng cần tối thiểu ${found.minOrder.toLocaleString('vi-VN')}đ để dùng mã này!`, isError: true });
      return;
    }
    setAppliedCoupon(found);
    setCouponCode('');
    setCouponMsg({ text: `Áp dụng thành công mã giảm [${found.code}]!`, isError: false });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      ></div>

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#080e1e] border-l border-cyan-500/40 shadow-2xl flex flex-col text-xs text-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-cyan-500/30 flex items-center justify-between bg-[#060a16]">
            <h3 className="font-serif-title text-base sm:text-lg font-bold flex items-center gap-2 text-white">
              <i className="fa-solid fa-bag-shopping text-[#00f5d4]"></i> Giỏ Hàng Rider ({cartItems.length})
            </h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#0d162d] text-slate-300 hover:text-white hover:bg-cyan-900/60 border border-cyan-500/30 flex items-center justify-center transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Free Shipping Gauge */}
          <div className="bg-[#050914] p-3 px-5 border-b border-cyan-500/25 text-[11px]">
            {remainingForFreeShip > 0 ? (
              <p className="text-slate-300">
                Mua thêm <strong className="text-[#00f5d4]">{remainingForFreeShip.toLocaleString('vi-VN')}đ</strong> để được <strong className="text-emerald-400">Miễn Phí Vận Chuyển</strong>
              </p>
            ) : (
              <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check"></i> Đơn hàng của bạn đã đủ điều kiện Freeship Toàn Quốc!
              </p>
            )}
            <div className="w-full bg-[#0c162e] rounded-full h-2 mt-1.5 overflow-hidden border border-cyan-500/30">
              <div 
                className="bg-gradient-to-r from-[#00f5d4] via-[#06b6d4] to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / freeShipThreshold) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-grow overflow-y-auto p-5 space-y-3.5 divide-y divide-cyan-500/15">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <i className="fa-solid fa-cart-flatbed-suitcases text-4xl text-cyan-400/40 block"></i>
                <p className="font-medium text-slate-300">Giỏ hàng Rider của bạn đang trống</p>
                <button 
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500/15 text-[#00f5d4] border border-cyan-400/50 font-bold text-xs hover:bg-[#00f5d4] hover:text-slate-950 transition"
                >
                  Khám Phá Đai DX Mới
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product.id} className="pt-3.5 first:pt-0 flex gap-3">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name} 
                    className="w-16 h-16 rounded-xl object-contain p-1 bg-[#050914] border border-cyan-500/30 shrink-0" 
                    onError={(e) => {
                      e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg';
                    }}
                  />
                  <div className="flex-grow min-w-0 space-y-1">
                    <h4 className="font-bold text-white truncate text-xs">{item.product.name}</h4>
                    <p className="text-[11px] text-[#00f5d4] font-mono font-bold">{item.product.price.toLocaleString('vi-VN')}đ</p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-cyan-500/30 bg-[#060b18] rounded-lg">
                        <button 
                          onClick={() => onUpdateQty(item.product.id, Math.max(0, item.quantity - 1))}
                          className="px-2.5 py-0.5 hover:bg-cyan-500/20 text-slate-200 font-bold"
                        >-</button>
                        <span className="px-2.5 py-0.5 font-bold font-mono text-[11px] text-white">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-0.5 hover:bg-cyan-500/20 text-slate-200 font-bold"
                        >+</button>
                      </div>

                      <button 
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-400 text-xs transition p-1"
                        title="Xóa sản phẩm"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-cyan-500/30 bg-[#060b18] space-y-3.5">
              {/* Voucher Code Form */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Mã voucher Shopee / Shop (NOEL2026)..."
                    className="flex-grow bg-[#0A0F1D] border border-[#00F2FE]/40 px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-[#00F2FE]"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/60 font-bold hover:bg-[#00F2FE] hover:text-slate-950 transition cursor-pointer"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
                  >
                    Áp Dụng
                  </button>
                </div>

                {couponMsg && (
                  <p className={`text-[10px] font-semibold ${couponMsg.isError ? 'text-rose-400' : 'text-[#05FFD2]'}`}>
                    {couponMsg.text}
                  </p>
                )}

                {/* Available Coupon Quick Chips */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <i className="fa-solid fa-ticket text-[#EE4D2D]"></i>
                      <span>Shopee Voucher khả dụng:</span>
                    </p>
                    <span className="text-[9px] text-[#00F2FE]">Chạm để áp dụng</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {coupons.map(c => {
                      const isEligible = subtotal >= c.minOrder;
                      const isSelected = appliedCoupon?.code === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            if (!isEligible) {
                              setCouponMsg({ text: `Đơn hàng cần tối thiểu ${c.minOrder.toLocaleString('vi-VN')}đ để dùng mã ${c.code}!`, isError: true });
                              return;
                            }
                            setAppliedCoupon(c);
                            setCouponCode('');
                            setCouponMsg({ text: `Đã áp dụng mã [${c.code}]!`, isError: false });
                          }}
                          className={`text-[10px] font-mono font-bold px-2.5 py-1 border transition flex items-center gap-1 cursor-pointer ${
                            isSelected 
                              ? 'bg-[#EE4D2D]/20 border-[#EE4D2D] text-[#EE4D2D] shadow-sm'
                              : isEligible
                              ? 'bg-[#121214] border-[#00F2FE]/40 text-[#00F2FE] hover:border-[#00F2FE] hover:bg-[#00F2FE]/10'
                              : 'bg-[#121214] border-slate-800 text-slate-600'
                          }`}
                          style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
                        >
                          <i className="fa-solid fa-ticket text-[9px]"></i>
                          <span>{c.code}</span>
                          <span className="text-[9px] font-sans opacity-85">({c.discountType === 'percent' ? `-${c.value}%` : `-${(c.value/1000)}k`})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {appliedCoupon && (
                  <div 
                    className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/40 p-2 px-3 text-[11px] text-emerald-300 font-bold mt-2"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
                  >
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-400"></i>
                      Đã áp dụng mã [{appliedCoupon.code}]: -{couponDiscount.toLocaleString('vi-VN')}đ
                    </span>
                    <button onClick={() => { setAppliedCoupon(null); setCouponMsg(null); }} className="text-rose-400 hover:text-rose-300 text-sm font-bold px-1 cursor-pointer">✕</button>
                  </div>
                )}
              </div>



              {/* Rider Points Redeem Toggle */}
              {userPoints > 0 && (
                <div 
                  className="flex items-center justify-between bg-[#121214] border border-[#00F2FE]/40 p-2.5 text-xs"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
                >
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-[#00F2FE]"></i>
                    <span className="text-slate-200">Dùng Rider Points ({userPoints} pt = -{(userPoints * 1000).toLocaleString('vi-VN')}đ)</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="accent-[#00F2FE] w-4 h-4 cursor-pointer"
                  />
                </div>
              )}

              {/* Total Summary */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-[#00F2FE]/20">
                <div className="flex justify-between"><span>Tạm tính:</span><span className="text-white font-mono">{subtotal.toLocaleString('vi-VN')}đ</span></div>
                {pointsDiscount > 0 && <div className="flex justify-between text-[#00F2FE]"><span>Đổi Rider Points:</span><span className="font-mono">-{pointsDiscount.toLocaleString('vi-VN')}đ</span></div>}
                <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-slate-800">
                  <span>Tổng thanh toán:</span>
                  <span className="text-[#00F2FE] text-base font-mono font-black drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>



              {/* Checkout Button */}
              <button 
                onClick={() => {
                  onClose();
                  onOpenCheckout(appliedCoupon || undefined, pointsUsedCount);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#EE4D2D] via-[#FF6B4A] to-[#EE4D2D] hover:brightness-110 text-white font-black text-sm shadow-[0_0_20px_rgba(238,77,45,0.4)] hover:shadow-[0_0_30px_rgba(238,77,45,0.85)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
              >
                <i className="fa-solid fa-lock"></i> Mua Hàng ({cartItems.length}) — {total.toLocaleString('vi-VN')}đ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
