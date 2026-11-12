import React, { useState } from 'react';
import { User, Order } from '../types';

interface DashboardViewProps {
  currentUser: User | null;
  orders: Order[];
  openAuth: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  orders,
  openAuth,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'serials' | 'points'>('orders');
  const [userAvatar, setUserAvatar] = useState<string | null>(currentUser?.avatar || (currentUser as any)?.avatarUrl || null);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl text-center space-y-4 text-[#F5F2EB]">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center text-2xl mx-auto">
          <i className="fa-solid fa-lock"></i>
        </div>
        <h3 className="font-serif-title text-xl font-bold">Yêu Cầu Đăng Nhập Tài Khoản</h3>
        <p className="text-xs text-gray-400">Đăng nhập để xem lịch sử đơn hàng, tra cứu mã Serial bảo hành và tích Rider Points!</p>
        <button 
          onClick={openAuth}
          className="px-6 py-3 bg-gradient-to-r from-[#C9A84C] to-[#a27e2a] text-[#0A0A0A] font-extrabold text-xs rounded-xl shadow-lg"
        >
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUserAvatar(reader.result as string);
          showToast('📸 Đã cập nhật ảnh đại diện Rider mới!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAvatarUrl = () => {
    if (avatarUrlInput.trim()) {
      setUserAvatar(avatarUrlInput.trim());
      setAvatarUrlInput('');
      showToast('🔗 Đã chèn link ảnh đại diện thủ công thành công!', 'info');
    }
  };

  // Filter orders for current user
  const userOrders = orders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F5F2EB]">
      {/* Top Profile Summary Card */}
      <div className="bg-gradient-to-r from-[#1A1A1A] via-[#222222] to-[#1A1A1A] border border-[#C9A84C]/40 p-6 sm:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-2xl">
        <div className="md:col-span-8 flex items-center gap-4">
          <div className="relative group">
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt="Avatar" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#C9A84C] shadow-lg bg-black"
                onError={(e) => {
                  e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg';
                }}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#8B1E1E] text-[#0A0A0A] font-black text-2xl flex items-center justify-center border-2 border-[#C9A84C]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 bg-[#C9A84C] text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] cursor-pointer hover:scale-110 transition shadow-md" title="Đổi ảnh đại diện">
              <i className="fa-solid fa-camera"></i>
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-title text-xl sm:text-2xl font-bold">{currentUser.name}</h2>
              <span className="bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {currentUser.tierRank}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{currentUser.email} • Mã GT: <strong className="text-[#C9A84C] font-mono">{currentUser.referralCode}</strong></p>
            
            {/* Quick Manual Avatar Link */}
            <div className="mt-2 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Dán link ảnh đại diện..." 
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-2 py-1 text-[10px] text-white w-48"
              />
              <button 
                onClick={handleApplyAvatarUrl} 
                className="bg-[#C9A84C] text-black text-[10px] font-bold px-2.5 py-1 rounded-lg hover:brightness-110"
              >
                Chèn
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-[#0A0A0A] p-4 rounded-2xl border border-[#2A2A2A] text-center space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Số Dư Rider Points</span>
          <p className="text-3xl font-black text-[#C9A84C] font-mono">{currentUser.riderPoints} pt</p>
          <p className="text-[10px] text-gray-500">Quy đổi = {(currentUser.riderPoints * 1000).toLocaleString('vi-VN')}đ giảm giá</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2A2A2A] gap-4 text-xs font-bold">
        {[
          { id: 'orders', label: 'Lịch Sử Đơn Hàng' },
          { id: 'serials', label: 'Mã Serial Bảo Hành' },
          { id: 'points', label: 'Lịch Sử Rider Points' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 transition ${
              activeTab === t.id ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4 text-xs">
          {userOrders.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-12 rounded-3xl text-center text-gray-500">
              <i className="fa-solid fa-receipt text-3xl mb-2 block"></i>
              <p>Bạn chưa thực hiện giao dịch mua đai / mô hình nào trên NPTTEAMSTORE.</p>
            </div>
          ) : (
            userOrders.map(order => (
              <div key={order.id} className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] pb-3">
                  <div>
                    <span className="font-bold text-[#C9A84C] text-sm">Mã đơn #{order.id}</span>
                    <span className="text-gray-500 text-[10px] ml-2">{order.date} - {order.time}</span>
                  </div>
                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-3 py-1 rounded-full font-bold text-[10px] w-fit">
                    ● {order.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#0D0D0D] p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover bg-black" />
                        <div>
                          <p className="font-bold text-white text-xs">{item.productName}</p>
                          <p className="text-[10px] text-gray-500">Serial: <strong className="text-[#C9A84C] font-mono">{item.serialKey}</strong></p>
                        </div>
                      </div>
                      <span className="font-mono text-[#F5F2EB] font-bold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs font-bold border-t border-[#2A2A2A]">
                  <span className="text-gray-400">Thanh toán qua: {order.paymentMethod}</span>
                  <span className="text-[#C9A84C] text-sm font-mono font-black">Tổng: {order.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Serials Tab */}
      {activeTab === 'serials' && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-4 text-xs">
          <h4 className="font-bold text-sm text-[#C9A84C]">Danh Sách Mã Serial Bảo Hành Của Bạn</h4>
          <p className="text-gray-400">Dùng mã Serial này để gửi yêu cầu đổi mới 1-đổi-1 khi đai hoặc mô hình gặp lỗi mạch/loa.</p>

          <div className="space-y-2 pt-2">
            {userOrders.flatMap(o => o.items).map((item, idx) => (
              <div key={idx} className="bg-[#0D0D0D] border border-[#2A2A2A] p-3 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{item.productName}</p>
                  <p className="text-[10px] text-[#C9A84C] font-mono font-bold">{item.serialKey}</p>
                </div>
                <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                  Đang Bảo Hành (30 Ngày)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points Tab */}
      {activeTab === 'points' && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-4 text-xs">
          <h4 className="font-bold text-sm text-[#C9A84C]">Lịch Sử Tích & Đổi Rider Points</h4>
          <div className="space-y-2">
            <div className="bg-[#0D0D0D] p-3 rounded-xl flex justify-between items-center">
              <span>Thưởng đăng ký thành viên mới</span>
              <span className="font-bold text-emerald-400">+100 pt</span>
            </div>
            <div className="bg-[#0D0D0D] p-3 rounded-xl flex justify-between items-center">
              <span>Đánh giá sản phẩm DX Desire Driver</span>
              <span className="font-bold text-emerald-400">+50 pt</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
