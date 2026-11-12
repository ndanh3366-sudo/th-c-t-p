export type CategoryType = 
  | 'dx-belt' 
  | 'csm' 
  | 'shf' 
  | 'shf-premium'
  | 'shf-pbandai'
  | 'super-sentai'
  | 'sentai'
  | 'weapon' 
  | 'item'
  | 'item-card' 
  | 'item-cards'
  | 'cosplay' 
  | 'combo'
  | 'poster';

export type EraType = 'Reiwa' | 'Heisei' | 'Showa';

export type SeriesType = 
  | 'Kamen Rider Gavv'
  | 'Kamen Rider Gotchard'
  | 'Kamen Rider Geats'
  | 'Kamen Rider Revice'
  | 'Kamen Rider Saber'
  | 'Kamen Rider Zero-One'
  | 'Kamen Rider Zi-O'
  | 'Kamen Rider Build'
  | 'Kamen Rider Ex-Aid'
  | 'Kamen Rider Gaim'
  | 'Kamen Rider Decade'
  | 'Kamen Rider W'
  | 'Kamen Rider OOO'
  | 'Kamen Rider Kiva'
  | 'Kamen Rider Faiz'
  | 'Kamen Rider Ryuki'
  | 'Kamen Rider Kabuto'
  | 'Kamen Rider Black / RX'
  | 'Kamen Rider Ichigo'
  | 'Kamen Rider Zeztz'
  | 'Kamen Rider Stronger'
  | 'Kamen Rider Series'
  | 'Kamen Rider Drive'
  | 'Kamen Rider Ghost'
  | 'Super Sentai'
  | 'Super Sentai Series'
  | 'Gaoranger'
  | 'Donbrothers'
  | 'Kyoryuger'
  | 'King-Ohger'
  | 'Zenkaiger'
  | 'Motor Nuclear';

export interface ProductSpecification {
  manufacturer: string; // Bandai Japan
  material: string; // ABS, PVC, Diecast, Zinc Alloy
  releaseYear: string;
  batteryType?: string;
  effects?: string; // Dual Speaker LED & Sound
  dimensions?: string;
  size?: string;
  ageRating?: string;
  height?: string;
  scale?: string;
  articulation?: string;
  packCount?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
}

export interface QAItem {
  id: string;
  question: string;
  askedBy: string;
  answer?: string;
  answeredBy?: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  code: string; // e.g. "BANDAI-DX-DESIRE"
  category: CategoryType;
  era: EraType;
  series: SeriesType;
  price: number;
  originalPrice?: number;
  isFlashSale?: boolean;
  flashSaleEndTime?: string;
  flashSaleStock?: number;
  soldCount: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[]; // First image is main hero image
  videoUrl?: string;
  isHot?: boolean;
  isNew?: boolean;
  isCSM?: boolean;
  condition: string;
  description: string;
  fullDescription?: string[];
  specifications?: ProductSpecification;
  qaList?: QAItem[];
  reviews?: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type MemberTier = 'Novice Rider' | 'Rider Collector' | 'CSM Master' | 'Legend Rider';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: 'user' | 'admin';
  riderPoints: number;
  tierRank: MemberTier;
  referralCode: string;
  wishlist: string[]; // product IDs
  addresses?: string[];
}

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  ip: string;
  userAgent?: string;
  registeredAt: string;
  lastActiveAt?: string;
  isBlocked: boolean;
  blockReason?: string;
  isCloneSuspect?: boolean;
  orderCount?: number;
}

export interface BankTransferInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  transferContent: string;
  amount: number;
  senderBank?: string;
  senderAccountNumber?: string;
  senderAccountName?: string;
  transferReference?: string;
  transferredAt?: string;
  proofImage?: string;
}

export interface Order {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerAvatar?: string;
  customerEmail: string;
  customerPhone: string;
  customerIp?: string;
  shippingAddress: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    serialKey: string;
  }[];
  subtotal: number;
  discountAmount: number;
  pointsDiscount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'VNPAY' | 'MOMO' | 'COD' | 'BANK';
  bankTransferDetails?: BankTransferInfo;
  couponCode?: string;
  pointsEarned: number;
  status: 'Chờ xác nhận' | 'Đang xử lý' | 'Đang giao hàng' | 'Đã giao thành công' | 'Đã hủy';
}

export interface BlogPost {
  id: string;
  title: string;
  category: 'Tin phim' | 'Review đồ chơi' | 'Hướng dẫn bảo quản' | 'Sự kiện' | 'Tin Tức Hot' | 'Sự Kiện Bandai' | 'Tin Điện Ảnh' | 'Review Đồ Chơi' | 'Thông Tin CSM' | string;
  date: string;
  author: string;
  image: string;
  summary: string;
  contentHtml: string;
  readTime: string;
  views: number;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percent' | 'fixed';
  value: number; // e.g. 10 (%) or 100000 (VND)
  minOrder: number;
  expiry: string;
  colorTag: string;
}

export interface AuctionBid {
  bidderName: string;
  bidderAvatar?: string;
  amount: number;
  time: string;
}

export interface AuctionItem {
  id: string;
  productName: string;
  code: string;
  image: string;
  era: EraType;
  startingBid: number;
  currentBid: number;
  highestBidder: string;
  bidCount: number;
  endTime: string;
  condition: string;
  description: string;
  bidHistory: AuctionBid[];
}

export interface WarrantyTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderCode: string;
  productSerial: string;
  productName: string;
  issueType: 'Lỗi Âm Thanh/Loa' | 'Lỗi Đèn LED' | 'Lỗi Nhận Thẻ/Buckle' | 'Hỏng Nút Bấm' | 'Khác';
  description: string;
  status: 'Đang tiếp nhận' | 'Đang kiểm tra' | 'Đã đổi mới 1-1' | 'Đã xử lý' | 'Từ chối';
  createdAt: string;
}

export interface ForumComment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  authorBadge?: string;
  era: EraType;
  category: 'Khoe Bộ Sưu Tập' | 'Đập Hộp / Review' | 'Góc Trưng Bày' | 'Henshin Demo' | 'Thảo luận Series' | 'Cosplay';
  content: string;
  image?: string;
  images?: string[];
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  likes: number;
  isLiked?: boolean;
  reactions?: {
    henshin: number;
    fire: number;
    diamond: number;
  };
  userReactions?: string[];
  commentsCount: number;
  commentsList?: ForumComment[];
  createdAt: string;
  handle?: string;
  isVerified?: boolean;
  isGoldVerified?: boolean;
  reposts?: number;
  isReposted?: boolean;
  bookmarks?: number;
  isBookmarked?: boolean;
  views?: number;
  tags?: string[];
}

export type FeedbackCategory = 'Chất lượng sản phẩm' | 'Đóng gói & Vận chuyển' | 'Trải nghiệm & Dịch vụ' | 'Bảo hành & Hậu mãi' | 'Tổng quan cửa hàng';

export interface CustomerFeedback {
  id: string;
  customerName: string;
  customerLocation?: string;
  customerAvatar: string;
  rating: number; // 1 to 5
  category: FeedbackCategory;
  productId?: string;
  productName?: string;
  productImage?: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  date: string;
  helpfulCount: number;
  userLiked?: boolean;
  adminReply?: {
    author: string;
    date: string;
    content: string;
  };
}

export interface TributeCustomer {
  id: string;
  name: string;
  location: string;
  avatar: string;
  title: string;
  tierBadge: string;
  totalProductsPurchased: number; // Must be >= 20 to qualify for Hall of Fame
  totalOrders: number;
  memberSince: string;
  favoriteSeries: string;
  featuredCollection: string[];
}

