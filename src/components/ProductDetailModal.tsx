import React, { useState } from 'react';
import { Product } from '../types';
import { api } from '../services/api';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product, e?: React.MouseEvent) => void;
  onAddToCompare?: (product: Product, e?: React.MouseEvent) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen = true,
  onClose,
  onAddToCart,
  onBuyNow = (p, q) => { onAddToCart(p, q); showToast(`⚡ Đang tiến hành thanh toán cho [${p.name}]!`, 'success'); },
  showToast,
  isFavorite = false,
  onToggleFavorite,
  onAddToCompare
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'video' | 'reviews' | 'qa'>('desc');
  const [is360Mode, setIs360Mode] = useState(false);

  // Product Variations & Add-on Deal
  const VARIATIONS = [
    { id: 'standard', name: 'Bản Tiêu Chuẩn Fullbox', extraPrice: 0, tag: 'Bán chạy' },
    { id: 'battery', name: 'Kèm Pin AAA & Khăn Nano', extraPrice: 35000, tag: 'Tiện lợi' },
    { id: 'collector', name: 'Hộp Sưu Tầm Góc Đẹp 10/10', extraPrice: 90000, tag: 'Collector' },
  ];
  const [selectedVariation, setSelectedVariation] = useState(VARIATIONS[0]);
  const [includeDealSoc, setIncludeDealSoc] = useState(false);
  const DEAL_SOC_PRICE = 49000;
  
  // Review form state with attached images
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [customImgInput, setCustomImgInput] = useState('');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // QA form state
  const [newQuestion, setNewQuestion] = useState('');

  if (!product) return null;

  const CUSTOMER_REVIEW_AVATARS = [
    { img: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png', border: 'border-red-500/50', bg: 'bg-red-950/40' },
    { img: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png', border: 'border-cyan-500/50', bg: 'bg-cyan-950/40' },
    { img: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_saber_logo_by_driftingcar_dgh9vay-pre.png', border: 'border-amber-500/50', bg: 'bg-amber-950/40' },
    { img: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_kiva_logo_by_driftingcar_dg7tj5z-pre.png', border: 'border-purple-500/50', bg: 'bg-purple-950/40' },
    { img: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_knight_logo_by_driftingcar_dg73k3x-414w-2x.png', border: 'border-blue-500/50', bg: 'bg-blue-950/40' },
    { img: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_femme_logo_by_driftingcar_dg73lkh-pre.png', border: 'border-pink-500/50', bg: 'bg-pink-950/40' },
  ];

  const defaultReviews = [
    {
      id: 'rev-default-1',
      userName: 'Trần Huy Hoàng (Collector)',
      rating: 5,
      date: '28/07/2026',
      comment: 'Hàng chính hãng Bandai Japan xịn xò 100%! Đóng gói xốp nổ cẩn thận, hộp đai không bị móp méo. Đèn LED siêu sáng và âm thanh giả lập biến hình chuẩn phim.',
      images: [
        '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg',
        '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker2.jpg'
      ],
      verifiedPurchase: true,
      avatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png'
    },
    {
      id: 'rev-default-2',
      userName: 'Minh Hoàng Tokusatsu',
      rating: 5,
      date: '25/07/2026',
      comment: 'Giao hàng hỏa tốc trong 2h tại TP.HCM. Đã test full chức năng cảm ứng với phụ kiện đai. Rất đáng tiền ủng hộ shop lâu dài!',
      images: [
        '/Ảnh Sản Phẩm/dx/Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set 1.jpg'
      ],
      verifiedPurchase: true,
      avatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png'
    },
    {
      id: 'rev-default-3',
      userName: 'Phạm Tuấn Anh (Vĩnh Long)',
      rating: 5,
      date: '20/07/2026',
      comment: 'Chất lượng nhựa ABS cao cấp, các khớp cử động chắc chắn, màu sơn tĩnh điện phản quang rực rỡ.',
      images: [
        '/Ảnh Sản Phẩm/dx/Zezts Item Set 03 1.jpg'
      ],
      verifiedPurchase: true,
      avatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_saber_logo_by_driftingcar_dgh9vay-pre.png'
    }
  ];

  const defaultQAList = [
    {
      id: 'qa-default-1',
      question: 'Sản phẩm này có kèm sẵn pin và bảo hành chính hãng Bandai chưa ạ?',
      askedBy: 'Trần Văn Nam',
      date: '27/07/2026',
      answer: 'Sản phẩm nguyên seal Bandai Japan 100%. NPTTEAMSTORE tặng kèm sẵn pin AAA kiềm cao cấp và thẻ bảo hành 12 tháng!',
      answeredBy: 'NPTTEAMSTORE Technical Team'
    },
    {
      id: 'qa-default-2',
      question: 'Có hỗ trợ ship COD toàn quốc và mở hộp đồng kiểm trước khi thanh toán không shop?',
      askedBy: 'Lê Hoàng Yến',
      date: '22/07/2026',
      answer: 'Dạ có ạ! Khách hàng được quyền mở hộp đồng kiểm tra hàng trước khi thanh toán cho tất cả đơn hàng COD toàn quốc.',
      answeredBy: 'NPTTEAMSTORE Customer Care'
    }
  ];

  const safeImages = (product.images && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [(product as any).image || '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'];

  const safeFullDesc = (product.fullDescription && Array.isArray(product.fullDescription) && product.fullDescription.length > 0)
    ? product.fullDescription
    : [product.description || 'Sản phẩm Tokusatsu Kamen Rider chính hãng Bandai Japan cao cấp. Mới 100% nguyên seal đai & phụ kiện.'];

  const displayReviews = product.reviews && product.reviews.length > 0 ? product.reviews : defaultReviews;
  const displayQAList = product.qaList && product.qaList.length > 0 ? product.qaList : defaultQAList;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !reviewerName.trim()) {
      showToast('⚠️ Vui lòng nhập tên và nội dung đánh giá!', 'error');
      return;
    }
    const newRev = {
      id: 'rev-' + Date.now(),
      userName: reviewerName,
      rating: newRating,
      date: new Date().toLocaleDateString('vi-VN'),
      comment: newComment,
      images: reviewImages.length > 0 ? [...reviewImages] : undefined,
      verifiedPurchase: true
    };
    if (!product.reviews) product.reviews = [];
    product.reviews.unshift(newRev);

    // Persist to dynamic live server
    api.addReview(product.id, {
      userName: reviewerName,
      rating: newRating,
      comment: newComment,
      images: reviewImages.length > 0 ? [...reviewImages] : []
    }).catch(err => console.warn('Review save to server fallback:', err));

    setNewComment('');
    setReviewerName('');
    setReviewImages([]);
    setCustomImgInput('');
    showToast('🎉 Đã gửi đánh giá thành công! Nhận +50 Rider Points!', 'success');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const { compressImageFile } = await import('../utils/imageCompressor');
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImageFile(file, 900, 900, 0.75);
        setReviewImages(prev => [...prev, compressed]);
      }
      showToast('📷 Đã tải lên và tối ưu ảnh đánh giá thành công!', 'success');
    } catch {
      showToast('Không thể tải ảnh. Vui lòng thử lại', 'error');
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = customImgInput.trim();
    if (!trimmed) return;
    setReviewImages(prev => [...prev, trimmed]);
    setCustomImgInput('');
    showToast('🖼️ Đã chèn liên kết ảnh đánh giá!', 'success');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const newQA = {
      id: 'qa-' + Date.now(),
      question: newQuestion,
      askedBy: 'Khách hàng',
      date: new Date().toLocaleDateString('vi-VN'),
      answer: 'Cảm ơn câu hỏi của bạn. Kỹ thuật viên NPTTEAMSTORE sẽ phản hồi trong 15 phút!',
      answeredBy: 'NPTTEAMSTORE Technical Team'
    };
    if (!product.qaList) product.qaList = [];
    product.qaList.unshift(newQA);
    setNewQuestion('');
    showToast('💬 Đã gửi câu hỏi! Ban tư vấn sẽ giải đáp ngay.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="bg-[#0A0F1D]/98 border border-[#00F2FE]/45 rounded-3xl w-full max-w-5xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(0,242,254,0.35)] relative my-auto max-h-[90vh] flex flex-col backdrop-blur-2xl text-[#E0F7FA]"
      >
        {/* Close Button with Rounded Circular Glow */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#121214] border border-[#00F2FE]/40 hover:border-[#00F2FE] text-[#00F2FE] hover:text-white flex items-center justify-center transition shadow-[0_0_10px_rgba(0,242,254,0.3)] cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-grow">
          {/* Top Product Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Gallery Left */}
            <div className="lg:col-span-6 space-y-3">
              {/* Image Toolbar: Cleanly separated above the image so nothing covers the toy photo */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#00F2FE] flex items-center gap-1.5 bg-[#00F2FE]/10 border border-[#00F2FE]/30 px-3 py-1 rounded-full">
                  <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                  <span>Bấm vào ảnh để phóng to toàn màn hình</span>
                </span>
                <button 
                  type="button"
                  onClick={() => setIs360Mode(!is360Mode)}
                  className={`px-3 py-1 text-xs font-bold border rounded-full flex items-center gap-1.5 shadow-md transition cursor-pointer ${
                    is360Mode 
                      ? 'bg-[#00F2FE] text-slate-950 border-[#00F2FE] shadow-[0_0_12px_#00F2FE]' 
                      : 'bg-[#121214] text-[#00F2FE] border-[#00F2FE]/50 hover:border-[#00F2FE]'
                  }`}
                >
                  <i className="fa-solid fa-arrows-spin"></i>
                  <span>{is360Mode ? '360° Đang Bật' : 'Xoay 360°'}</span>
                </button>
              </div>

              {/* Main Image Canvas: Phóng to tối đa, 100% trọn vẹn, không bị che khuất */}
              <div 
                onClick={() => setLightboxImg(safeImages[selectedImgIndex] || safeImages[0])}
                className="relative h-[360px] sm:h-[460px] lg:h-[500px] w-full bg-[#070b16] border-2 border-[#00F2FE]/45 rounded-2xl overflow-hidden flex items-center justify-center group shadow-[0_0_30px_rgba(0,242,254,0.3)] p-1.5 sm:p-3 cursor-zoom-in"
                title="Bấm để phóng to xem trọn vẹn 100% không bị che"
              >
                {/* Subtle radial ambient background glow */}
                <div className="absolute inset-0 bg-radial from-[#00F2FE]/15 via-transparent to-transparent pointer-events-none" />

                <img 
                  src={safeImages[selectedImgIndex] || safeImages[0]} 
                  alt={product.name}
                  className={`w-full h-full object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] transition-all duration-300 ${is360Mode ? 'animate-pulse scale-105' : 'group-hover:scale-102'}`}
                  onError={(e) => {
                    e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg';
                  }}
                />
              </div>

              {/* Thumbnails - Rõ nét hơn */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                {safeImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedImgIndex(idx); setIs360Mode(false); }}
                    className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-[#0d1424] transition cursor-pointer p-1 ${
                      selectedImgIndex === idx 
                        ? 'border-[#00F2FE] shadow-[0_0_12px_#00F2FE] scale-105' 
                        : 'border-[#00F2FE]/25 opacity-70 hover:opacity-100 hover:border-[#00F2FE]/60'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'; }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Info Right */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="bg-[#121214] border border-[#00F2FE]/50 text-[#00F2FE] text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider shadow-[0_0_8px_rgba(0,242,254,0.3)] rounded-sm"
                  >
                    {product.series}
                  </span>
                  <span 
                    className="bg-[#121214] text-[#E0F7FA] text-[10px] font-semibold px-2.5 py-0.5 border border-[#00F2FE]/25 rounded-sm"
                  >
                    {product.condition}
                  </span>
                </div>
                <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#E0F7FA] leading-tight">
                  {product.name}
                </h2>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">Mã SP: {product.code}</p>

                {/* Social Proof Stats Bar */}
                <div 
                  className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2.5 bg-[#121214] border border-[#00F2FE]/30 p-2.5 shadow-sm rounded-lg"
                >
                  <div className="flex items-center gap-1 text-[#FFD700] font-extrabold">
                    <i className="fa-solid fa-star text-xs"></i>
                    <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                    <span className="text-slate-400 font-normal">({product.reviews?.length || product.reviewCount || 0} Đánh giá)</span>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div className="flex items-center gap-1 font-bold text-[#05FFD2]">
                    <i className="fa-solid fa-bolt text-[#00F2FE]"></i>
                    <span>Đã bán <strong className="text-white font-mono">{product.soldCount}</strong> sản phẩm</span>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div className="flex items-center gap-1 text-[#00F2FE] font-medium">
                    <i className="fa-solid fa-comments"></i>
                    <span>{product.qaList?.length || 0} Hỏi đáp</span>
                  </div>
                </div>
              </div>

              {/* Price & Guarantee Box with Dynamic Variation Calculation */}
              {(() => {
                const currentPrice = product.price + selectedVariation.extraPrice + (includeDealSoc ? DEAL_SOC_PRICE : 0);
                return (
                  <div 
                    className="bg-[#121214] border border-[#00F2FE]/45 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,242,254,0.25)] rounded-2xl"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-[#00F2FE] font-mono drop-shadow-[0_0_12px_rgba(0,242,254,0.6)]">
                          {currentPrice.toLocaleString('vi-VN')}đ
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-400 line-through font-mono">
                            {(product.originalPrice + selectedVariation.extraPrice).toLocaleString('vi-VN')}đ
                          </span>
                        )}
                        <span className="bg-[#EE4D2D] text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                          -15%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Đã bao gồm VAT & bảo hiểm đóng gói Tokusatsu
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#EE4D2D] text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">

                      </span>
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <i className="fa-solid fa-truck-fast"></i> Freeship Xtra
                      </span>
                    </div>
                  </div>
                );
              })()}


              <div className="grid grid-cols-3 gap-2 bg-[#0A0F1D] border border-[#00F2FE]/25 p-2.5 text-[10px] text-slate-300">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <i className="fa-solid fa-circle-check text-[#00F2FE]"></i>
                  <span>100% Chính Hãng Bandai</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <i className="fa-solid fa-rotate-left text-sky-400"></i>
                  <span>15 Ngày Đổi Trả Miễn Phí</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <i className="fa-solid fa-box-open text-amber-400"></i>
                  <span>Đồng Kiểm Khi Nhận Hàng</span>
                </div>
              </div>

              {/* Phân Loại Hàng (Variations Selector) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E0F7FA] uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-sliders text-[#00F2FE]"></i>
                    <span>Phân Loại Hàng (Chọn Phiên Bản):</span>
                  </span>
                  <span className="text-[10px] text-[#05FFD2] font-semibold">
                    {selectedVariation.name}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {VARIATIONS.map((v) => {
                    const isSelected = selectedVariation.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariation(v)}
                        className={`p-2.5 text-left border transition relative cursor-pointer rounded-lg ${
                          isSelected
                            ? 'bg-[#00F2FE]/15 border-[#00F2FE] text-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.35)]'
                            : 'bg-[#121214] border-[#00F2FE]/30 text-slate-300 hover:border-[#00F2FE]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold line-clamp-1">{v.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-[#00F2FE] text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {v.tag}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono mt-1 text-slate-400">
                          {v.extraPrice === 0 ? 'Giá gốc' : `+${v.extraPrice.toLocaleString('vi-VN')}đ`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mua Kèm Deal Sốc */}
              <div 
                className="bg-[#121214] border border-[#FFD700]/50 p-3 space-y-2 shadow-[0_0_12px_rgba(255,215,0,0.15)] rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-tags"></i>
                    <span>Mua Kèm Deal Sốc (Tiết kiệm 59%)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Chỉ dành cho đơn hàng hôm nay</span>
                </div>

                <label className="flex items-center gap-3 p-2 bg-[#0A0F1D] border border-[#FFD700]/30 hover:border-[#FFD700] transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDealSoc}
                    onChange={(e) => setIncludeDealSoc(e.target.checked)}
                    className="accent-[#FFD700] w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-grow flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-200 block text-[11px]">Standee Acrylic Mica Kamen Rider Limited (Khắc Tên)</strong>
                      <span className="text-[10px] text-slate-400">Tặng kèm đế phát quang ban đêm</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#FFD700] font-mono font-bold">+{DEAL_SOC_PRICE.toLocaleString('vi-VN')}đ</span>
                      <span className="text-[10px] text-slate-500 line-through block font-mono">120.000đ</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Specs Quick Pill List */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="bg-[#121214] p-2.5 border border-[#00F2FE]/30">
                  <span className="text-[10px] text-slate-400 block font-medium">Hãng Sản Xuất</span>
                  <strong className="text-white font-bold">{product.specifications?.manufacturer || 'Bandai Japan'}</strong>
                </div>
                <div className="bg-[#121214] p-2.5 border border-[#00F2FE]/30">
                  <span className="text-[10px] text-slate-400 block font-medium">Loại Pin Khuyên Dùng</span>
                  <strong className="text-white font-bold">{product.specifications?.batteryType || 'Pin AAA (Kèm theo nếu chọn gói)'}</strong>
                </div>
              </div>

              {/* Quantity Selector & Purchase CTAs */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-300">Số lượng:</span>
                  <div className="flex items-center border border-[#00F2FE]/35 bg-[#121214]">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 hover:bg-[#00F2FE]/20 text-slate-200 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold font-mono text-white">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 hover:bg-[#00F2FE]/20 text-slate-200 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Kho: còn {product.stock} sản phẩm sẵn hàng</span>
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => onToggleFavorite(product, e)}
                        className={`py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isFavorite 
                            ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30' 
                            : 'bg-[#091124] hover:bg-[#0c1833] text-slate-300 hover:text-rose-400 border-cyan-500/30'
                        }`}
                        title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                      >
                        <i className={`fa-solid fa-heart ${isFavorite ? 'animate-pulse' : ''}`}></i>
                        <span className="truncate">{isFavorite ? 'Đã Thích' : 'Yêu Thích'}</span>
                      </button>
                    )}

                    {onAddToCompare && (
                      <button
                        onClick={(e) => onAddToCompare(product, e)}
                        className="py-3 rounded-xl border border-cyan-500/40 bg-[#091124] hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        title="Thêm vào bảng so sánh"
                      >
                        <i className="fa-solid fa-code-compare"></i>
                        <span className="truncate">So Sánh</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(window.location.href);
                          showToast('🔗 Đã sao chép liên kết sản phẩm!', 'success');
                        } catch {
                          showToast('🔗 ' + product.name, 'info');
                        }
                      }}
                      className="py-3 rounded-xl border border-cyan-500/40 bg-[#091124] hover:bg-cyan-500/20 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      title="Chia sẻ sản phẩm"
                    >
                      <i className="fa-solid fa-share-nodes text-cyan-400"></i>
                      <span className="truncate">Chia Sẻ</span>
                    </button>

                    <button 
                      onClick={() => {
                        const calculatedPrice = product.price + selectedVariation.extraPrice + (includeDealSoc ? DEAL_SOC_PRICE : 0);
                        const modifiedProduct = {
                          ...product,
                          price: calculatedPrice,
                          name: `${product.name} [${selectedVariation.name}]${includeDealSoc ? ' (+Deal Sốc Standee)' : ''}`
                        };
                        onAddToCart(modifiedProduct, quantity);
                        showToast(`🛒 Đã thêm vào giỏ: ${modifiedProduct.name}`, 'success');
                      }}
                      className="btn-cart-hover-glow py-3 bg-[#00F2FE]/15 hover:bg-[#00F2FE]/25 border border-[#00F2FE] text-[#00F2FE] hover:text-white font-bold text-xs shadow-[0_0_12px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.8)] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 rounded-full"
                    >
                      <i className="fa-solid fa-cart-plus"></i> <span className="truncate">Thêm Giỏ</span>
                    </button>

                    <button 
                      onClick={() => {
                        const calculatedPrice = product.price + selectedVariation.extraPrice + (includeDealSoc ? DEAL_SOC_PRICE : 0);
                        const modifiedProduct = {
                          ...product,
                          price: calculatedPrice,
                          name: `${product.name} [${selectedVariation.name}]${includeDealSoc ? ' (+Deal Sốc Standee)' : ''}`
                        };
                        onBuyNow(modifiedProduct, quantity);
                      }}
                      className="btn-cart-hover-glow py-3 bg-gradient-to-r from-[#EE4D2D] via-[#FF6B4A] to-[#EE4D2D] hover:brightness-110 text-white font-black text-xs shadow-[0_0_20px_rgba(238,77,45,0.5)] hover:shadow-[0_0_30px_rgba(238,77,45,0.85)] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 rounded-full"
                    >
                      <i className="fa-solid fa-bolt"></i> <span className="truncate">Mua Ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Tabs: Specs, Unboxing Video, Reviews, Q&A */}
          <div className="border-t border-cyan-500/25 pt-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-cyan-500/20 overflow-x-auto no-scrollbar pb-3 text-xs font-bold">
              <button 
                onClick={() => setActiveTab('desc')}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeTab === 'desc' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Mô Tả Chi Tiết
              </button>
              <button 
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeTab === 'specs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Thông Số Kỹ Thuật
              </button>
              {product.videoUrl && (
                <button 
                  onClick={() => setActiveTab('video')}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeTab === 'video' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <i className="fa-brands fa-youtube text-red-500 mr-1"></i> Video Review Unboxing
                </button>
              )}
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeTab === 'reviews' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Đánh Giá ({displayReviews.length})
              </button>
              <button 
                onClick={() => setActiveTab('qa')}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeTab === 'qa' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Hỏi Đáp Q&A ({displayQAList.length})
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'desc' && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#070d1e] p-5 rounded-2xl border border-cyan-500/20">
                {safeFullDesc.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-[#070d1e] border border-cyan-500/25 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-cyan-500/20 text-slate-200">
                    <tr><td className="p-3 bg-[#050914] font-bold text-cyan-300 w-1/3">Nhà sản xuất</td><td className="p-3">{product.specifications?.manufacturer || 'Bandai Japan'}</td></tr>
                    <tr><td className="p-3 bg-[#050914] font-bold text-cyan-300">Chất liệu</td><td className="p-3">{product.specifications?.material || 'Nhựa ABS / PVC / Diecast'}</td></tr>
                    <tr><td className="p-3 bg-[#050914] font-bold text-cyan-300">Năm phát hành</td><td className="p-3">{product.specifications?.releaseYear || '2026'}</td></tr>
                    <tr><td className="p-3 bg-[#050914] font-bold text-cyan-300">Loại Pin</td><td className="p-3">{product.specifications?.batteryType || 'Không dùng pin'}</td></tr>
                    <tr><td className="p-3 bg-[#050914] font-bold text-cyan-300">Hiệu ứng</td><td className="p-3">{product.specifications?.effects || 'In UV sắc nét / Đèn LED & Âm Thanh (nếu có)'}</td></tr>
                    <tr><td className="p-3 bg-[#050914] font-bold text-cyan-300">Kích thước đóng hộp</td><td className="p-3">{product.specifications?.dimensions || 'Khổ tiêu chuẩn Bandai Japan'}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'video' && product.videoUrl && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#2A2A2A] bg-black">
                <iframe 
                  src={product.videoUrl} 
                  title={product.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Submit review form with Image Attachment */}
                <form onSubmit={handleAddReview} className="bg-[#121214] border border-[#00F2FE]/35 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fa-solid fa-pen-to-square"></i>
                      <span>Viết Đánh Giá Kèm Ảnh Chụp (Nhận +50 Rider Points)</span>
                    </h4>
                    <span className="text-[10px] text-[#FFD700] font-bold">100% Đánh giá thực</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Họ và tên hoặc Biệt danh Rider của bạn..." 
                      className="bg-[#0A0F1D] border border-[#00F2FE]/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F2FE]"
                      required
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#0A0F1D] border border-[#00F2FE]/20 px-3 py-2 rounded-xl">
                      <span className="font-bold">Đánh giá sao:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className={`text-base transition cursor-pointer hover:scale-125 ${star <= newRating ? 'text-[#FFD700]' : 'text-slate-600'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <span className="text-[#05FFD2] font-mono font-bold ml-1">{newRating}/5</span>
                    </div>
                  </div>

                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm unboxing, chất lượng nhựa Bandai, âm thanh, độ sắc nét của sản phẩm..."
                    className="w-full bg-[#0A0F1D] border border-[#00F2FE]/30 rounded-xl p-3 text-xs text-white h-20 resize-none focus:outline-none focus:border-[#00F2FE]"
                    required
                  ></textarea>

                  {/* Image Upload & Attachment Section */}
                  <div className="space-y-2 pt-1 border-t border-[#00F2FE]/15">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-[11px] font-bold text-[#E0F7FA] flex items-center gap-1.5 cursor-pointer bg-[#0A0F1D] border border-[#00F2FE]/40 hover:border-[#00F2FE] hover:bg-[#00F2FE]/10 px-3 py-1.5 rounded-xl transition text-xs">
                        <i className="fa-solid fa-camera text-[#00F2FE]"></i>
                        <span>Tải Ảnh Chụp Thực Tế (Từ máy)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleImageUpload} 
                          className="hidden" 
                        />
                      </label>

                      {/* Quick sample photo chip shortcuts */}
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-slate-400 hidden sm:inline">Hoặc thêm ảnh mẫu:</span>
                        <button
                          type="button"
                          onClick={() => setReviewImages(prev => [...prev, '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'])}
                          className="px-2 py-1 bg-[#0A0F1D] border border-[#00F2FE]/30 hover:border-[#00F2FE] text-[#00F2FE] rounded-lg transition cursor-pointer"
                        >
                          + Ảnh Hộp New
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewImages(prev => [...prev, '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker3.jpg'])}
                          className="px-2 py-1 bg-[#0A0F1D] border border-[#00F2FE]/30 hover:border-[#00F2FE] text-[#00F2FE] rounded-lg transition cursor-pointer"
                        >
                          + Ảnh Chi Tiết Đai
                        </button>
                      </div>
                    </div>

                    {/* URL Image Input Option */}
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={customImgInput}
                        onChange={(e) => setCustomImgInput(e.target.value)}
                        placeholder="Hoặc dán đường link ảnh online (https://...)..."
                        className="flex-grow bg-[#0A0F1D] border border-[#00F2FE]/25 rounded-lg px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#00F2FE]"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-1.5 bg-[#00F2FE]/20 hover:bg-[#00F2FE]/30 border border-[#00F2FE]/50 text-[#00F2FE] text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Chèn
                      </button>
                    </div>

                    {/* Attached Photos Preview Grid */}
                    {reviewImages.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-[#05FFD2] font-semibold block">
                          Ảnh đã đính kèm ({reviewImages.length} ảnh):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {reviewImages.map((img, idx) => (
                            <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-[#00F2FE]/50 bg-[#0A0F1D]">
                              <img src={img} alt="review attachment" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer shadow"
                                title="Xóa ảnh này"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-400">
                      * Đánh giá kèm hình ảnh chụp thật sẽ được duyệt và cấp tích xanh nhanh nhất!
                    </span>
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] text-slate-950 font-black text-xs rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(0,242,254,0.4)] active:scale-95 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-paper-plane mr-1.5"></i>
                      <span>Gửi Đánh Giá</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-3.5">
                  {displayReviews.length > 0 ? (
                    displayReviews.map((rev, idx) => {
                      const avatarInfo = CUSTOMER_REVIEW_AVATARS[idx % CUSTOMER_REVIEW_AVATARS.length];
                      return (
                        <div key={rev.id} className="bg-[#121214] border border-[#00F2FE]/25 p-4 rounded-2xl space-y-2.5 text-xs shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-full overflow-hidden border ${avatarInfo.border} ${avatarInfo.bg} p-1 flex items-center justify-center shrink-0`}>
                                <img 
                                  src={rev.avatar || avatarInfo.img} 
                                  alt={rev.userName} 
                                  className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(0,255,255,0.7)]" 
                                  onError={(e) => {
                                    e.currentTarget.src = '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png';
                                  }}
                                />
                              </div>
                              <div>
                                <span className="font-bold text-[#E0F7FA] block leading-tight text-xs">{rev.userName}</span>
                                {rev.verifiedPurchase && (
                                  <span className="text-[9px] text-[#05FFD2] font-semibold flex items-center gap-1">
                                    <i className="fa-solid fa-circle-check text-[#00F2FE]"></i> Đã mua hàng tại NPTTEAMSTORE
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-slate-400 font-mono text-[10px]">{rev.date}</span>
                          </div>

                          <div className="text-[#FFD700] text-sm tracking-wider">
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>

                          <p className="text-slate-200 leading-relaxed bg-[#0A0F1D] p-3 rounded-xl border border-slate-800 text-xs">
                            {rev.comment}
                          </p>

                          {/* Customer Unboxing Photos Display */}
                          {rev.images && rev.images.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] text-[#00F2FE] font-bold flex items-center gap-1">
                                <i className="fa-solid fa-camera"></i>
                                <span>Ảnh chụp thực tế từ người mua ({rev.images.length}):</span>
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {rev.images.map((imgUrl, imgIdx) => (
                                  <div 
                                    key={imgIdx}
                                    onClick={() => setLightboxImg(imgUrl)}
                                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#00F2FE]/40 hover:border-[#00F2FE] p-0.5 bg-[#0A0F1D] cursor-pointer hover:scale-105 transition shadow-md group relative"
                                    title="Nhấn để phóng to ảnh"
                                  >
                                    <img 
                                      src={imgUrl} 
                                      alt="Ảnh unboxing khách hàng" 
                                      className="w-full h-full object-cover rounded-lg"
                                      onError={(e) => {
                                        e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[#00F2FE] text-xs">
                                      <i className="fa-solid fa-magnifying-glass-plus"></i>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">Chưa có đánh giá nào cho sản phẩm này.</p>
                  )}
                </div>
              </div>
            )}

            {/* Lightbox Modal for Zooming Attached Review Photos */}
            {lightboxImg && (
              <div 
                className="fixed inset-0 z-60 bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
                onClick={() => setLightboxImg(null)}
              >
                <div className="relative max-w-5xl max-h-[92vh] w-full bg-[#0a0f1d] p-3 sm:p-4 rounded-3xl border border-[#00F2FE]/50 shadow-[0_0_50px_rgba(0,242,254,0.4)]" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => setLightboxImg(null)}
                    className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-sm font-bold shadow-lg cursor-pointer"
                  >
                    ✕
                  </button>
                  <div className="w-full h-[75vh] flex items-center justify-center bg-[#050814] rounded-2xl p-2 sm:p-4">
                    <img 
                      src={lightboxImg} 
                      alt="Phóng to ảnh unboxing" 
                      className="w-full h-full max-h-[72vh] object-contain rounded-xl drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]"
                    />
                  </div>
                  <div className="text-center text-xs text-[#00F2FE] pt-2.5 font-bold flex items-center justify-center gap-2">
                    <i className="fa-solid fa-certificate"></i>
                    <span>Ảnh Chi Tiết Mô Hình Tokusatsu Chính Hãng Bandai Japan — NPTTEAMSTORE</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-6">
                <form onSubmit={handleAddQuestion} className="flex gap-2">
                  <input 
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Đặt câu hỏi về đai, loại pin, phụ kiện..."
                    className="flex-grow bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                  <button type="submit" className="px-5 py-2.5 bg-[#C9A84C] text-[#0A0A0A] font-bold text-xs rounded-xl whitespace-nowrap">
                    Gửi Câu Hỏi
                  </button>
                </form>

                <div className="space-y-3">
                  {displayQAList.length > 0 ? (
                    displayQAList.map(qa => (
                      <div key={qa.id} className="bg-[#0D0D0D] border border-[#2A2A2A] p-4 rounded-2xl space-y-2 text-xs">
                        <p className="font-bold text-[#F5F2EB]"><i className="fa-solid fa-circle-question text-[#C9A84C] mr-1.5"></i>{qa.question}</p>
                        {qa.answer && (
                          <div className="bg-[#1A1A1A] p-3 rounded-xl border border-[#2A2A2A] text-gray-300 space-y-1">
                            <span className="text-[10px] text-[#C9A84C] font-bold uppercase block">{qa.answeredBy}</span>
                            <p>{qa.answer}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 py-4 text-center">Chưa có câu hỏi nào.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
