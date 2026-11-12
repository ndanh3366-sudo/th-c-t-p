import React, { useState } from 'react';
import { BlogPost } from '../types';

interface BlogViewProps {
  blogs: BlogPost[];
  selectedPost?: BlogPost | null;
  onSelectPost?: (post: BlogPost | null) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ blogs, selectedPost: activePostFromProp, onSelectPost }) => {
  const [internalSelectedPost, setInternalSelectedPost] = useState<BlogPost | null>(null);

  const currentPost = activePostFromProp !== undefined ? activePostFromProp : internalSelectedPost;

  const handleSetPost = (p: BlogPost | null) => {
    if (onSelectPost) {
      onSelectPost(p);
    } else {
      setInternalSelectedPost(p);
    }
  };

  if (currentPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-[#F5F2EB]">
        <button 
          onClick={() => handleSetPost(null)}
          className="text-xs font-black text-[#C9A84C] hover:underline flex items-center gap-2 uppercase tracking-wider font-serif-title bg-[#121018] px-4 py-2 rounded-xl border border-[#C9A84C]/40 hover:border-[#C9A84C]"
        >
          <i className="fa-solid fa-arrow-left"></i> Trở Về Danh Sách Tin Tức Mới
        </button>

        <div className="space-y-5 bg-[#121018] p-6 sm:p-8 rounded-3xl border-2 border-[#C9A84C]/60 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-block bg-[#8B1E1E] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest border border-[#C9A84C]/60 font-serif-title shadow-md">
              👑 {currentPost.category}
            </span>
            <span className="text-xs text-gray-400 font-semibold">• {currentPost.date}</span>
          </div>

          <h1 className="font-serif-title text-2xl sm:text-4xl font-black leading-snug gold-gradient-text">
            {currentPost.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 border-y border-[#C9A84C]/30 py-3">
            <span>Tác giả: <strong className="text-[#C9A84C]">{currentPost.author}</strong></span>
            <span>•</span>
            <span><i className="fa-regular fa-clock text-[#C9A84C] mr-1"></i> Thời gian đọc: {currentPost.readTime}</span>
            <span>•</span>
            <span><i className="fa-regular fa-eye text-[#C9A84C] mr-1"></i> {currentPost.views.toLocaleString('vi-VN')} lượt xem</span>
          </div>

          <div className="w-full rounded-2xl overflow-hidden bg-[#08070C] border-2 border-[#C9A84C]/50 shadow-2xl relative max-h-[480px]">
            <img 
              src={currentPost.image} 
              alt={currentPost.title} 
              className="w-full h-full object-cover max-h-[480px]" 
              onError={(e) => {
                e.currentTarget.src = '/Tin Tức & Bài Viết Blog/thumb_hiep-si-mat-na-zeztz_4567685e.webp';
              }}
            />
          </div>

          <div 
            className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-200 leading-relaxed pt-4 font-sans"
            dangerouslySetInnerHTML={{ __html: currentPost.contentHtml }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F5F2EB]">
      <div className="border-b border-[#C9A84C]/40 pb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif-title text-2xl sm:text-4xl font-black uppercase tracking-wide">
            TIN TỨC MỚI & <span className="gold-gradient-text">REVIEW BÀO QUẢN QUÝ TỘC</span>
          </h2>
          <p className="text-xs text-gray-300 mt-1 font-medium">Cập nhật tin tức Kamen Rider mới nhất, sự kiện Bandai Japan và dòng sản phẩm sưu tầm hoàng gia</p>
        </div>
        <div className="hidden sm:block">
          <span className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full bg-gradient-to-r from-[#8B1E1E] via-[#C9A84C]/30 to-[#121018] border border-[#C9A84C]/60 text-[#F5F2EB] shadow-lg">
            👑 OFFICIAL NEWS & REVIEWS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((b, idx) => (
          <div 
            key={b.id}
            onClick={() => handleSetPost(b)}
            className={`bg-[#121018] rounded-2xl overflow-hidden cursor-pointer group transition duration-300 flex flex-col justify-between ${
              idx % 2 === 0
                ? 'border-2 border-[#C9A84C]/60 hover:border-[#F59E0B] shadow-[0_0_20px_rgba(201,168,76,0.2)]'
                : 'border-2 border-slate-300/60 hover:border-slate-100 shadow-[0_0_20px_rgba(203,213,225,0.2)]'
            }`}
          >
            <div className="aspect-video overflow-hidden bg-[#08070C] relative">
              <img 
                src={b.image} 
                alt={b.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                onError={(e) => {
                  e.currentTarget.src = '/Tin Tức & Bài Viết Blog/thumb_hiep-si-mat-na-zeztz_4567685e.webp';
                }}
              />
              <div className="absolute top-3 left-3 bg-[#08070C]/90 backdrop-blur-md border border-[#C9A84C]/60 text-[#C9A84C] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-serif-title shadow-lg">
                {b.category}
              </div>
            </div>

            <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                  <span><i className="fa-regular fa-calendar-check mr-1 text-[#C9A84C]"></i> {b.date}</span>
                  <span className="text-[#C9A84C]">{b.author}</span>
                </div>
                <h3 className="font-serif-title font-bold text-sm text-[#F5F2EB] group-hover:text-[#C9A84C] line-clamp-2 transition leading-snug">
                  {b.title}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {b.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#2A2A2A]/60 flex justify-between items-center text-[11px] text-gray-400 font-semibold">
                <span><i className="fa-regular fa-clock mr-1 text-[#C9A84C]"></i> {b.readTime} đọc</span>
                <span className="text-[#C9A84C] font-bold group-hover:translate-x-1 transition duration-300">Đọc ngay →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

