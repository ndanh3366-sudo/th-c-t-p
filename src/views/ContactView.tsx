import React, { useState } from 'react';

interface ContactViewProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ showToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setName('');
    setEmail('');
    setMessage('');
    showToast('🎉 Đã gửi thông tin liên hệ! Đội ngũ NPTTEAMSTORE sẽ phản hồi trong 15 phút.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-[#F5F2EB]">
      {/* Header */}
      <div className="border-b border-[#2A2A2A] pb-6">
        <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-white text-pop">
          Liên Hệ & <span className="gold-gradient-text">HỆ THỐNG SHOWROOM NPTTEAMSTORE</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">Tổng đài hỗ trợ 24/7, địa chỉ cửa hàng trải nghiệm dùng thử đai trực tiếp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Info Cards */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center text-lg">
              <i className="fa-solid fa-headset"></i>
            </div>
            <h3 className="font-serif-title text-base font-bold">Tổng Đài Hotline Hỗ Trợ 24/7</h3>
            <p className="text-lg font-mono font-bold text-[#C9A84C]">1900 8888 • 0909 123 456</p>
            <p className="text-gray-400">Tư vấn chọn mua đai DX/CSM, hỗ trợ tra cứu mã vận đơn 24/7</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] flex items-center justify-center text-lg">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <h3 className="font-serif-title text-base font-bold">Showroom Trải Nghiệm Trung Tâm</h3>
            <p className="text-gray-300 font-bold">158 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh</p>
            <p className="text-gray-400">Mở cửa: 08:30 - 21:30 (Thứ Hai đến Chủ Nhật)</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-[#1A1A1A] border border-[#2A2A2A] p-6 sm:p-8 rounded-3xl space-y-4 text-xs">
          <h3 className="font-serif-title text-xl font-bold">Gửi Thắc Mắc Hoặc Yêu Cầu Đặt Hàng Riêng</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-400 uppercase text-[10px] mb-1">Họ tên của bạn *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase text-[10px] mb-1">Email liên hệ *</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-400 uppercase text-[10px] mb-1">Nội dung câu hỏi / Tên đai muốn pre-order *</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập chi tiết yêu cầu của bạn..."
                className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl p-3 text-xs text-white h-28 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#a27e2a] text-[#0A0A0A] font-extrabold text-xs rounded-xl shadow-lg"
            >
              Gửi Thông Tin Cho Store
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
