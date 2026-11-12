import React, { useState, useEffect } from 'react';
import { CartItem, Coupon, Order, User } from '../types';
import { INITIAL_COUPONS } from '../data/promotions';
import { 
  PRESET_AVATAR_MASKS, 
  PRESET_AVATAR_COLORS, 
  getInitials, 
  generateCustomerAvatarSvgUrl 
} from '../utils/avatarGenerator';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: User | null;
  appliedCoupon?: Coupon;
  pointsUsed?: number;
  onCompleteOrder: (order: Order) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  openAuth?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  appliedCoupon,
  pointsUsed = 0,
  onCompleteOrder,
  showToast,
  openAuth
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('158 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh');
  const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'VNPAY' | 'MOMO' | 'COD'>('BANK');
  const [senderBank, setSenderBank] = useState('Vietcombank');
  const [senderAccountName, setSenderAccountName] = useState(currentUser?.name || '');
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | undefined>(appliedCoupon);
  const [inputCouponCode, setInputCouponCode] = useState('');

  // Customer Custom Avatar Creation State
  const [selectedMask, setSelectedMask] = useState(PRESET_AVATAR_MASKS[0].id);
  const [selectedColor, setSelectedColor] = useState(PRESET_AVATAR_COLORS[0].id);
  const [customInitials, setCustomInitials] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentCoupon(appliedCoupon);
      if (currentUser) {
        setName(currentUser.name || '');
        setEmail(currentUser.email || '');
        setPhone(currentUser.phone || '');
      }
    }
  }, [isOpen, appliedCoupon, currentUser]);

  // Update preview avatar whenever options change
  useEffect(() => {
    const initials = customInitials || getInitials(name || 'Rider');
    const svgUrl = generateCustomerAvatarSvgUrl({
      maskId: selectedMask,
      colorId: selectedColor,
      initials,
      customerName: name || 'Rider Collector'
    });
    setPreviewAvatar(svgUrl);
  }, [selectedMask, selectedColor, customInitials, name]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  
  let couponDiscount = 0;
  if (currentCoupon) {
    couponDiscount = currentCoupon.discountType === 'percent'
      ? (subtotal * currentCoupon.value) / 100
      : currentCoupon.value;
  }

  const handleApplyCouponCode = () => {
    const codeClean = inputCouponCode.trim().toUpperCase();
    const found = INITIAL_COUPONS.find(c => c.code === codeClean);
    if (!found) {
      showToast('⚠️ Mã voucher không hợp lệ!', 'error');
      return;
    }
    if (subtotal < found.minOrder) {
      showToast(`⚠️ Đơn hàng cần tối thiểu ${found.minOrder.toLocaleString('vi-VN')}đ để dùng mã này!`, 'error');
      return;
    }
    setCurrentCoupon(found);
    setInputCouponCode('');
    showToast(`🎉 Đã áp dụng mã giảm giá [${found.code}]!`, 'success');
  };

  const pointsDiscount = pointsUsed * 1000;
  const shippingFee = subtotal >= 1500000 ? 0 : 35000;
  const total = Math.max(0, subtotal - couponDiscount - pointsDiscount + shippingFee);
  const pointsEarned = Math.floor(total / 10000);

  const orderId = 'RD-' + Math.floor(100000 + Math.random() * 900000);

  const handleRandomizeAvatar = () => {
    const randomMask = PRESET_AVATAR_MASKS[Math.floor(Math.random() * PRESET_AVATAR_MASKS.length)].id;
    const randomColor = PRESET_AVATAR_COLORS[Math.floor(Math.random() * PRESET_AVATAR_COLORS.length)].id;
    setSelectedMask(randomMask);
    setSelectedColor(randomColor);
    showToast('✨ Đã tạo ngẫu nhiên một Avatar Tokusatsu mới!', 'info');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('⚠️ Vui lòng đăng nhập tài khoản trước khi hoàn tất đặt hàng!', 'error');
      if (openAuth) openAuth();
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      showToast('⚠️ Vui lòng điền đầy đủ thông tin nhận hàng!', 'error');
      return;
    }

    const now = new Date();
    const orderItems = cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0],
      price: item.product.price,
      quantity: item.quantity,
      serialKey: `BANDAI-RIDER-${Math.random().toString(36).substr(2, 6).toUpperCase()}-2026`
    }));

    const finalAvatar = previewAvatar || generateCustomerAvatarSvgUrl({
      maskId: selectedMask,
      colorId: selectedColor,
      initials: customInitials || getInitials(name),
      customerName: name
    });

    const bankDetails = paymentMethod === 'BANK' ? {
      bankName: 'MB Bank (Quân Đội)',
      accountNumber: '0988776655',
      accountHolder: 'DANH NGUYEN',
      transferContent: `DH #${orderId} ${phone}`,
      amount: total,
      senderBank: senderBank || 'Ngân hàng của khách',
      senderAccountName: senderAccountName || name,
      transferredAt: now.toLocaleString('vi-VN')
    } : undefined;

    const newOrder: Order = {
      id: orderId,
      date: now.toLocaleDateString('vi-VN'),
      time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      customerName: name,
      customerAvatar: finalAvatar,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: address,
      items: orderItems,
      subtotal,
      discountAmount: couponDiscount,
      pointsDiscount,
      shippingFee,
      total,
      paymentMethod,
      bankTransferDetails: bankDetails,
      couponCode: appliedCoupon?.code,
      pointsEarned,
      status: paymentMethod === 'BANK' ? 'Chờ xác nhận' : 'Đang xử lý'
    };

    // Synchronize order with Web Quản Lý backend
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).then(r => r.json()).then(data => {
      if (data.isIpBlocked) {
        showToast('🚫 Địa chỉ IP của bạn đã bị Web Quản Lý chặn đặt hàng!', 'error');
      }
    }).catch(err => console.warn('Failed to post order to server', err));

    onCompleteOrder(newOrder);
    onClose();
    if (paymentMethod === 'BANK') {
      showToast(`🎉 Đã tạo đơn #${orderId}! Thông tin chuyển khoản đã được gửi đến Web Quản Lý của Admin Danh Nguyễn.`, 'success');
    } else {
      showToast(`🎉 Đặt hàng thành công! Mã đơn #${orderId}. Chúc mừng bạn tích lũy ${pointsEarned} Rider Points!`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#080e1e] border-2 border-cyan-500/50 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative my-auto max-h-[92vh] flex flex-col text-white ring-1 ring-cyan-400/30">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 flex items-center justify-between bg-[#060b18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 p-0.5 flex items-center justify-center shadow-md">
              <i className="fa-solid fa-lock text-black text-xs"></i>
            </div>
            <div>
              <h3 className="font-serif-title text-base sm:text-lg font-black text-white uppercase text-pop">
                Thanh Toán Đơn Hàng & <span className="aqua-gradient-text">Avatar Rider</span>
              </h3>
              <p className="text-[10px] text-slate-300">Avatar Rider của bạn sẽ hiển thị công khai trên đơn hàng và lịch sử giao dịch</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0d162d] hover:bg-cyan-900/60 text-slate-400 hover:text-white border border-cyan-500/30 flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs no-scrollbar">
          
          {/* Customer & Shipping Inputs */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Step 1: Shipping Info */}
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300 border-b border-cyan-500/30 pb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-address-card text-cyan-400"></i>
              <span>1. Thông Tin Nhận Hàng (Bảo Hành 1-Đổi-1)</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Họ và tên *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ tên của bạn..."
                  className="w-full bg-[#180514] border border-rose-500/30 focus:border-rose-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Số điện thoại *</label>
                <input 
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0988..."
                  className="w-full bg-[#180514] border border-rose-500/30 focus:border-rose-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Email nhận mã Serial bảo hành *</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-[#180514] border border-rose-500/30 focus:border-rose-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Địa chỉ giao hàng chi tiết *</label>
                <input 
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Địa chỉ số nhà, tên đường..."
                  className="w-full bg-[#180514] border border-rose-500/30 focus:border-rose-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            {/* Step 2: Avatar Rider */}
            <div className="bg-[#091124] border-2 border-cyan-500/40 rounded-2xl p-4 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎨</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300">
                    2. Avatar Rider (Đơn Hàng Sẽ Hiện Avatar Này)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="text-[10px] font-bold text-cyan-300 hover:text-white bg-[#060b18] border border-cyan-400/40 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  title="Tạo ngẫu nhiên"
                >
                  <i className="fa-solid fa-dice text-xs"></i>
                  <span>Ngẫu nhiên</span>
                </button>
              </div>

              {/* Avatar Live Preview + Options */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#060b18] p-3 rounded-xl border border-cyan-500/30">
                {/* Live Preview Display with tight-fitting crisp border */}
                <div className="relative shrink-0 flex flex-col items-center gap-1">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black p-0.5 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,245,212,0.4)]">
                    {previewAvatar ? (
                      <img src={previewAvatar} alt="Avatar Rider" className="w-full h-full object-cover rounded-[14px]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-cyan-300 text-sm">
                        {getInitials(name)}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-cyan-300 font-extrabold uppercase tracking-wider">
                    Avatar Rider ✨
                  </span>
                </div>

                {/* Custom Initials & Controls */}
                <div className="space-y-2 flex-grow w-full">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      Ký tự / Biệt danh trên Avatar (1-3 chữ cái):
                    </label>
                    <input 
                      type="text"
                      maxLength={3}
                      value={customInitials}
                      onChange={(e) => setCustomInitials(e.target.value.toUpperCase())}
                      placeholder={getInitials(name) || 'TĐ'}
                      className="w-full bg-[#180514] border border-rose-500/30 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-rose-300 uppercase tracking-widest focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  {/* Mask Selector (8 options) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      Chọn Biểu tượng Rider Helmet:
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {PRESET_AVATAR_MASKS.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMask(m.id)}
                          className={`p-1.5 rounded-lg text-sm border flex items-center justify-center transition ${
                            selectedMask === m.id
                              ? 'bg-rose-600/40 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.7)] scale-105'
                              : 'bg-[#180514] border-slate-800 hover:border-slate-600'
                          }`}
                          title={`${m.name} (${m.badge})`}
                        >
                          {m.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Aura Theme Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      Màu chuyển sắc Hào quang:
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {PRESET_AVATAR_COLORS.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedColor(c.id)}
                          className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
                            selectedColor === c.id
                              ? `bg-rose-950/60 ${c.borderColor} ${c.textColor} shadow-md`
                              : 'bg-[#180514] border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${c.gradient}`}></span>
                          <span>{c.name.split('(')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-300 border-b border-rose-500/30 pb-2 pt-1 flex items-center gap-1.5">
              <i className="fa-solid fa-credit-card text-rose-400"></i>
              <span>3. Chọn Phương Thức Thanh Toán</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'BANK', label: 'Chuyển Khoản Ngân Hàng (STK)', icon: 'fa-building-columns' },
                { id: 'VNPAY', label: 'Cổng VNPay / Thẻ ATM', icon: 'fa-credit-card' },
                { id: 'MOMO', label: 'Ví Điện Tử MoMo', icon: 'fa-wallet' },
                { id: 'COD', label: 'Thanh Toán Khi Nhận (COD)', icon: 'fa-truck-ramp-box' },
              ].map(method => (
                <label 
                  key={method.id}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                    paymentMethod === method.id 
                      ? 'bg-rose-950/40 border-rose-400 text-rose-300 font-bold shadow-md shadow-rose-900/30' 
                      : 'bg-[#180514] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id as any)}
                    className="sr-only"
                  />
                  <i className={`fa-solid ${method.icon} text-sm text-rose-400`}></i>
                  <span className="text-[11px] leading-tight">{method.label}</span>
                </label>
              ))}
            </div>

            {/* Bank Transfer Details & VietQR Display */}
            {paymentMethod === 'BANK' && (
              <div className="bg-[#0b1426] border border-cyan-500/40 rounded-2xl p-4 space-y-3 animate-fadeIn mt-3">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                  <span className="font-bold text-xs text-cyan-300 flex items-center gap-1.5 uppercase">
                    <i className="fa-solid fa-qrcode text-cyan-400"></i>
                    <span>Tài Khoản Nhận Tiền Của Web Quản Lý (Admin)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Tự động nhận diện
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                    <img 
                      src={`https://img.vietqr.io/image/MB-0988776655-compact2.png?amount=${total}&addInfo=DH%20${orderId}&accountName=DANH%20NGUYEN`} 
                      alt="VietQR MB Bank" 
                      className="w-28 h-28 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs flex-grow w-full">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ngân hàng:</span>
                      <strong className="text-white">MB Bank (Quân Đội)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <strong className="text-amber-400 font-mono text-sm">0988776655</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chủ tài khoản:</span>
                      <strong className="text-white">DANH NGUYEN</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nội dung chuyển khoản:</span>
                      <strong className="text-cyan-300 font-mono">DH #{orderId}</strong>
                    </div>
                  </div>
                </div>

                {/* Sender input info */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20 text-[11px]">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Ngân hàng của bạn</label>
                    <input
                      type="text"
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      placeholder="VCB, Techcombank, VPBank..."
                      className="w-full bg-[#070d1a] border border-cyan-500/30 rounded-lg px-2.5 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Tên chủ tài khoản chuyển</label>
                    <input
                      type="text"
                      value={senderAccountName}
                      onChange={(e) => setSenderAccountName(e.target.value)}
                      placeholder="NGUYEN VAN A..."
                      className="w-full bg-[#070d1a] border border-cyan-500/30 rounded-lg px-2.5 py-1 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & VietQR Display */}
          <div className="lg:col-span-5 bg-[#180514] border-2 border-rose-500/30 p-4 sm:p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                Đơn Hàng Mã #{orderId}
              </h4>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md font-bold">
                {cartItems.length} Sản phẩm
              </span>
            </div>

            {/* Items Brief List */}
            <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar divide-y divide-white/10">
              {cartItems.map((i) => (
                <div key={i.product.id} className="pt-2 first:pt-0 flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={i.product.images[0]} alt={i.product.name} className="w-8 h-8 rounded-lg object-contain bg-black border border-white/10 shrink-0" />
                    <span className="truncate max-w-[150px] text-slate-200">{i.product.name} x{i.quantity}</span>
                  </div>
                  <span className="font-mono text-white font-bold shrink-0">{(i.product.price * i.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>

            {/* Voucher Coupon Section */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Mã Giảm Giá / Voucher
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputCouponCode}
                  onChange={(e) => setInputCouponCode(e.target.value)}
                  placeholder="Nhập mã (RIDER100K)..."
                  className="flex-grow bg-[#0e020a] border border-rose-500/30 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-rose-400"
                />
                <button 
                  type="button" 
                  onClick={handleApplyCouponCode}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow"
                >
                  Áp Dụng
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Tạm tính:</span>
                <span className="font-mono">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>Giảm giá voucher:</span>
                  <span className="font-mono">-{couponDiscount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Trừ Rider Points:</span>
                  <span className="font-mono">-{pointsDiscount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Phí vận chuyển:</span>
                <span className="font-mono">
                  {shippingFee === 0 ? <strong className="text-emerald-400 font-bold">MIỄN PHÍ</strong> : `${shippingFee.toLocaleString('vi-VN')}đ`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/15">
                <span>Tổng Thanh Toán:</span>
                <span className="font-mono text-rose-400">{total.toLocaleString('vi-VN')}đ</span>
              </div>

              <p className="text-[10px] text-amber-300/90 text-right pt-1 font-semibold">
                ⭐ Tích lũy +{pointsEarned} Rider Points cho tài khoản
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider shadow-lg shadow-rose-600/30 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-cart-check"></i>
              <span>Xác Nhận Đặt Hàng & Gắn Avatar</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
