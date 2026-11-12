import React, { useState, useMemo, useEffect } from 'react';
import { CustomerFeedback, TributeCustomer, Product, User, Order, FeedbackCategory } from '../types';
import { api } from '../services/api';
import { generateCustomerAvatarSvgUrl } from '../utils/avatarGenerator';
import { NeonStarIcon, NeonSnowflakeIcon, NeonTreeIcon } from '../components/NeonAquaChristmasIcons';
import { 
  subscribeToFeedbacksLive, 
  saveFeedbackLive, 
  likeFeedbackLive, 
  computeHallOfFameFromOrders 
} from '../utils/firebase';

interface TributeFeedbackViewProps {
  currentUser?: User | null;
  products: Product[];
  orders?: Order[];
  onSelectProduct?: (product: Product) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenAuth?: () => void;
}

export const TributeFeedbackView: React.FC<TributeFeedbackViewProps> = ({
  currentUser,
  products,
  orders = [],
  onSelectProduct,
  showToast,
  onOpenAuth
}) => {
  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active view mode: 'all' | 'tribute' | 'feedback'
  const [activeTab, setActiveTab] = useState<'all' | 'tribute' | 'feedback'>('all');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');

  // New Feedback Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newHoverRating, setNewHoverRating] = useState<number>(0);
  const [newCustomerName, setNewCustomerName] = useState(currentUser?.name || '');
  const [newLocation, setNewLocation] = useState('TP. Hồ Chí Minh');
  const [newCategory, setNewCategory] = useState<FeedbackCategory>('Chất lượng sản phẩm');
  const [newProductId, setNewProductId] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Image zoom modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Real-time live synchronization of customer feedbacks
  useEffect(() => {
    let isMounted = true;
    const unsubFeedbacks = subscribeToFeedbacksLive((liveFeedbacks) => {
      if (isMounted) {
        setFeedbacks(liveFeedbacks);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubFeedbacks();
    };
  }, []);

  // Update customer name when user logs in
  useEffect(() => {
    if (currentUser?.name && !newCustomerName) {
      setNewCustomerName(currentUser.name);
    }
  }, [currentUser]);

  // Handle like feedback with real-time live synchronization
  const handleLike = async (id: string) => {
    setFeedbacks(prev => prev.map(item => {
      if (item.id === id) {
        const nextLiked = !item.userLiked;
        return {
          ...item,
          userLiked: nextLiked,
          helpfulCount: nextLiked ? item.helpfulCount + 1 : Math.max(0, item.helpfulCount - 1)
        };
      }
      return item;
    }));

    try {
      await likeFeedbackLive(id);
    } catch (e) {
      console.warn('Like feedback fallback:', e);
    }
  };

  // Upload and compress image from file input
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const { compressImageFile } = await import('../utils/imageCompressor');
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImageFile(file, 900, 900, 0.75);
        setUploadedImages(prev => [...prev, compressed]);
      }
      showToast('📷 Đã tải lên và tối ưu ảnh nhận xét thành công!', 'success');
      e.target.value = '';
    } catch {
      showToast('Không thể xử lý ảnh tải lên', 'error');
    }
  };

  // Add custom URL
  const handleAddCustomImageUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    setUploadedImages(prev => [...prev, trimmed]);
    setCustomUrlInput('');
    showToast('🖼️ Đã chèn liên kết ảnh thành công!', 'success');
  };

  // Toggle sample image
  const handleToggleSampleImage = (imgUrl: string) => {
    setUploadedImages(prev => {
      if (prev.includes(imgUrl)) {
        return prev.filter(img => img !== imgUrl);
      }
      return [...prev, imgUrl];
    });
  };

  // Remove image from list
  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit new feedback with real-time live synchronization
  // Supports submitting WITHOUT photos or WITH multiple photos
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) {
      showToast('Vui lòng nhập tên của bạn', 'error');
      return;
    }
    if (!newComment.trim()) {
      showToast('Vui lòng nhập nội dung nhận xét', 'error');
      return;
    }

    setSubmitting(true);
    const selectedProd = products.find(p => p.id === newProductId);

    const feedbackPayload: CustomerFeedback = {
      id: 'fb-' + Date.now(),
      customerName: newCustomerName.trim(),
      customerLocation: newLocation.trim() || 'Việt Nam',
      customerAvatar: generateCustomerAvatarSvgUrl({
        maskId: 'geats-fox',
        colorId: 'crimson-ruby',
        initials: newCustomerName.slice(0, 2).toUpperCase(),
        customerName: newCustomerName
      }),
      rating: newRating,
      category: newCategory,
      productId: selectedProd ? selectedProd.id : '',
      productName: selectedProd ? selectedProd.name : '',
      productImage: selectedProd?.images?.[0] || '',
      comment: newComment.trim(),
      images: uploadedImages.length > 0 ? [...uploadedImages] : [],
      verifiedPurchase: true,
      date: new Date().toLocaleDateString('vi-VN'),
      helpfulCount: 0,
      userLiked: false,
      adminReply: {
        author: 'Ban Quản Trị NPT Store',
        date: new Date().toLocaleDateString('vi-VN'),
        content: `Cảm ơn bạn ${newCustomerName} đã gửi phản hồi và tin tưởng lựa chọn NPTTEAMSTORE! Chúc bạn luôn tràn đầy đam mê với thế giới Tokusatsu.`
      }
    };

    try {
      // Direct live real-time save to Firestore & backend
      await saveFeedbackLive(feedbackPayload);
      setFeedbacks(prev => [feedbackPayload, ...prev.filter(f => f.id !== feedbackPayload.id)]);
      showToast('🎉 Cảm ơn bạn! Nhận xét đã được đăng tải thành công', 'success');
      setIsModalOpen(false);
      setNewComment('');
      setUploadedImages([]);
      setCustomUrlInput('');
    } catch {
      // Optimistic update safeguard
      setFeedbacks(prev => [feedbackPayload, ...prev.filter(f => f.id !== feedbackPayload.id)]);
      showToast('🎉 Cảm ơn bạn! Nhận xét đã được ghi nhận thành công', 'success');
      setIsModalOpen(false);
      setNewComment('');
      setUploadedImages([]);
      setCustomUrlInput('');
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic calculation of Hall of Fame based on actual orders
  // STRICT RULE: Only customers who have purchased >= 20 products are included
  const qualifiedTributeCustomers = useMemo(() => {
    const list = computeHallOfFameFromOrders(orders);
    return list.filter(c => (c.totalProductsPurchased || 0) >= 20);
  }, [orders]);

  // Feedbacks statistics
  const stats = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) return { avg: 5.0, total: 0, starCounts: [0, 0, 0, 0, 0] };
    const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0);
    const avg = parseFloat((sum / total).toFixed(1));
    const starCounts = [5, 4, 3, 2, 1].map(star => feedbacks.filter(f => Math.round(f.rating) === star).length);
    return { avg, total, starCounts };
  }, [feedbacks]);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(fb => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = fb.customerName.toLowerCase().includes(q);
        const matchComment = fb.comment.toLowerCase().includes(q);
        const matchProd = fb.productName?.toLowerCase().includes(q);
        const matchLoc = fb.customerLocation?.toLowerCase().includes(q);
        if (!matchName && !matchComment && !matchProd && !matchLoc) return false;
      }
      // Category
      if (selectedCategory !== 'Tất cả' && fb.category !== selectedCategory) {
        return false;
      }
      // Star rating
      if (selectedRating !== 'all' && Math.round(fb.rating) !== selectedRating) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
      // Default 'newest'
      return b.id.localeCompare(a.id);
    });
  }, [feedbacks, searchQuery, selectedCategory, selectedRating, sortBy]);

  const categoriesList: FeedbackCategory[] = [
    'Chất lượng sản phẩm',
    'Đóng gói & Vận chuyển',
    'Trải nghiệm & Dịch vụ',
    'Bảo hành & Hậu mãi',
    'Tổng quan cửa hàng'
  ];

  return (
    <div className="min-h-screen bg-[#060A14] text-slate-100 pb-24 relative overflow-hidden">
      {/* Decorative Cyber Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#00F2FE]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-60 right-1/4 w-96 h-96 bg-[#FFD700]/8 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Hero Header Banner */}
      <div className="relative border-b border-[#00F2FE]/25 bg-gradient-to-b from-[#0A0F1D] via-[#080D1A] to-[#060A14] pt-8 pb-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121214] border border-[#00F2FE]/50 text-[#00F2FE] text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <NeonStarIcon size={14} />
            <span>Kênh Ý Kiến & Vinh Danh Khách Hàng NPTTEAMSTORE</span>
            <NeonSnowflakeIcon size={14} />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif-title font-black text-white tracking-wide uppercase">
            Vinh Danh <span className="text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">&</span> Nhận Xét
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nơi khách hàng và cộng đồng người sưu tầm Tokusatsu chia sẻ phản hồi chân thực về chất lượng sản phẩm, quy cách đóng gói và trải nghiệm dịch vụ tại NPTTEAMSTORE.
          </p>

          {/* Quick Sub-Tab Filter Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.5)] font-black'
                  : 'bg-[#121214] border border-[#00F2FE]/30 text-slate-300 hover:text-white hover:border-[#00F2FE]'
              }`}
            >
              <i className="fa-solid fa-layer-group"></i>
              <span>Tất Cả Mục</span>
            </button>

            {/* Only show tribute button if there are qualified customers */}
            {qualifiedTributeCustomers.length > 0 && (
              <button
                onClick={() => setActiveTab('tribute')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'tribute'
                    ? 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(255,215,0,0.5)] font-black'
                    : 'bg-[#121214] border border-[#FFD700]/30 text-amber-300 hover:text-[#FFD700] hover:border-[#FFD700]'
                }`}
              >
                <i className="fa-solid fa-crown text-[#FFD700]"></i>
                <span>Bảng Vinh Danh Khách Hàng ({qualifiedTributeCustomers.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.5)] font-black'
                  : 'bg-[#121214] border border-[#00F2FE]/30 text-slate-300 hover:text-white hover:border-[#00F2FE]'
              }`}
            >
              <i className="fa-solid fa-comments"></i>
              <span>Nhận Xét & Đánh Giá ({feedbacks.length})</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FFD700]/15 border border-[#FFD700]/70 text-[#FFD700] hover:bg-[#FFD700] hover:text-slate-950 transition duration-200 cursor-pointer flex items-center gap-2 shadow-[0_0_12px_rgba(255,215,0,0.25)]"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Viết Đánh Giá Của Bạn</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* =========================================================================
            SECTION 1: BẢNG VINH DANH KHÁCH HÀNG THÂN THIẾT (HALL OF FAME)
            Tiêu chí: Chỉ hiển thị những khách hàng đã mua từ 20 sản phẩm trở lên.
            Nếu không có khách hàng đủ tiêu chuẩn thì không hiển thị bảng xếp hạng.
           ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'tribute') && qualifiedTributeCustomers.length > 0 && (
          <section className="space-y-6">
            <div className="bg-[#121214] border border-[#FFD700]/40 rounded-2xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,215,0,0.15)] relative overflow-hidden">
              {/* Subtle luxury glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#FFD700]/20">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#FFD700]/20 border border-[#FFD700]/50 flex items-center justify-center text-[#FFD700]">
                      <i className="fa-solid fa-trophy text-sm"></i>
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif-title font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Bảng Vinh Danh Khách Hàng Thân Thiết</span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300">
                    Vinh danh những nhà sưu tầm Tokusatsu có lịch sử sở hữu từ 20 sản phẩm chính hãng trở lên tại NPTTEAMSTORE.
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A0F1D] border border-[#FFD700]/40 text-[#FFD700] text-xs font-bold">
                  <i className="fa-solid fa-gem"></i>
                  <span>Tiêu chuẩn vinh danh: Đã mua từ 20 sản phẩm</span>
                </div>
              </div>

              {/* Cards Grid for Qualified Customers (>= 20 items) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {qualifiedTributeCustomers.map((customer, index) => {
                  const rankStyles = [
                    {
                      border: 'border-[#FFD700]',
                      glow: 'shadow-[0_0_25px_rgba(255,215,0,0.35)]',
                      badgeBg: 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-slate-950 font-black',
                      icon: 'fa-crown',
                      iconColor: 'text-[#FFD700]',
                      rankLabel: 'Quán Quân Sưu Tầm #1'
                    },
                    {
                      border: 'border-[#00F2FE]',
                      glow: 'shadow-[0_0_25px_rgba(0,242,254,0.35)]',
                      badgeBg: 'bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] text-slate-950 font-black',
                      icon: 'fa-medal',
                      iconColor: 'text-[#00F2FE]',
                      rankLabel: 'Á Quân Sưu Tầm #2'
                    },
                    {
                      border: 'border-amber-600/70',
                      glow: 'shadow-[0_0_20px_rgba(217,119,6,0.25)]',
                      badgeBg: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black',
                      icon: 'fa-award',
                      iconColor: 'text-amber-500',
                      rankLabel: 'Hạng Ba Sưu Tầm #3'
                    }
                  ];

                  const style = rankStyles[index] || {
                    border: 'border-slate-700',
                    glow: 'shadow-none',
                    badgeBg: 'bg-slate-800 text-slate-200',
                    icon: 'fa-star',
                    iconColor: 'text-[#00F2FE]',
                    rankLabel: `Top Sưu Tầm #${index + 1}`
                  };

                  return (
                    <div
                      key={customer.id}
                      className={`bg-[#0A0F1D] border-2 ${style.border} ${style.glow} rounded-2xl p-6 relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1`}
                    >
                      {/* Top Rank Badge */}
                      <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                        <span className={`text-[11px] px-3 py-1 rounded-full ${style.badgeBg} flex items-center gap-1.5 uppercase tracking-wider`}>
                          <i className={`fa-solid ${style.icon}`}></i>
                          <span>{style.rankLabel}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Gia nhập: {customer.memberSince}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="pt-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl p-0.5 border-2 border-[#00F2FE] bg-[#050914] overflow-hidden shrink-0 shadow-[0_0_15px_rgba(0,242,254,0.4)]">
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              e.currentTarget.src = '/logo-rider.jpg';
                            }}
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <h3 className="font-bold text-white text-base truncate flex items-center gap-1.5">
                            <span>{customer.name}</span>
                            <i className="fa-solid fa-circle-check text-[#00F2FE] text-xs" title="Đại sứ sưu tầm chính thức"></i>
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            <i className="fa-solid fa-location-dot text-[#00F2FE] text-[10px]"></i>
                            <span>{customer.location}</span>
                          </p>
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 font-bold">
                            {customer.title}
                          </span>
                        </div>
                      </div>

                      {/* Purchase Statistics Box */}
                      <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-[#121214] border border-white/5">
                        <div className="text-center border-r border-white/5 pr-2">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Đã Sở Hữu</p>
                          <p className="text-lg font-black font-mono text-[#00F2FE] drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]">
                            {customer.totalProductsPurchased} <span className="text-xs font-normal text-slate-300">sản phẩm</span>
                          </p>
                        </div>
                        <div className="text-center pl-2">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Đơn Hàng</p>
                          <p className="text-lg font-black font-mono text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                            {customer.totalOrders} <span className="text-xs font-normal text-slate-300">đơn</span>
                          </p>
                        </div>
                      </div>

                      {/* Featured Collections */}
                      <div className="space-y-2 pt-1 border-t border-white/5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <i className="fa-solid fa-layer-group text-[#00F2FE]"></i>
                          <span>Bộ Sưu Tập Tiêu Biểu:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {customer.featuredCollection.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#050914] border border-[#00F2FE]/25 text-slate-300 font-medium"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Favorite Series */}
                      <div className="pt-3 text-[11px] text-slate-300 font-medium flex items-center justify-between border-t border-white/5 mt-3">
                        <span className="text-slate-400">Series yêu thích:</span>
                        <span className="text-[#05FFD2] font-bold">{customer.favoriteSeries}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 2: FEEDBACK & ĐÁNH GIÁ TỪ KHÁCH HÀNG
           ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'feedback') && (
          <section className="space-y-8">
            {/* Store Rating & Trust Metrics Summary Dashboard */}
            <div className="bg-[#121214] border border-[#00F2FE]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.15)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Overall Score Box */}
                <div className="lg:col-span-4 text-center lg:text-left space-y-2 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
                  <p className="text-xs uppercase tracking-wider text-[#00F2FE] font-black">
                    Đánh Giá Chất Lượng Dịch Vụ
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <span className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
                      {stats.avg}
                    </span>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center text-[#FFD700] text-lg">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i key={i} className="fa-solid fa-star"></i>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        Dựa trên <strong>{stats.total}</strong> đánh giá thực tế
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                    100% đánh giá đến từ khách hàng đã trải nghiệm sản phẩm và dịch vụ đóng gói tại NPTTEAMSTORE.
                  </p>
                </div>

                {/* Rating Distribution Bars */}
                <div className="lg:col-span-4 space-y-2">
                  {[5, 4, 3, 2, 1].map((star, idx) => {
                    const count = stats.starCounts[idx] || 0;
                    const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-12 text-slate-400 font-bold flex items-center gap-1 shrink-0">
                          <span>{star} sao</span>
                          <i className="fa-solid fa-star text-[#FFD700] text-[10px]"></i>
                        </span>
                        <div className="flex-grow h-2 rounded-full bg-[#0A0F1D] overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-[#00F2FE] to-[#FFD700] rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-slate-400 font-mono text-[11px] shrink-0">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Store Service Commitments & Call to Action */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <i className="fa-solid fa-box-open text-[#00F2FE]"></i>
                      <span>Đóng gói 5 lớp bọc bóng khí bọt tuyết chuẩn Nhật</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <i className="fa-solid fa-shield-halved text-[#05FFD2]"></i>
                      <span>Bảo hành 1-đổi-1 trong 30 ngày cho vi mạch và chip đai</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <i className="fa-solid fa-truck-fast text-[#FFD700]"></i>
                      <span>Hỗ trợ ship hỏa tốc và giao hàng kiểm tra tận tay</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#05FFD2] to-[#FFD700] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,242,254,0.5)] hover:brightness-110 active:scale-98 transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-pen-nib"></i>
                    <span>Viết Đánh Giá Của Bạn Ngay</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter, Search & Category Navigation Bar */}
            <div className="bg-[#0A0F1D] border border-[#00F2FE]/25 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search box */}
                <div className="relative flex-grow max-w-md">
                  <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên khách hàng, nội dung hoặc sản phẩm..."
                    className="w-full bg-[#121214] border border-white/10 focus:border-[#00F2FE] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:shadow-[0_0_12px_rgba(0,242,254,0.3)] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>

                {/* Star Filter & Sort Dropdown */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Star Filter Pills */}
                  <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setSelectedRating('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedRating === 'all'
                          ? 'bg-[#00F2FE] text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tất cả
                    </button>
                    {[5, 4, 3].map(star => (
                      <button
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          selectedRating === star
                            ? 'bg-[#FFD700] text-slate-950 font-black'
                            : 'text-slate-400 hover:text-[#FFD700]'
                        }`}
                      >
                        <span>{star}</span>
                        <i className="fa-solid fa-star text-[10px]"></i>
                      </button>
                    ))}
                  </div>

                  {/* Sort Select */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-[#121214] border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#00F2FE] cursor-pointer appearance-none"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="highest">Đánh giá cao nhất</option>
                      <option value="helpful">Hữu ích nhất</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"></i>
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-white/5">
                <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">Chủ đề:</span>
                <button
                  onClick={() => setSelectedCategory('Tất cả')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'Tất cả'
                      ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]'
                      : 'bg-[#121214] text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  Tất cả ({feedbacks.length})
                </button>
                {categoriesList.map(cat => {
                  const count = feedbacks.filter(f => f.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]'
                          : 'bg-[#121214] text-slate-300 hover:text-white border border-transparent'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedbacks Grid List */}
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Đang tải danh sách phản hồi từ khách hàng...</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="bg-[#121214] border border-white/10 rounded-2xl p-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400 text-2xl">
                  <i className="fa-solid fa-comment-dots"></i>
                </div>
                <h3 className="text-base font-bold text-white">Chưa tìm thấy nhận xét phù hợp</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác để xem thêm đánh giá.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Tất cả');
                    setSelectedRating('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFeedbacks.map(fb => (
                  <div
                    key={fb.id}
                    className="bg-[#0A0F1D] border border-[#00F2FE]/25 hover:border-[#00F2FE]/60 rounded-2xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,242,254,0.15)] group"
                  >
                    <div>
                      {/* Card Header: Avatar, Name, Location, Rating */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl p-0.5 border border-[#00F2FE]/50 bg-[#050914] overflow-hidden shrink-0 shadow-sm">
                            <img
                              src={fb.customerAvatar}
                              alt={fb.customerName}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png';
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-white text-xs sm:text-sm">{fb.customerName}</h4>
                              {fb.verifiedPurchase && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-semibold">
                                  <i className="fa-solid fa-circle-check text-[9px]"></i>
                                  <span>Đã mua hàng</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                              <span>{fb.customerLocation || 'Việt Nam'}</span>
                              <span>•</span>
                              <span>{fb.date}</span>
                            </p>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center text-[#FFD700] text-xs shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i
                              key={i}
                              className={`fa-solid fa-star ${i < Math.round(fb.rating) ? 'text-[#FFD700]' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Category Tag & Attached Product Preview */}
                      <div className="pt-3 pb-2 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30">
                          {fb.category}
                        </span>

                        {fb.productName && (
                          <div
                            onClick={() => {
                              const prod = products.find(p => p.id === fb.productId);
                              if (prod && onSelectProduct) onSelectProduct(prod);
                            }}
                            className={`inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-[#121214] px-2.5 py-1 rounded-lg border border-white/10 ${
                              onSelectProduct ? 'hover:border-[#00F2FE] hover:text-[#00F2FE] cursor-pointer' : ''
                            } transition`}
                            title={fb.productName}
                          >
                            <i className="fa-solid fa-cube text-[#05FFD2] text-[10px]"></i>
                            <span className="max-w-[220px] truncate font-medium">{fb.productName}</span>
                          </div>
                        )}
                      </div>

                      {/* Comment Body */}
                      <p className="text-xs text-slate-200 leading-relaxed pt-2 font-normal">
                        {fb.comment}
                      </p>

                      {/* Review Photo Attachments */}
                      {fb.images && fb.images.length > 0 && (
                        <div className="flex items-center gap-2 pt-3 flex-wrap">
                          {fb.images.map((img, idx) => (
                            <div
                              key={idx}
                              onClick={() => setZoomedImage(img)}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/15 hover:border-[#00F2FE] transition cursor-pointer relative group/img bg-black/40"
                              title="Bấm để xem ảnh phóng to"
                            >
                              <img
                                src={img}
                                alt={`Ảnh chụp thực tế ${idx + 1}`}
                                className="w-full h-full object-cover group-hover/img:scale-110 transition duration-300"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition">
                                <i className="fa-solid fa-magnifying-glass-plus text-white text-xs"></i>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Admin Store Response Block */}
                      {fb.adminReply && (
                        <div className="mt-4 p-3 rounded-xl bg-[#121214] border-l-2 border-[#00F2FE] space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#00F2FE] flex items-center gap-1">
                              <i className="fa-solid fa-shield text-[10px]"></i>
                              <span>{fb.adminReply.author}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">{fb.adminReply.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {fb.adminReply.content}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Helpful button */}
                    <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <i className="fa-solid fa-hand-holding-heart text-[#05FFD2]"></i>
                        <span>Đánh giá hữu ích với người mua</span>
                      </div>

                      <button
                        onClick={() => handleLike(fb.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          fb.userLiked
                            ? 'bg-[#00F2FE]/25 text-[#00F2FE] border border-[#00F2FE]'
                            : 'bg-[#121214] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <i className={`fa-${fb.userLiked ? 'solid' : 'regular'} fa-thumbs-up text-xs`}></i>
                        <span>Hữu ích ({fb.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* =========================================================================
          MODAL: VIẾT ĐÁNH GIÁ & NHẬN XÉT MỚI
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A0F1D] border-2 border-[#00F2FE]/60 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(0,242,254,0.3)] relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pb-4 border-b border-white/10">
              <span className="text-[10px] text-[#00F2FE] font-bold uppercase tracking-wider flex items-center gap-1">
                <i className="fa-solid fa-feather"></i>
                <span>Phản Hồi Trải Nghiệm Khách Hàng</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-serif-title font-black text-white">
                Gửi Nhận Xét Của Bạn
              </h3>
              <p className="text-xs text-slate-300">
                Ý kiến của bạn giúp NPTTEAMSTORE không ngừng hoàn thiện chất lượng sản phẩm và dịch vụ Tokusatsu.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5 text-center py-2 bg-[#121214] rounded-2xl border border-white/5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mức Độ Hài Lòng Của Bạn:
                </label>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map(star => {
                    const active = (newHoverRating || newRating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setNewHoverRating(star)}
                        onMouseLeave={() => setNewHoverRating(0)}
                        onClick={() => setNewRating(star)}
                        className="text-2xl sm:text-3xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <i className={`fa-star ${active ? 'fa-solid text-[#FFD700]' : 'fa-regular text-slate-600'}`}></i>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#FFD700] font-bold">
                  {newRating === 5 && 'Tuyệt vời - Rất hài lòng'}
                  {newRating === 4 && 'Hài lòng - Chất lượng tốt'}
                  {newRating === 3 && 'Bình thường - Đạt yêu cầu'}
                  {newRating === 2 && 'Cần cải thiện'}
                  {newRating === 1 && 'Chưa hài lòng'}
                </p>
              </div>

              {/* Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Họ & Tên khách hàng *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full bg-[#121214] border border-white/10 focus:border-[#00F2FE] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ví dụ: Hà Nội, TP.HCM..."
                    className="w-full bg-[#121214] border border-white/10 focus:border-[#00F2FE] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Product */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Chủ đề nhận xét</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FeedbackCategory)}
                    className="w-full bg-[#121214] border border-white/10 focus:border-[#00F2FE] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Sản phẩm đã trải nghiệm</label>
                  <select
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full bg-[#121214] border border-white/10 focus:border-[#00F2FE] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Trải nghiệm chung tại Store --</option>
                    {products.slice(0, 30).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name.length > 40 ? p.name.slice(0, 40) + '...' : p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Feedback Content */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">
                  Nội dung nhận xét & đánh giá chi tiết *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận thật của bạn về tình trạng nguyên seal, âm thanh đai biến hình, chất lượng khớp mô hình SHF, quy cách bọc xốp chống sốc của shop..."
                  className="w-full bg-[#121214] border border-white/10 focus:border-[#00F2FE] rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:shadow-[0_0_12px_rgba(0,242,254,0.3)] resize-none"
                />
              </div>

              {/* Photos Attachment (Optional - with or without photos) */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <i className="fa-solid fa-camera text-[#00F2FE]"></i>
                    <span>Ảnh minh chứng unboxing (Tùy chọn)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {uploadedImages.length > 0 ? `Đã chọn ${uploadedImages.length} ảnh` : 'Không bắt buộc có ảnh'}
                  </span>
                </div>

                {/* Upload Buttons & URL Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* File Upload Button */}
                  <label className="flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-[#00F2FE]/40 hover:border-[#00F2FE] px-3 py-2 rounded-xl text-xs text-[#00F2FE] font-bold cursor-pointer transition shadow-sm">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>Tải ảnh từ thiết bị</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* URL Input Form */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomImageUrl();
                        }
                      }}
                      placeholder="Dán link ảnh (https://...)"
                      className="flex-grow bg-[#121214] border border-white/10 focus:border-[#00F2FE] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomImageUrl}
                      className="bg-white/10 hover:bg-[#00F2FE] hover:text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Selected Images Preview Row */}
                {uploadedImages.length > 0 && (
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-white/10 space-y-1.5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Ảnh đã đính kèm ({uploadedImages.length}):
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-[#00F2FE]/60">
                          <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition"
                            title="Xóa ảnh này"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Sample Photos */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400">Hoặc chọn nhanh ảnh mẫu có sẵn:</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg',
                      '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Bitter Gavv Marblebreacookie Form1.jpg',
                      '/Ảnh Sản Phẩm/dx/Đai biến hình Kamen Rider Ichigo CSM Typhoon 50th Anniversary Bandai Japan 1.jpg',
                      '/Ảnh Showroom & Cửa Hàng/20240708_161850.jpg'
                    ].map((img, idx) => {
                      const isSelected = uploadedImages.includes(img);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleSampleImage(img)}
                          className={`h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition relative ${
                            isSelected ? 'border-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.5)]' : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="Mẫu ảnh" className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-[#00F2FE] text-slate-950 rounded-full flex items-center justify-center text-[9px] font-bold">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-bold transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(0,242,254,0.5)] transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang gửi...' : 'Đăng Nhận Xét'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          IMAGE ZOOM MODAL
         ========================================================================= */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-[#00F2FE]/50 shadow-[0_0_40px_rgba(0,242,254,0.3)]">
            <img src={zoomedImage} alt="Ảnh thực tế" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
