import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { generateCustomerAvatarSvgUrl } from '../utils/avatarGenerator';
import { api } from '../services/api';

interface OrderTrackerViewProps {
  orders: Order[];
  showToast: (m: string, t?: any) => void;
}

// Danh sách các đơn hàng gần đây của các khách hàng khác trên toàn quốc
const MOCK_OTHER_CUSTOMERS_ORDERS: Order[] = [
  {
    id: 'ORDER-2026-NPT-9812',
    date: '22/10/2026',
    time: '17:45',
    customerName: 'Trần Minh Quân',
    customerPhone: '0984.***.812',
    customerEmail: 'quan.tran.tokusatsu@gmail.com',
    shippingAddress: 'Tòa nhà Landmark 72, Đ. Phạm Hùng, Q. Nam Từ Liêm, Hà Nội',
    paymentMethod: 'BANK',
    status: 'Đang giao hàng',
    subtotal: 2850000,
    discountAmount: 0,
    pointsDiscount: 0,
    shippingFee: 0,
    total: 2850000,
    pointsEarned: 285,
    customerAvatar: generateCustomerAvatarSvgUrl({ maskId: 'gavv-gummy', colorId: 'crimson-ruby', initials: 'MQ' }),
    items: [
      {
        productId: 'dx-gavv-belt',
        productName: 'Kamen Rider Gavv DX Henshin Belt Complete Set',
        productImage: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/km3_20240206150553.jpg',
        price: 2850000,
        quantity: 1,
        serialKey: 'NPT-GAVV-2026-9812-JP'
      }
    ]
  },
  {
    id: 'ORDER-2026-NPT-8421',
    date: '22/10/2026',
    time: '15:20',
    customerName: 'Lê Hoàng Nam',
    customerPhone: '0912.***.345',
    customerEmail: 'nam.lehoang@yahoo.com',
    shippingAddress: 'Chung cư Masteri Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
    paymentMethod: 'COD',
    status: 'Đã giao thành công',
    subtotal: 8900000,
    discountAmount: 0,
    pointsDiscount: 0,
    shippingFee: 0,
    total: 8900000,
    pointsEarned: 890,
    customerAvatar: generateCustomerAvatarSvgUrl({ maskId: 'decade-king', colorId: 'gold-bandai', initials: 'HN' }),
    items: [
      {
        productId: 'csm-decade-v2',
        productName: 'CSM Complete Selection Modification Decadriver Ver.2 Gold Edition',
        productImage: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/KR_CSM_Banner.webp',
        price: 8900000,
        quantity: 1,
        serialKey: 'NPT-CSM-DECADE-8421-BANDAI'
      }
    ]
  },
  {
    id: 'ORDER-2026-NPT-7634',
    date: '22/10/2026',
    time: '13:10',
    customerName: 'Nguyễn Quốc Bảo',
    customerPhone: '0973.***.678',
    customerEmail: 'baonq.collector@outlook.com',
    shippingAddress: 'Đường Bạch Đằng, P. Hải Châu 1, Q. Hải Châu, TP. Đà Nẵng',
    paymentMethod: 'MOMO',
    status: 'Đang xử lý',
    subtotal: 1950000,
    discountAmount: 0,
    pointsDiscount: 0,
    shippingFee: 0,
    total: 1950000,
    pointsEarned: 195,
    customerAvatar: generateCustomerAvatarSvgUrl({ maskId: 'geats-fox', colorId: 'dark-purple', initials: 'QB' }),
    items: [
      {
        productId: 'shf-gavv-caking',
        productName: 'S.H.Figuarts Kamen Rider Gavv Caking Form Limited',
        productImage: '/Banner Slider Đầu Trang Chủ (Hero Banner Slider)/e094e508-ec72-4168-8a1d-e924fd323829.webp',
        price: 1950000,
        quantity: 1,
        serialKey: 'NPT-SHF-CAKING-7634-JP'
      }
    ]
  },
  {
    id: 'ORDER-2026-NPT-6519',
    date: '21/10/2026',
    time: '20:05',
    customerName: 'Phạm Thùy Linh',
    customerPhone: '0905.***.990',
    customerEmail: 'thuylinh.tokufan@gmail.com',
    shippingAddress: 'Khu phố 3, P. Tân Phong, TP. Biên Hòa, Tỉnh Đồng Nai',
    paymentMethod: 'BANK',
    status: 'Đang giao hàng',
    subtotal: 650000,
    discountAmount: 0,
    pointsDiscount: 0,
    shippingFee: 0,
    total: 650000,
    pointsEarned: 65,
    customerAvatar: generateCustomerAvatarSvgUrl({ maskId: 'femme-swan', colorId: 'aqua-neon', initials: 'TL' }),
    items: [
      {
        productId: 'dx-geats-drill',
        productName: 'Đồ chơi Kamen Rider Geats DX Drill & Propeller Set',
        productImage: '/Ảnh Sản Phẩm/dx/Đồ chơi siêu nhân Kamen Rider Geats DX Drill & Propeller Raise Buckle Set 1.jpg',
        price: 650000,
        quantity: 1,
        serialKey: 'NPT-GEATS-DRILL-6519-VN'
      }
    ]
  },
  {
    id: 'ORDER-2026-NPT-5320',
    date: '21/10/2026',
    time: '11:30',
    customerName: 'Đỗ Gia Huy',
    customerPhone: '0938.***.211',
    customerEmail: 'giahuy.kamen@gmail.com',
    shippingAddress: 'Đại lộ Hòa Bình, P. An Cư, Q. Ninh Kiều, TP. Cần Thơ',
    paymentMethod: 'COD',
    status: 'Đã giao thành công',
    subtotal: 380000,
    discountAmount: 0,
    pointsDiscount: 0,
    shippingFee: 0,
    total: 380000,
    pointsEarned: 38,
    customerAvatar: generateCustomerAvatarSvgUrl({ maskId: 'gotchard-steam', colorId: 'cyber-emerald', initials: 'GH' }),
    items: [
      {
        productId: 'card-gotchard-box',
        productName: 'Thẻ bài Gotchard Ride Chemy Trading Card Phase 01 Booster Box',
        productImage: '/Ảnh Sản Phẩm/item/Thẻ bài Kamen Rider Gotchard Ride Chemy Trading Card Phase 01 1.jpg',
        price: 380000,
        quantity: 1,
        serialKey: 'NPT-CARD-CHEMY-5320-BOX'
      }
    ]
  },
  {
    id: 'ORDER-2026-NPT-4198',
    date: '20/10/2026',
    time: '09:15',
    customerName: 'Vũ Hải Đăng',
    customerPhone: '0988.***.554',
    customerEmail: 'haidang.rider@gmail.com',
    shippingAddress: 'Đường Lạch Tray, Q. Ngô Quyền, TP. Hải Phòng',
    paymentMethod: 'BANK',
    status: 'Đã giao thành công',
    subtotal: 12500000,
    discountAmount: 0,
    pointsDiscount: 0,
    shippingFee: 0,
    total: 12500000,
    pointsEarned: 1250,
    customerAvatar: generateCustomerAvatarSvgUrl({ maskId: 'kiva-bat', colorId: 'gold-bandai', initials: 'HD' }),
    items: [
      {
        productId: 'dx-don-onitaijin',
        productName: 'DX Don Onitaijin Gold Mekki Royal Masterpiece Edition Bandai',
        productImage: '/Ảnh Sản Phẩm/dx/Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set 1.jpg',
        price: 12500000,
        quantity: 1,
        serialKey: 'NPT-MEKKI-GOLD-4198-ROYAL'
      }
    ]
  }
];

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({ orders, showToast }) => {
  const [searchCode, setSearchCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đang giao hàng' | 'Đã giao thành công' | 'Đang xử lý'>('all');

  // Gộp các đơn người dùng vừa đặt và các đơn của các khách hàng khác
  const allAvailableOrders = useMemo(() => {
    return [...orders, ...MOCK_OTHER_CUSTOMERS_ORDERS];
  }, [orders]);

  const filteredRecentOrders = useMemo(() => {
    if (statusFilter === 'all') return allAvailableOrders;
    return allAvailableOrders.filter(o => o.status === statusFilter);
  }, [allAvailableOrders, statusFilter]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) {
      showToast('⚠️ Vui lòng nhập Mã đơn hàng, Tên khách hàng hoặc Số điện thoại!', 'info');
      return;
    }

    const query = searchCode.trim().toLowerCase();
    let matched = allAvailableOrders.find(o => 
      o.id.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.customerPhone.toLowerCase().includes(query) ||
      o.items.some(item => item.productName.toLowerCase().includes(query))
    );

    // Query live backend if not in local cache
    if (!matched) {
      try {
        const liveOrder = await api.getOrder(query);
        if (liveOrder) {
          matched = liveOrder;
        }
      } catch (err) {
        console.warn('Live order query fallback:', err);
      }
    }

    if (matched) {
      setFoundOrder(matched);
      showToast(`✅ Đã tìm thấy đơn hàng của [${matched.customerName}] (#${matched.id})!`, 'success');
    } else {
      setFoundOrder(null);
      showToast(`❌ Không tìm thấy đơn hàng nào khớp với [${searchCode}]. Vui lòng thử lại.`, 'error');
    }
  };

  const handleSelectOrder = (order: Order) => {
    setFoundOrder(order);
    setSearchCode(order.id);
    window.scrollTo({ top: 120, behavior: 'smooth' });
    showToast(`📦 Đang hiển thị chi tiết đơn #${order.id} của khách hàng ${order.customerName}`, 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F5F2EB]">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-sm">
          <i className="fa-solid fa-truck-fast text-cyan-400"></i> Hệ Thống Tra Cứu Vận Đơn & Khách Hàng Toàn Quốc
        </div>
        <h2 className="font-serif-title text-3xl sm:text-4xl font-black uppercase text-pop">
          TRA CỨU ĐƠN HÀNG & <span className="gold-gradient-text">ĐƠN GẦN ĐÂY CỦA KHÁCH HÀNG</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-medium">
          Bạn có thể tra cứu đơn hàng của mình hoặc xem các đơn hàng gần đây của các khách hàng khác trên hệ thống. Tìm kiếm theo Mã đơn hàng, Tên khách hàng hoặc Số điện thoại.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-2 bg-[#0d1322] border-2 border-cyan-500/40 focus-within:border-cyan-400 p-2 rounded-2xl shadow-xl transition">
        <i className="fa-solid fa-magnifying-glass text-cyan-400 ml-3 text-sm"></i>
        <input 
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Nhập Mã đơn (VD: 9812), Tên khách (VD: Quân), hoặc SĐT..."
          className="bg-transparent flex-grow text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none px-2"
        />
        {searchCode && (
          <button 
            type="button" 
            onClick={() => { setSearchCode(''); setFoundOrder(null); }}
            className="text-slate-400 hover:text-white px-2 text-xs"
            title="Xóa tìm kiếm"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
        <button
          type="submit"
          className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase shadow-md transition active:scale-95 cursor-pointer"
        >
          Tra Cứu
        </button>
      </form>

      {/* Quick Search Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Gợi ý tìm nhanh:</span>
        {MOCK_OTHER_CUSTOMERS_ORDERS.slice(0, 4).map(o => (
          <button
            key={o.id}
            type="button"
            onClick={() => handleSelectOrder(o)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-400 text-[11px] font-medium transition cursor-pointer"
          >
            #{o.id.split('-').pop()} ({o.customerName})
          </button>
        ))}
      </div>

      {/* Order Status Result Card (Khi đã tìm thấy hoặc chọn 1 đơn) */}
      {foundOrder && (
        <div className="bg-[#0e1628] border-2 border-cyan-400/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Bar info */}
          <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/30 pb-4 gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Mã Vận Đơn:</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">GHN EXPRESS</span>
              </div>
              <h3 className="text-2xl font-serif-title font-black text-amber-300">#{foundOrder.id}</h3>
              <p className="text-xs text-slate-300 mt-0.5">Đặt lúc: {foundOrder.date} • {foundOrder.time}</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Trạng Thái:</span>
                <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs uppercase shadow-sm ${
                  foundOrder.status === 'Đã giao thành công' 
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                    : foundOrder.status === 'Đang giao hàng'
                    ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 animate-pulse'
                    : 'bg-amber-500/20 border border-amber-400/50 text-amber-300'
                }`}>
                  {foundOrder.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFoundOrder(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>

          {/* Customer Avatar & Address Details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-[#0a1122] via-[#0d1730] to-[#0a1122] border border-cyan-500/30 p-5 rounded-2xl text-xs relative z-10">
            {/* Customer Custom Avatar with tight-fit border */}
            <div className="relative shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black p-0.5 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                {foundOrder.customerAvatar ? (
                  <img src={foundOrder.customerAvatar} alt={foundOrder.customerName} className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-cyan-300 text-xl">
                    {foundOrder.customerName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-[9px] bg-cyan-500/25 text-cyan-300 px-2 py-0.5 rounded-full font-extrabold uppercase">
                Avatar Khách Hàng
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow w-full text-center sm:text-left">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Người Nhận Hàng:</span>
                <p className="font-extrabold text-white text-base">{foundOrder.customerName}</p>
                <p className="text-slate-300 font-medium">SĐT: <strong className="text-amber-300 font-mono">{foundOrder.customerPhone}</strong></p>
                <p className="text-slate-400 text-[11px]">{foundOrder.customerEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Địa Chỉ Nhận Hàng:</p>
                <p className="text-white font-medium leading-relaxed">{foundOrder.shippingAddress}</p>
                <p className="text-slate-300 pt-1">
                  Phương thức: <strong className="text-amber-300">{foundOrder.paymentMethod}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Progress Visual Steps */}
          <div className="space-y-3 py-2 relative z-10">
            <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Lộ Trình Giao Hàng Chi Tiết (GHN / GHTK 24H)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-[#080d19] border border-emerald-500/40 text-emerald-300 space-y-1">
                <i className="fa-solid fa-circle-check text-base"></i>
                <p className="font-bold">Đã Đặt Hàng</p>
                <p className="text-[9px] text-slate-400">{foundOrder.date} {foundOrder.time}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#080d19] border border-emerald-500/40 text-emerald-300 space-y-1">
                <i className="fa-solid fa-box text-base"></i>
                <p className="font-bold">Đã Đóng Gói</p>
                <p className="text-[9px] text-slate-400">Kho NPTTEAMSTORE</p>
              </div>
              <div className={`p-3 rounded-2xl border space-y-1 ${
                foundOrder.status === 'Đang giao hàng' || foundOrder.status === 'Đã giao thành công'
                  ? 'bg-[#080d19] border-emerald-500/40 text-emerald-300'
                  : 'bg-[#080d19] border-slate-700/60 text-slate-500'
              }`}>
                <i className="fa-solid fa-truck-fast text-base"></i>
                <p className="font-bold">Đang Giao Hàng</p>
                <p className="text-[9px] text-slate-400">Tài xế giao tận tay</p>
              </div>
              <div className={`p-3 rounded-2xl border space-y-1 ${
                foundOrder.status === 'Đã giao thành công'
                  ? 'bg-[#080d19] border-emerald-500/40 text-emerald-300'
                  : 'bg-[#080d19] border-slate-700/60 text-slate-500'
              }`}>
                <i className="fa-solid fa-house-chimney-check text-base"></i>
                <p className="font-bold">Giao Thành Công</p>
                <p className="text-[9px] text-slate-400">Đã nhận hàng 100%</p>
              </div>
            </div>
          </div>

          {/* Items & Serial Key for Warranty */}
          <div className="space-y-3 relative z-10">
            <h4 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Chi Tiết Sản Phẩm & Serial Bảo Hành Chính Hãng</h4>
            <div className="divide-y divide-white/10 border border-cyan-500/25 rounded-2xl overflow-hidden bg-[#0a1020]">
              {foundOrder.items.map((item, idx) => (
                <div key={idx} className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.productImage} alt={item.productName} className="w-14 h-14 object-contain rounded-xl bg-black border border-white/10 p-1" />
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-white text-sm">{item.productName}</p>
                      <p className="text-[11px] text-slate-300">Số lượng: <strong className="text-white">{item.quantity}</strong> | Đơn giá: {item.price.toLocaleString('vi-VN')}đ</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono font-bold text-[10px]">
                        Mã Serial: {item.serialKey}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-amber-300 font-black text-base">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Pricing */}
          <div className="border-t border-cyan-500/30 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs relative z-10">
            <span className="text-slate-300 font-medium">Tổng thanh toán:</span>
            <span className="font-serif-title text-2xl font-black text-amber-300 font-mono">{foundOrder.total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      )}

      {/* Danh Sách Đơn Hàng Gần Đây Của Khách Hàng (Click vào tra cứu ngay) */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/25 pb-3">
          <div>
            <h3 className="font-serif-title text-base sm:text-lg font-black text-white flex items-center gap-2">
              <i className="fa-solid fa-users-viewfinder text-cyan-400"></i>
              <span>Đơn Hàng Gần Đây Của Khách Hàng Toàn Quốc</span>
            </h3>
            <p className="text-xs text-slate-300">Nhấp vào bất kỳ đơn nào để xem chi tiết lộ trình vận chuyển và avatar của khách hàng</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'Đang giao hàng', label: 'Đang giao' },
              { id: 'Đã giao thành công', label: 'Giao thành công' },
              { id: 'Đang xử lý', label: 'Đang đóng gói' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Cards of Recent Customer Orders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecentOrders.map((orderItem) => (
            <div 
              key={orderItem.id}
              onClick={() => handleSelectOrder(orderItem)}
              className="bg-[#0e1628] border border-cyan-500/30 hover:border-cyan-300 rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/10 group transform hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Highlight bar */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-amber-400"></div>

              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black p-0.5 border border-cyan-400/80 shadow-md group-hover:scale-105 transition shrink-0 ml-1">
                {orderItem.customerAvatar ? (
                  <img src={orderItem.customerAvatar} alt={orderItem.customerName} className="w-full h-full object-cover rounded-[12px]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-cyan-300 text-base">
                    {orderItem.customerName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-grow space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-amber-300 font-bold">#{orderItem.id}</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    orderItem.status === 'Đã giao thành công'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : orderItem.status === 'Đang giao hàng'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {orderItem.status}
                  </span>
                </div>

                <h4 className="font-black text-white text-sm truncate group-hover:text-amber-300 transition">
                  {orderItem.customerName}
                </h4>
                
                <p className="text-[11px] text-slate-300 truncate">
                  {orderItem.items[0]?.productName || 'Sản phẩm Kamen Rider'}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono font-black text-amber-300">
                    {orderItem.total.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-[10px] text-cyan-300 group-hover:underline flex items-center gap-1 font-bold">
                    <span>Xem đơn</span>
                    <i className="fa-solid fa-arrow-right text-[9px]"></i>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
