import React, { useState } from 'react';
import { WarrantyTicket } from '../types';

interface WarrantyViewProps {
  onAddWarrantyTicket: (ticket: WarrantyTicket) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WarrantyView: React.FC<WarrantyViewProps> = ({ onAddWarrantyTicket, showToast }) => {
  const [lookupSerial, setLookupSerial] = useState('');
  const [lookupResult, setLookupResult] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [serial, setSerial] = useState('');
  const [prodName, setProdName] = useState('DX Henshin Belt Gavv');
  const [issue, setIssue] = useState<'Lỗi Âm Thanh/Loa' | 'Lỗi Đèn LED' | 'Lỗi Nhận Thẻ/Buckle' | 'Hỏng Nút Bấm' | 'Khác'>('Lỗi Âm Thanh/Loa');
  const [desc, setDesc] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupSerial.trim()) return;
    const clean = lookupSerial.trim().toUpperCase();
    if (clean.includes('BANDAI') || clean.length > 8) {
      setLookupResult(`✅ Mã Serial [${clean}] hợp lệ! Đã kích hoạt bảo hành Bandai Japan 1-đổi-1 trong 30 ngày (Đến ngày 20/08/2026).`);
    } else {
      setLookupResult(`⚠️ Mã Serial [${clean}] không tìm thấy trên hệ thống hoặc đã hết hạn.`);
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !orderCode || !desc) {
      showToast('⚠️ Vui lòng điền đủ các trường bắt buộc!', 'error');
      return;
    }

    const ticket: WarrantyTicket = {
      id: 'WR-' + Math.floor(100000 + Math.random() * 900000),
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      orderCode,
      productSerial: serial || 'BANDAI-AUTO-SERIAL',
      productName: prodName,
      issueType: issue,
      description: desc,
      status: 'Đang tiếp nhận',
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    onAddWarrantyTicket(ticket);
    setName('');
    setPhone('');
    setEmail('');
    setOrderCode('');
    setSerial('');
    setDesc('');
    showToast(`🎉 Đã gửi ticket bảo hành #${ticket.id}! Kỹ thuật viên Team NPT sẽ gọi hỗ trợ trong 30 phút.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-[#F5F2EB]">
      {/* Page Header */}
      <div className="border-b border-cyan-500/25 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs uppercase font-extrabold text-cyan-300 tracking-widest">TRUNG TÂM BẢO HÀNH CHÍNH HÃNG</span>
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-white text-pop">
          Bảo Hành & <span className="aqua-gradient-text">HỖ TRỢ KỸ THUẬT ĐAI HENSHIN</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Chính sách 1-đổi-1 trong 30 ngày cho vi mạch, chip âm thanh, motor xoay và đèn LED Bandai Japan
        </p>
      </div>

      {/* 1. Policy & Care Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#080e1e] border border-cyan-500/35 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-serif-title text-lg font-bold text-cyan-300 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-cyan-400"></i> Chính Sách Đổi Mới 1-Đổi-1
            </h3>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2.5">
                <i className="fa-solid fa-circle-check text-[#00f5d4] mt-0.5 text-sm shrink-0"></i>
                <span><strong className="text-white">Đổi mới 100%:</strong> Đổi ngay đai mới nguyên hộp trong 30 ngày nếu phát sinh lỗi mạch chip, hỏng loa hoặc nút bấm vật lý từ nhà sản xuất.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <i className="fa-solid fa-circle-check text-[#00f5d4] mt-0.5 text-sm shrink-0"></i>
                <span><strong className="text-white">Kiểm định Bandai Seal:</strong> Đai còn tem kiểm định, không có vệt nứt vỡ do va đập rơi ngâm nước hoặc can thiệp mod chip bên ngoài.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <i className="fa-solid fa-circle-check text-[#00f5d4] mt-0.5 text-sm shrink-0"></i>
                <span><strong className="text-white">Freeship 2 chiều 0đ:</strong> NPTTEAMSTORE tài trợ 100% chi phí vận chuyển 2 chiều toàn quốc cho toàn bộ sản phẩm bảo hành.</span>
              </li>
            </ul>
          </div>

          {/* Serial Code Lookup Widget */}
          <div className="bg-[#080e1e] border border-cyan-500/35 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-serif-title text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-cyan-400 text-xs"></i>
              Tra Cứu Mã Serial Bảo Hành
            </h3>
            <form onSubmit={handleLookup} className="flex gap-2">
              <input 
                type="text"
                value={lookupSerial}
                onChange={(e) => setLookupSerial(e.target.value)}
                placeholder="Nhập mã Serial trên hóa đơn / vỏ hộp..."
                className="flex-grow bg-[#050914] border border-cyan-500/40 focus:border-cyan-300 rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono placeholder-slate-500 focus:outline-none"
              />
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs rounded-xl whitespace-nowrap hover:brightness-110 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                Tra Cứu
              </button>
            </form>
            {lookupResult && (
              <div className="bg-[#050914] border border-cyan-500/35 p-3.5 rounded-xl text-xs text-cyan-200 font-medium">
                {lookupResult}
              </div>
            )}
          </div>
        </div>

        {/* 2. Online Registration Form */}
        <div className="lg:col-span-6 bg-[#080e1e] border border-cyan-500/35 p-6 sm:p-8 rounded-3xl space-y-5 text-xs shadow-xl">
          <div className="border-b border-cyan-500/20 pb-3">
            <h3 className="font-serif-title text-xl font-bold text-white text-pop">
              Đăng Ký Yêu Cầu Bảo Hành Online
            </h3>
            <p className="text-slate-300 text-[11px] mt-0.5">Tiếp nhận nhanh và xử lý trong vòng 30 phút</p>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Họ tên khách hàng *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050914] border border-cyan-500/35 focus:border-cyan-300 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Số điện thoại *</label>
                <input 
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#050914] border border-cyan-500/35 focus:border-cyan-300 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Mã đơn hàng *</label>
                <input 
                  type="text"
                  required
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  placeholder="ORDER-XXXXXX"
                  className="w-full bg-[#050914] border border-cyan-500/35 focus:border-cyan-300 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Mã Serial sản phẩm</label>
                <input 
                  type="text"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="BANDAI-..."
                  className="w-full bg-[#050914] border border-cyan-500/35 focus:border-cyan-300 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Loại sự cố gặp phải *</label>
              <select 
                value={issue}
                onChange={(e) => setIssue(e.target.value as any)}
                className="w-full bg-[#050914] border border-cyan-500/35 focus:border-cyan-300 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="Lỗi Âm Thanh/Loa">Lỗi Âm Thanh / Mất Tiếng Loa</option>
                <option value="Lỗi Đèn LED">Lỗi Đèn LED Không Sáng</option>
                <option value="Lỗi Nhận Thẻ/Buckle">Lỗi Nhận Thẻ / Buckle / Item Khóa</option>
                <option value="Hỏng Nút Bấm">Kẹt Công Tắc / Nút Bấm Cơ</option>
                <option value="Khác">Khác...</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase text-[10px] mb-1">Mô tả tình trạng lỗi chi tiết *</label>
              <textarea 
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết lỗi chập pin, rè loa hay sai hiệu ứng..."
                className="w-full bg-[#050914] border border-cyan-500/35 focus:border-cyan-300 rounded-xl p-3 text-xs text-white h-24 resize-none focus:outline-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#00f5d4] via-[#06b6d4] to-[#0284c7] hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/25 cursor-pointer transition active:scale-95"
            >
              <i className="fa-solid fa-paper-plane mr-1.5"></i>
              Gửi Yêu Cầu Bảo Hành Ngay
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
