import React, { useState, useEffect } from 'react';
import { playFanfareSound, playLaserClashSound } from '../utils/sound';

interface TeamTributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface TeamMemberItem {
  id: string;
  name: string;
  roleTitle: string;
  image: string;
  isLeader?: boolean;
  isViceLeader?: boolean;
}

// 5 thành viên chính thức từ thư mục teamnpt - Chỉ ghi tên, không ghi nhiệm vụ
const LEADER: TeamMemberItem = {
  id: 'dat',
  name: 'Đoàn Tiến Đạt',
  roleTitle: 'Trưởng nhóm',
  image: '/Ảnh Sản Phẩm/teamnpt/Đoàn Tiến Đạt.jpg',
  isLeader: true
};

const VICE_LEADER: TeamMemberItem = {
  id: 'luan',
  name: 'Vũ Tạ Hữu Luân',
  roleTitle: 'Phó nhóm',
  image: '/Ảnh Sản Phẩm/teamnpt/Vũ Tạ Hữu Luân.jpg',
  isViceLeader: true
};

const MEMBERS: TeamMemberItem[] = [
  {
    id: 'hiep',
    name: 'Hoàng Trọng Hiệp',
    roleTitle: 'Thành viên',
    image: '/Ảnh Sản Phẩm/teamnpt/Hoàng Trọng Hiệp.jpg'
  },
  {
    id: 'danh',
    name: 'Nguyễn Thành Danh',
    roleTitle: 'Thành viên',
    image: '/Ảnh Sản Phẩm/teamnpt/Nguyễn Thành Danh.jpg'
  },
  {
    id: 'binh',
    name: 'Vũ Thanh Bình',
    roleTitle: 'Thành viên',
    image: '/Ảnh Sản Phẩm/teamnpt/Vũ Thanh Bình.png'
  }
];

export const TeamTributeModal: React.FC<TeamTributeModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [likes, setLikes] = useState<{ [key: string]: number }>({
    dat: 1250,
    luan: 890,
    hiep: 620,
    danh: 580,
    binh: 610
  });

  const [fullImageMember, setFullImageMember] = useState<TeamMemberItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      playFanfareSound();
    }
  }, [isOpen]);

  // Intercept ESC to close full image preview first if open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullImageMember) {
        e.stopImmediatePropagation();
        e.preventDefault();
        setFullImageMember(null);
      }
    };
    if (fullImageMember) {
      window.addEventListener('keydown', handleKeyDown, { capture: true });
    }
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [fullImageMember]);

  if (!isOpen) return null;

  const handleLike = (id: string, name: string) => {
    setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    playLaserClashSound();
    if (showToast) {
      showToast(`⭐ Đã gửi lời tri ân đến ${name}!`, 'success');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Sized comfortably - max-w-2xl sm:max-w-3xl, clear & spacious */}
      <div 
        className="relative w-full max-w-2xl sm:max-w-3xl rounded-3xl bg-[#070e1e] border-2 border-cyan-400/80 shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold-Cyan Accent Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400"></div>

        {/* Header Bar */}
        <div className="bg-[#09152e] px-5 py-4 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.4)]">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <h3 className="font-serif-title text-base sm:text-xl font-black text-white text-pop flex items-center gap-2">
                <span>Tri Ân Các Thành Viên Team NPT</span>
                <span className="text-sm">🎄</span>
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0c1a38] hover:bg-cyan-900/60 text-slate-300 hover:text-white border border-cyan-500/30 flex items-center justify-center text-sm transition cursor-pointer"
            title="Đóng bảng tri ân"
          >
            ✕
          </button>
        </div>

        {/* Content Body - Sized comfortably, clear photos, strictly only names */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto no-scrollbar">

          {/* 1. TRƯỞNG NHÓM: ĐOÀN TIẾN ĐẠT (VIỀN VÀNG RỰC RỠ, RÕ NÉT) */}
          <div className="bg-gradient-to-r from-[#1c1404] via-[#2a1d06] to-[#181103] rounded-2xl p-4 sm:p-5 border-2 border-amber-400/90 shadow-[0_0_30px_rgba(251,191,36,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4 group">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0 w-full sm:w-auto">
              {/* Avatar with Vibrant Gold Border - Clickable for Full Image */}
              <div 
                className="relative shrink-0 cursor-pointer group/avatar"
                onClick={() => setFullImageMember(LEADER)}
                title={`Bấm để xem ảnh đầy đủ của ${LEADER.name}`}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#0c0902] p-1 border-4 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.85)] ring-4 ring-yellow-400/50 transition-transform duration-300 group-hover/avatar:scale-105 relative">
                  <img 
                    src={LEADER.image} 
                    alt={LEADER.name} 
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png';
                    }}
                  />
                  {/* Magnifying Glass Zoom Icon on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                    <i className="fa-solid fa-magnifying-glass-plus text-amber-300 text-lg drop-shadow"></i>
                  </div>
                </div>
                <span className="absolute -top-3 -left-3 text-lg drop-shadow-md bg-amber-400 text-amber-950 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white">👑</span>
              </div>

              {/* Name & Badge - Strictly name only */}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border border-yellow-200 shadow-md mb-1.5">
                  👑 Trưởng Nhóm
                </span>
                <h4 className="font-serif-title font-black text-xl sm:text-2xl text-amber-300 text-pop tracking-wide truncate">
                  {LEADER.name}
                </h4>
                <p className="text-[11px] text-amber-200/70 mt-0.5 flex items-center gap-1">
                  <i className="fa-solid fa-expand text-[10px]"></i> Bấm vào ảnh để xem toàn màn hình
                </p>
              </div>
            </div>

            {/* Like button */}
            <button
              onClick={() => handleLike(LEADER.id, LEADER.name)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-amber-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95 shrink-0 cursor-pointer"
            >
              <span>👑 Tri ân Trưởng nhóm</span>
              <span className="font-mono text-xs bg-black/20 px-2.5 py-0.5 rounded-full text-amber-950 font-bold">
                {likes[LEADER.id]}
              </span>
            </button>
          </div>

          {/* 2. PHÓ NHÓM: VŨ TẠ HỮU LUÂN (RÕ RÀNG, ĐỦ NHÌN) */}
          <div className="bg-gradient-to-r from-[#08152e] via-[#0d2248] to-[#07132a] rounded-2xl p-4 sm:p-5 border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4 group">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0 w-full sm:w-auto">
              {/* Avatar - Clickable for Full Image */}
              <div 
                className="relative shrink-0 cursor-pointer group/avatar"
                onClick={() => setFullImageMember(VICE_LEADER)}
                title={`Bấm để xem ảnh đầy đủ của ${VICE_LEADER.name}`}
              >
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#040916] p-1 border-3 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] ring-2 ring-cyan-300/40 transition-transform duration-300 group-hover/avatar:scale-105 relative">
                  <img 
                    src={VICE_LEADER.image} 
                    alt={VICE_LEADER.name} 
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png';
                    }}
                  />
                  {/* Magnifying Glass Zoom Icon on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                    <i className="fa-solid fa-magnifying-glass-plus text-cyan-300 text-base drop-shadow"></i>
                  </div>
                </div>
                <span className="absolute -top-2.5 -left-2.5 text-base drop-shadow-md bg-cyan-400 text-black w-6 h-6 rounded-full flex items-center justify-center border border-white">⚔️</span>
              </div>

              {/* Name & Badge - Strictly name only */}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 text-slate-950 border border-cyan-200 shadow-md mb-1.5">
                  ⚔️ Phó Nhóm
                </span>
                <h4 className="font-serif-title font-black text-lg sm:text-xl text-cyan-200 text-pop tracking-wide truncate">
                  {VICE_LEADER.name}
                </h4>
                <p className="text-[11px] text-cyan-200/70 mt-0.5 flex items-center gap-1">
                  <i className="fa-solid fa-expand text-[10px]"></i> Bấm vào ảnh để xem toàn màn hình
                </p>
              </div>
            </div>

            {/* Like button */}
            <button
              onClick={() => handleLike(VICE_LEADER.id, VICE_LEADER.name)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#0a1835] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 flex items-center justify-center gap-2 transition active:scale-95 shrink-0 cursor-pointer"
            >
              <span>⚔️ Tri ân Phó nhóm</span>
              <span className="font-mono text-xs bg-black/40 px-2 py-0.5 rounded-full text-cyan-200">
                {likes[VICE_LEADER.id]}
              </span>
            </button>
          </div>

          {/* 3. 3 THÀNH VIÊN: HOÀNG TRỌNG HIỆP, NGUYỄN THÀNH DANH, VŨ THANH BÌNH (RỘNG RÃI, ĐỦ NHÌN) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 px-1 border-b border-cyan-500/30 pb-2">
              <span className="text-base">⭐</span>
              <h4 className="font-serif-title text-sm sm:text-base font-black text-cyan-300 uppercase tracking-wider">
                Thành Viên
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {MEMBERS.map((member) => (
                <div 
                  key={member.id}
                  className="bg-gradient-to-b from-[#09152b] via-[#0b1c38] to-[#071224] rounded-2xl p-4 border border-cyan-500/40 hover:border-cyan-400 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col items-center text-center group"
                >
                  {/* Avatar - Clickable for Full Image */}
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#040916] p-0.5 border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-2.5 transition-transform duration-300 group-hover:scale-105 cursor-pointer relative group/avatar"
                    onClick={() => setFullImageMember(member)}
                    title={`Bấm để xem ảnh đầy đủ của ${member.name}`}
                  >
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover rounded-[14px]"
                      onError={(e) => {
                        e.currentTarget.src = '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png';
                      }}
                    />
                    {/* Magnifying Glass Zoom Icon on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-[14px] backdrop-blur-[1px]">
                      <i className="fa-solid fa-magnifying-glass-plus text-cyan-300 text-base drop-shadow"></i>
                    </div>
                  </div>

                  {/* Name & Badge - Strictly name only */}
                  <span className="inline-block text-[9.5px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mb-1">
                    ⭐ Thành viên
                  </span>
                  <h5 className="font-serif-title font-black text-sm sm:text-base text-white group-hover:text-cyan-300 transition truncate w-full mb-1 text-pop">
                    {member.name}
                  </h5>
                  <button 
                    type="button"
                    onClick={() => setFullImageMember(member)}
                    className="text-[11px] text-cyan-400/80 hover:text-cyan-200 underline mb-2.5 flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-expand text-[10px]"></i> Xem ảnh full
                  </button>

                  {/* Like button */}
                  <button
                    onClick={() => handleLike(member.id, member.name)}
                    className="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-[#07162c] hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer mt-auto"
                  >
                    <span>⭐ Tri ân</span>
                    <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded-full">
                      {likes[member.id]}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition duration-200 cursor-pointer"
            >
              <i className="fa-solid fa-check mr-1.5"></i> Đóng Bảng Tri Ân
            </button>
          </div>

        </div>
      </div>

      {/* FULL IMAGE LIGHTBOX OVERLAY */}
      {fullImageMember && (
        <div 
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-xl animate-fade-in select-none"
          onClick={(e) => {
            e.stopPropagation();
            setFullImageMember(null);
          }}
        >
          {/* Top Bar for Full Image */}
          <div 
            className="w-full max-w-4xl flex items-center justify-between mb-3 px-2 sm:px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md ${
                fullImageMember.isLeader 
                  ? 'bg-amber-400 text-amber-950 border border-yellow-200' 
                  : fullImageMember.isViceLeader 
                  ? 'bg-cyan-400 text-slate-950 border border-cyan-200' 
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
              }`}>
                {fullImageMember.isLeader ? '👑 Trưởng Nhóm' : fullImageMember.isViceLeader ? '⚔️ Phó Nhóm' : '⭐ Thành Viên'}
              </span>
              <h3 className="font-serif-title font-black text-white text-base sm:text-xl text-pop">
                {fullImageMember.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={fullImageMember.image}
                target="_blank"
                rel="noreferrer"
                download={`${fullImageMember.name}.jpg`}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
                title="Mở ảnh gốc trong tab mới"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                <span className="hidden sm:inline">Mở ảnh tab mới</span>
              </a>
              <button
                onClick={() => setFullImageMember(null)}
                className="w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 hover:text-white flex items-center justify-center text-base transition cursor-pointer active:scale-95 shadow-lg"
                title="Đóng xem ảnh (ESC)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Center Image Container */}
          <div 
            className="relative max-w-4xl max-h-[78vh] flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullImageMember.image}
              alt={fullImageMember.name}
              className={`max-h-[72vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-all duration-300 ${
                fullImageMember.isLeader
                  ? 'border-3 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.5)] ring-4 ring-yellow-400/30'
                  : 'border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.45)] ring-4 ring-cyan-400/20'
              }`}
              onError={(e) => {
                e.currentTarget.src = '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png';
              }}
            />
          </div>

          {/* Bottom Hint */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700/60 shadow">
            <i className="fa-regular fa-circle-question text-cyan-400"></i>
            <span>Bấm ra ngoài vùng ảnh hoặc phím <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[11px] font-bold">ESC</kbd> để đóng</span>
          </div>
        </div>
      )}
    </div>
  );
};

