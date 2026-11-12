import React, { useState, useEffect } from 'react';
import { AuctionItem, User } from '../types';

interface AuctionViewProps {
  auctions: AuctionItem[];
  currentUser: User | null;
  onPlaceBid: (auctionId: string, amount: number, bidderName: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuctionView: React.FC<AuctionViewProps> = ({
  auctions,
  currentUser,
  onPlaceBid,
  showToast
}) => {
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem>(auctions[0]);
  const [bidInput, setBidInput] = useState<number>(selectedAuction ? selectedAuction.currentBid + 200000 : 0);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 24, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!selectedAuction) return null;

  const minNextBid = selectedAuction.currentBid + 100000;

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('⚠️ Vui lòng đăng nhập trước khi đặt giá đấu giá!', 'error');
      return;
    }
    if (bidInput < minNextBid) {
      showToast(`⚠️ Mức giá đấu tối thiểu tiếp theo phải từ ${minNextBid.toLocaleString('vi-VN')}đ!`, 'error');
      return;
    }

    onPlaceBid(selectedAuction.id, bidInput, currentUser.name);
    selectedAuction.currentBid = bidInput;
    selectedAuction.highestBidder = currentUser.name;
    selectedAuction.bidCount += 1;
    selectedAuction.bidHistory.unshift({
      bidderName: currentUser.name,
      amount: bidInput,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Vừa xong'
    });

    setBidInput(bidInput + 200000);
    showToast(`🎉 Đặt giá thành công! Bạn đang giữ mức giá cao nhất ${bidInput.toLocaleString('vi-VN')}đ!`, 'success');
  };

  const addQuickBid = (increment: number) => {
    setBidInput(prev => Math.max(minNextBid, prev + increment));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F5F2EB]">
      {/* Header */}
      <div className="border-b border-cyan-500/25 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs uppercase font-extrabold text-cyan-300 tracking-widest">SÀN ĐẤU GIÁ COLLECTOR CHÍNH HÃNG</span>
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-black text-white text-pop">
          Đấu Giá Đồ Chơi <span className="aqua-gradient-text">RIDER HÀNG HIẾM & GIỚI HẠN</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Săn các bản đai CSM mạ vàng, bản đai kèm chữ ký diễn viên và SHF P-Bandai sản xuất giới hạn
        </p>
      </div>

      {/* Active Auction Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Visuals */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="bg-rose-600/90 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-rose-400/50 shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>Đang Đấu Giá Trực Tiếp</span>
            </div>

            {/* Countdown Badge */}
            <div className="bg-[#080e22]/90 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-xl font-mono text-xs font-bold shadow-md">
              <i className="fa-regular fa-clock mr-1.5 text-cyan-400"></i>
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>

          <div className="relative aspect-video bg-[#050914] border border-cyan-500/35 rounded-3xl overflow-hidden flex items-center justify-center p-4 sm:p-6 shadow-xl">
            <img 
              src={selectedAuction.image} 
              alt={selectedAuction.productName} 
              className="max-w-full max-h-full object-contain filter drop-shadow-lg" 
              onError={(e) => { e.currentTarget.src = '/Sản Phẩm Đấu Giá Hoàng Gia/DX Don Onitaijin Gold Mekki Version.jpg'; }} 
            />
          </div>

          {/* Other Auction Cards Selector */}
          <div className="grid grid-cols-2 gap-3">
            {auctions.map(a => {
              const isSelected = selectedAuction.id === a.id;
              return (
                <div 
                  key={a.id}
                  onClick={() => {
                    setSelectedAuction(a);
                    setBidInput(a.currentBid + 200000);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-[#0c1630] border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.25)]' 
                      : 'bg-[#080e1e] border-cyan-500/25 opacity-75 hover:opacity-100 hover:border-cyan-400/50'
                  }`}
                >
                  <img 
                    src={a.image} 
                    alt="" 
                    className="w-12 h-12 rounded-xl object-contain p-1 bg-[#050814] border border-cyan-500/30" 
                    onError={(e) => { e.currentTarget.src = '/Sản Phẩm Đấu Giá Hoàng Gia/DX Don Onitaijin Gold Mekki Version.jpg'; }} 
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-[11px] text-white truncate">{a.productName}</h4>
                    <p className="text-[10px] text-[#00f5d4] font-mono font-bold">{a.currentBid.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Bidding Panel */}
        <div className="lg:col-span-6 bg-[#080e1e] border border-cyan-500/35 p-6 sm:p-8 rounded-3xl space-y-6 text-xs shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                {selectedAuction.era} Era
              </span>
              <span className="text-[10px] text-slate-300 font-bold bg-[#050814] border border-slate-700 px-2 py-0.5 rounded-md">
                {selectedAuction.condition}
              </span>
            </div>
            <h3 className="font-serif-title text-xl font-bold text-white text-pop leading-tight">
              {selectedAuction.productName}
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed font-medium">
              {selectedAuction.description}
            </p>
          </div>

          {/* Current Highest Bid Box */}
          <div className="bg-[#050914] border border-cyan-400/40 p-5 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold">
              <span>Giá Hiện Tại Cao Nhất</span>
              <span className="text-emerald-400 font-mono font-bold">Lượt đấu: {selectedAuction.bidCount}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#00f5d4] font-mono drop-shadow-[0_0_12px_rgba(0,245,212,0.4)]">
                {selectedAuction.currentBid.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <p className="text-[11px] text-slate-200">
              Người giữ giá cao nhất: <strong className="text-cyan-300 font-bold">{selectedAuction.highestBidder}</strong>
            </p>
          </div>

          {/* Quick Increment Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tăng giá nhanh:</span>
            <div className="grid grid-cols-3 gap-2">
              {[100000, 200000, 500000].map(inc => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => addQuickBid(inc)}
                  className="py-1.5 px-2 rounded-xl bg-[#0b1428] border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 font-mono text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  +{inc.toLocaleString('vi-VN')}đ
                </button>
              ))}
            </div>
          </div>

          {/* Place Bid Form */}
          <form onSubmit={handleBidSubmit} className="space-y-3">
            <label className="block font-bold text-slate-300 uppercase text-[10px] tracking-wider">
              Nhập Mức Giá Đấu Của Bạn (Tối thiểu {minNextBid.toLocaleString('vi-VN')}đ)
            </label>
            <div className="flex gap-2">
              <input 
                type="number" 
                min={minNextBid}
                step={50000}
                value={bidInput}
                onChange={(e) => setBidInput(Number(e.target.value))}
                className="flex-grow bg-[#050914] border border-cyan-500/40 focus:border-cyan-300 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#00f5d4] via-[#06b6d4] to-[#0284c7] hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/25 whitespace-nowrap cursor-pointer transition active:scale-95"
              >
                <i className="fa-solid fa-gavel mr-1.5"></i>
                Đặt Giá Ngay
              </button>
            </div>
          </form>

          {/* Bid History Table */}
          <div className="space-y-2 border-t border-cyan-500/25 pt-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Lịch Sử Đặt Giá</span>
              <span className="text-[10px] text-cyan-400 font-normal">Cập nhật theo thời gian thực</span>
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {selectedAuction.bidHistory.map((bh, idx) => (
                <div key={idx} className="bg-[#050914] p-2.5 rounded-xl flex justify-between items-center text-[11px] border border-cyan-500/20">
                  <span className="font-bold text-slate-200">{bh.bidderName}</span>
                  <span className="font-mono text-[#00f5d4] font-bold">{bh.amount.toLocaleString('vi-VN')}đ</span>
                  <span className="text-slate-400 text-[10px]">{bh.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
