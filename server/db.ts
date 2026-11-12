import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Product, AuctionItem, Order, ForumPost, WarrantyTicket, Review, CustomerAccount, CustomerFeedback, TributeCustomer } from '../src/types.ts';
import { INITIAL_PRODUCTS } from '../src/data/products.ts';
import { INITIAL_AUCTIONS } from '../src/data/auctions.ts';
import { INITIAL_FEEDBACKS, CERTIFIED_TOP_CUSTOMERS } from '../src/data/feedbacks.ts';

const INITIAL_CUSTOMERS: CustomerAccount[] = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data directory:', err);
  }
}

// High-Performance In-Memory Cache with Asynchronous Non-blocking Persistence
const cacheStore: Record<string, any> = {};

function loadJson<T>(filename: string, fallback: T): T {
  if (cacheStore[filename]) {
    return cacheStore[filename] as T;
  }
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    } catch (e) {
      console.warn(`Error initializing ${filename}:`, e);
    }
    cacheStore[filename] = fallback;
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as T;
    cacheStore[filename] = parsed;
    return parsed;
  } catch (e) {
    console.error(`Error reading ${filename}, using fallback:`, e);
    cacheStore[filename] = fallback;
    return fallback;
  }
}

const saveTimers: Record<string, NodeJS.Timeout> = {};

function saveJson<T>(filename: string, data: T): void {
  // Update memory cache immediately for zero-latency instant reads
  cacheStore[filename] = data;

  // Debounced non-blocking async disk write to avoid blocking Node.js event loop
  if (saveTimers[filename]) {
    clearTimeout(saveTimers[filename]);
  }

  saveTimers[filename] = setTimeout(() => {
    const filePath = path.join(DATA_DIR, filename);
    const tempPath = `${filePath}.tmp`;
    fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8', (err) => {
      if (!err) {
        fs.rename(tempPath, filePath, () => {});
      } else {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8', () => {});
      }
    });
  }, 50);
}

// Initial Seed Orders
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORDER-2026-NPT-9812',
    date: '24/10/2026',
    time: '17:45',
    customerName: 'Trần Minh Quân',
    customerPhone: '0984888812',
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
    date: '24/10/2026',
    time: '15:20',
    customerName: 'Lê Hoàng Nam',
    customerPhone: '0912345678',
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
    items: [
      {
        productId: 'csm-decade-v2',
        productName: 'CSM Complete Selection Modification Decadriver Ver.2 Gold Edition',
        productImage: '/Ảnh Sản Phẩm/dx/Đai biến hình Kamen Rider Ichigo CSM Typhoon 50th Anniversary Bandai Japan 1.jpg',
        price: 8900000,
        quantity: 1,
        serialKey: 'NPT-CSM-DECADE-8421-VIP'
      }
    ]
  }
];

// Initial Forum Posts
const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'fp-1',
    title: 'Khoe trọn bộ SHF Kamen Rider Gavv Poppingummy Form',
    author: 'Trần Hoàng Long',
    handle: '@long_rider',
    authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png',
    authorBadge: 'VIP Collector',
    isVerified: true,
    era: 'Reiwa',
    category: 'Khoe Bộ Sưu Tập',
    content: 'Vừa bóc seal sáng nay từ NPTTEAMSTORE, đóng gói 3 lớp bọt khí an toàn tuyệt đối! 💥 Khớp SHF Gavv kì này mượt đỉnh chóp, mắt kép Compound Eyes bắt sáng màu kẹo gummy trong suốt y như trên phim. Form dáng thon gọn chuẩn tỷ lệ 1/12, kèm theo effect Poppingummy cực sống động. Mời anh em chiêm ngưỡng góc chụp cận cảnh! #KamenRiderGavv #SHFiguarts #NPTTEAMSTORE #Unboxing',
    images: [
      '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Gavv Poppingummy Form1.jpg',
      '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Gavv Poppingummy Form2.jpg',
      '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Gavv Poppingummy Form3.jpg'
    ],
    productName: '[Chính Hãng] Mô Hình S.H.Figuarts Kamen Rider Gavv Poppingummy Form',
    productImage: '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Gavv Poppingummy Form1.jpg',
    productPrice: 1650000,
    likes: 184,
    isLiked: false,
    reposts: 42,
    isReposted: false,
    bookmarks: 28,
    isBookmarked: false,
    views: 18400,
    reactions: { henshin: 92, fire: 67, diamond: 45 },
    userReactions: [],
    commentsCount: 3,
    commentsList: [
      {
        id: 'c1',
        author: 'Minh Tuấn DX',
        authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png',
        content: 'Khớp háng con này pose dạng chân cưỡi xe có bị cạ gãy không bác?',
        createdAt: '2h trước'
      },
      {
        id: 'c2',
        author: 'Trần Hoàng Long',
        authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png',
        content: 'Khớp háng kéo thả kiểu mới trượt mượt mà lắm bác, pose Rider Kick thoải mái luôn!',
        createdAt: '1h trước'
      },
      {
        id: 'c3',
        author: 'NPTTEAMSTORE Official',
        authorAvatar: '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png',
        content: 'Cảm ơn anh Long đã ủng hộ shop! Chúc anh có thêm nhiều bộ ảnh Henshin đẹp mê ly cùng Gavv nhé.',
        createdAt: '30m trước'
      }
    ],
    createdAt: '2h'
  },
  {
    id: 'fp-2',
    title: 'Đập hộp Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set',
    author: 'Bảo Nam Toku',
    handle: '@baonam_dx',
    authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png',
    authorBadge: 'Đai Vàng DX',
    isVerified: true,
    era: 'Heisei',
    category: 'Đập Hộp / Review',
    content: 'Tuổi thơ trở lại khi cầm trên tay bộ Sengoku Driver bản Super Best tái bản sắc nét từng vạch sơn bạc và kiếm cắt khóa 🗡️ Khi gạt dao cắt Lockseed cam Orange, âm thanh "SOIYAAAA! ORANGE ARMS: HANAMICHI ON STAGE!" vang rền nhà. Hàng new seal góc hộp vuông đét không tì vết! #SengokuDriver #KamenRiderGaim #BandaiJapan #DXBelt',
    images: [
      '/Ảnh Sản Phẩm/dx/Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set 1.jpg',
      '/Ảnh Sản Phẩm/dx/Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set 2.jpg'
    ],
    productName: 'Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set',
    productImage: '/Ảnh Sản Phẩm/dx/Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set 1.jpg',
    productPrice: 2890000,
    likes: 245,
    isLiked: true,
    reposts: 78,
    isReposted: true,
    bookmarks: 56,
    isBookmarked: false,
    views: 26300,
    reactions: { henshin: 130, fire: 88, diamond: 62 },
    userReactions: ['henshin'],
    commentsCount: 2,
    commentsList: [
      {
        id: 'c4',
        author: 'Hoàng Long',
        authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png',
        content: 'Bộ này có kèm sẵn Faceplate của Baron Banana không bạn?',
        createdAt: '5h trước'
      },
      {
        id: 'c5',
        author: 'Bảo Nam Toku',
        authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_revice_logo_by_driftingcar_dghk15w-pre.png',
        content: 'Có đầy đủ cả Faceplate Gaim lẫn Baron kèm 2 Lockseed Cam & Chuối chính hãng luôn nha bác!',
        createdAt: '4h trước'
      }
    ],
    createdAt: '5h'
  },
  {
    id: 'fp-3',
    title: 'Henshin Belt Kamen Rider Zeztz DX Lord Invoker New Seal 2026',
    author: 'Khánh Đặng Henshin',
    handle: '@khanh_henshin',
    authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_saber_logo_by_driftingcar_dgh9vay-pre.png',
    authorBadge: 'Thành Viên Bạc',
    isVerified: false,
    era: 'Reiwa',
    category: 'Khoe Bộ Sưu Tập',
    content: 'Đai Henshin thế hệ mới nhất của Kamen Rider Zeztz! ⚡ Cơ chế nạp Capsem độc quyền, đèn LED xoay đa tầng quét vòng 7 màu cực bén. Loa Neodymium tích hợp to rõ không rè chút nào. Shop đóng gói bọc xốp kỹ, giao hỏa tốc 2 giờ tại Sài Gòn! #KamenRiderZeztz #LordInvoker #CapsemHenshin #Tokusatsu2026',
    images: [
      '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg',
      '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker2.jpg'
    ],
    productName: 'Kamen Rider Zeztz DX Henshin Belt Lord Invoker',
    productImage: '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg',
    productPrice: 2100000,
    likes: 167,
    isLiked: false,
    reposts: 31,
    isReposted: false,
    bookmarks: 19,
    isBookmarked: false,
    views: 14200,
    reactions: { henshin: 85, fire: 59, diamond: 38 },
    userReactions: [],
    commentsCount: 1,
    commentsList: [
      {
        id: 'c6',
        author: 'Vũ Đức Minh',
        authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_kiva_logo_by_driftingcar_dg7tj5z-pre.png',
        content: 'Đai dùng pin AAA hay pin cúc áo vậy bác? Có kèm sẵn pin không?',
        createdAt: '1d trước'
      }
    ],
    createdAt: '1d'
  },
  {
    id: 'fp-4',
    title: 'Góc setup tủ kính trưng bày SHF Kamen Rider Xross Saber',
    author: 'Quang Hải Rider',
    handle: '@quanghai_art',
    authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_kiva_logo_by_driftingcar_dg7tj5z-pre.png',
    authorBadge: 'Nghệ Nhân Posing',
    isVerified: true,
    era: 'Reiwa',
    category: 'Góc Trưng Bày',
    content: 'Lớp sơn galaxy ngân hà chuyển màu xanh tím của Xross Saber dưới đèn spotlight tủ kính lung linh không tì vết 🌌 Kiếm Haouken Xross Saber sơn sắc lẹm, biên độ khớp cực rộng giúp pose thế vung kiếm chém sao băng tuyệt đẹp. Hàng Bandai xịn 100%! #XrossSaber #Saber #SHFiguarts #GalaxyPaint #DisplayCorner',
    images: [
      '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Xross Saber1.jpg',
      '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Xross Saber2.jpg'
    ],
    productName: 'Mô Hình S.H.Figuarts Kamen Rider Xross Saber',
    productImage: '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Xross Saber1.jpg',
    productPrice: 1950000,
    likes: 212,
    isLiked: false,
    reposts: 54,
    isReposted: false,
    bookmarks: 41,
    isBookmarked: true,
    views: 19700,
    reactions: { henshin: 110, fire: 74, diamond: 89 },
    userReactions: [],
    commentsCount: 1,
    commentsList: [
      {
        id: 'c7',
        author: 'Trần Hoàng Long',
        authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/dlyjpm8-ea90294c-de09-4bc2-8718-6b49acbf082e.png',
        content: 'Màu sơn này chụp dưới đèn LED trắng nhìn sang hơn hẳn bản thường!',
        createdAt: '2d trước'
      }
    ],
    createdAt: '2d'
  },
  {
    id: 'fp-5',
    title: 'Check-in trải nghiệm thực tế tại Showroom NPTTEAMSTORE Hoàng Gia 2026',
    author: 'NPTTEAMSTORE Official',
    handle: '@nptteamstore',
    authorAvatar: '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png',
    authorBadge: 'Official Store',
    isVerified: true,
    isGoldVerified: true,
    era: 'Reiwa',
    category: 'Góc Trưng Bày',
    content: 'Chào mừng tất cả anh em Tokufan đến check-in Showroom NPTTEAMSTORE 2026! 🏢 Dàn tủ mica trưng bày đủ mọi dòng đai từ Kuuga tới Gavv và hàng loạt figure SHF bản giới hạn P-Bandai. Có quầy test âm thanh trước khi mua, nhân viên tư vấn nhiệt tình thân thiện. Anh em ghé tiệm nhớ quẹt thẻ VIP để nhận ưu đãi nhé! #NPTTEAMSTORE #Showroom #KamenRiderStore #BandaiCollector',
    images: ['/Ảnh Showroom & Cửa Hàng/20240708_161850.jpg'],
    likes: 389,
    isLiked: true,
    reposts: 115,
    isReposted: false,
    bookmarks: 88,
    isBookmarked: false,
    views: 45200,
    reactions: { henshin: 190, fire: 148, diamond: 132 },
    userReactions: [],
    commentsCount: 2,
    commentsList: [
      {
        id: 'c8',
        author: 'Thành Trung',
        authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_kiva_logo_by_driftingcar_dg7tj5z-pre.png',
        content: 'Showroom mở cửa đến mấy giờ tối vậy shop?',
        createdAt: '3d trước'
      },
      {
        id: 'c9',
        author: 'NPTTEAMSTORE Official',
        authorAvatar: '/Logo & Thương Hiệu (Brand Logo)/dreamina-2026-07-29-3008-A minimalist stencil-style logo of an oc....png',
        content: 'Dạ Showroom NPTTEAMSTORE mở cửa từ 8:30 sáng đến 21:30 tối tất cả các ngày trong tuần ạ! Kính mời bạn ghé tham quan.',
        createdAt: '3d trước'
      }
    ],
    createdAt: '3d'
  },
  {
    id: 'fp-6',
    title: 'Sưu tầm hàng hiếm P-Bandai: SHF Kamen Rider Ark-One',
    author: 'Vũ Hoài Nam',
    handle: '@nam_collector',
    authorAvatar: '/BIỂU TƯỢNG DANH MỤC SẢN PHẨM/kamen_rider_femme_logo_by_driftingcar_dg73lkh-pre.png',
    authorBadge: 'Collector VIP',
    isVerified: true,
    era: 'Reiwa',
    category: 'Khoe Bộ Sưu Tập',
    content: 'Săn được em Ark-One P-Bandai new seal 100% tại shop. Từng chi tiết dây cáp quấn thân và khuôn mặt rỉ máu một bên mắt mô phỏng sự hận thù của Aruto cực kỳ biểu cảm. Khớp chắc tay, phụ kiện bàn tay xòe và effect bóng tối làm nổi bật sự hắc hóa nghẹt thở! #ArkOne #ZeroOne #PBandai #SHFiguarts #DarkRider',
    images: [
      '/Ảnh Sản Phẩm/shf premium/[Chính Hãng] SHF Kamen Rider Ark-One 1.jpg',
      '/Ảnh Sản Phẩm/shf premium/[Chính Hãng] SHF Kamen Rider Ark-Zero & Ark Effect Parts Set 1.jpg'
    ],
    productName: '[P-Bandai] SHF Kamen Rider Ark-One',
    productImage: '/Ảnh Sản Phẩm/shf premium/[Chính Hãng] SHF Kamen Rider Ark-One 1.jpg',
    productPrice: 2250000,
    likes: 198,
    isLiked: false,
    reposts: 36,
    isReposted: false,
    bookmarks: 24,
    isBookmarked: false,
    views: 16900,
    reactions: { henshin: 99, fire: 72, diamond: 64 },
    userReactions: [],
    commentsCount: 0,
    commentsList: [],
    createdAt: '4d'
  }
];

// --- Persistent Data Accessors ---

// Products
export const db = {
  getProducts(): Product[] {
    return loadJson<Product[]>('products.json', INITIAL_PRODUCTS);
  },

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  },

  saveProducts(products: Product[]): void {
    saveJson('products.json', products);
  },

  addProduct(product: Product): Product {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }
    this.saveProducts(products);
    return product;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    this.saveProducts(products);
    return products[index];
  },

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length !== products.length) {
      this.saveProducts(filtered);
      return true;
    }
    return false;
  },

  addProductReview(productId: string, review: Review): Product | null {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    if (!product.reviews) product.reviews = [];
    product.reviews.unshift(review);
    product.reviewCount = product.reviews.length;
    
    const totalScore = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Number((totalScore / product.reviews.length).toFixed(1));

    this.saveProducts(products);
    return product;
  },

  // Auctions
  getAuctions(): AuctionItem[] {
    return loadJson<AuctionItem[]>('auctions.json', INITIAL_AUCTIONS);
  },

  saveAuctions(auctions: AuctionItem[]): void {
    saveJson('auctions.json', auctions);
  },

  getAuctionById(id: string): AuctionItem | undefined {
    return this.getAuctions().find(a => a.id === id);
  },

  placeBid(auctionId: string, amount: number, bidderName: string): AuctionItem | null {
    const auctions = this.getAuctions();
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return null;

    if (amount <= auction.currentBid) {
      throw new Error(`Giá đấu phải cao hơn mức hiện tại ${auction.currentBid.toLocaleString('vi-VN')}đ`);
    }

    auction.currentBid = amount;
    auction.highestBidder = bidderName;
    auction.bidCount += 1;
    if (!auction.bidHistory) auction.bidHistory = [];

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - Hôm nay`;

    auction.bidHistory.unshift({
      bidderName,
      amount,
      time: timeStr
    });

    this.saveAuctions(auctions);
    return auction;
  },

  // Orders
  getOrders(): Order[] {
    return loadJson<Order[]>('orders.json', INITIAL_ORDERS);
  },

  saveOrders(orders: Order[]): void {
    saveJson('orders.json', orders);
  },

  getOrderByIdOrQuery(query: string): Order | undefined {
    const q = query.trim().toLowerCase();
    const orders = this.getOrders();
    return orders.find(o => 
      o.id.toLowerCase() === q ||
      (o.customerPhone && o.customerPhone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))) ||
      (o.customerEmail && o.customerEmail.toLowerCase() === q)
    );
  },

  createOrder(order: Order): Order {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);

    // Auto decrement stock for purchased items
    try {
      const products = this.getProducts();
      let productChanged = false;
      order.items.forEach(item => {
        const p = products.find(prod => prod.id === item.productId);
        if (p) {
          p.stock = Math.max(0, p.stock - item.quantity);
          p.soldCount = (p.soldCount || 0) + item.quantity;
          productChanged = true;
        }
      });
      if (productChanged) {
        this.saveProducts(products);
      }
    } catch (e) {
      console.warn('Error updating product stock:', e);
    }

    return order;
  },

  updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    this.saveOrders(orders);
    return order;
  },

  deleteOrder(orderId: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    if (filtered.length !== orders.length) {
      this.saveOrders(filtered);
      return true;
    }
    return false;
  },

  // Forum Posts
  getForumPosts(): ForumPost[] {
    return loadJson<ForumPost[]>('forum_posts.json', INITIAL_FORUM_POSTS);
  },

  saveForumPosts(posts: ForumPost[]): void {
    saveJson('forum_posts.json', posts);
  },

  createForumPost(post: ForumPost): ForumPost {
    const posts = this.getForumPosts();
    posts.unshift(post);
    this.saveForumPosts(posts);
    return post;
  },

  likeForumPost(postId: string): { likes: number } | null {
    const posts = this.getForumPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;
    post.likes = (post.likes || 0) + 1;
    this.saveForumPosts(posts);
    return { likes: post.likes };
  },

  addForumComment(postId: string, comment: any): ForumPost | null {
    const posts = this.getForumPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;
    if (!post.commentsList) post.commentsList = [];
    post.commentsList.push(comment);
    post.commentsCount = post.commentsList.length;
    this.saveForumPosts(posts);
    return post;
  },

  // Customer Feedbacks & Reviews
  getFeedbacks(): CustomerFeedback[] {
    return loadJson<CustomerFeedback[]>('feedbacks.json', INITIAL_FEEDBACKS);
  },

  saveFeedbacks(feedbacks: CustomerFeedback[]): void {
    saveJson('feedbacks.json', feedbacks);
  },

  createFeedback(feedback: CustomerFeedback): CustomerFeedback {
    const feedbacks = this.getFeedbacks();
    feedbacks.unshift(feedback);
    this.saveFeedbacks(feedbacks);
    return feedback;
  },

  likeFeedback(id: string): { helpfulCount: number } | null {
    const feedbacks = this.getFeedbacks();
    const fb = feedbacks.find(f => f.id === id);
    if (!fb) return null;
    fb.helpfulCount = (fb.helpfulCount || 0) + 1;
    this.saveFeedbacks(feedbacks);
    return { helpfulCount: fb.helpfulCount };
  },

  // Bảng vinh danh khách hàng: Chỉ vinh danh khách hàng đã mua từ 20 sản phẩm trở lên
  getTributeCustomers(): TributeCustomer[] {
    const base = CERTIFIED_TOP_CUSTOMERS;
    // Calculate customer purchase counts from real orders
    const orders = this.getOrders();
    const customerCounts: Record<string, { totalItems: number; ordersCount: number }> = {};
    for (const ord of orders) {
      if (!ord.customerName) continue;
      const key = ord.customerName.trim();
      const itemsInOrder = ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;
      if (!customerCounts[key]) {
        customerCounts[key] = { totalItems: 0, ordersCount: 0 };
      }
      customerCounts[key].totalItems += itemsInOrder;
      customerCounts[key].ordersCount += 1;
    }

    // Merge dynamic orders with certified base
    const merged = base.map(c => {
      const extra = customerCounts[c.name] || { totalItems: 0, ordersCount: 0 };
      return {
        ...c,
        totalProductsPurchased: c.totalProductsPurchased + extra.totalItems,
        totalOrders: c.totalOrders + extra.ordersCount
      };
    });

    // Strictly filter out any customer with less than 20 items:
    const qualified = merged.filter(c => c.totalProductsPurchased >= 20);
    // Sort descending by total products purchased
    qualified.sort((a, b) => b.totalProductsPurchased - a.totalProductsPurchased);
    return qualified;
  },

  // Warranties
  getWarranties(): WarrantyTicket[] {
    return loadJson<WarrantyTicket[]>('warranties.json', []);
  },

  createWarranty(ticket: WarrantyTicket): WarrantyTicket {
    const list = this.getWarranties();
    list.unshift(ticket);
    saveJson('warranties.json', list);
    return ticket;
  },

  // Customers Management & IP Tracking
  getCustomers(): CustomerAccount[] {
    return loadJson<CustomerAccount[]>('customers.json', INITIAL_CUSTOMERS);
  },

  saveCustomers(customers: CustomerAccount[]): void {
    saveJson('customers.json', customers);
  },

  addCustomer(customer: CustomerAccount): CustomerAccount {
    const list = this.getCustomers();
    list.unshift(customer);
    this.saveCustomers(list);
    return customer;
  },

  updateCustomer(id: string, updates: Partial<CustomerAccount>): CustomerAccount | null {
    const list = this.getCustomers();
    const cust = list.find(c => c.id === id);
    if (!cust) return null;
    Object.assign(cust, updates);
    this.saveCustomers(list);
    return cust;
  },

  deleteCustomer(id: string): boolean {
    const list = this.getCustomers();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length !== list.length) {
      this.saveCustomers(filtered);
      return true;
    }
    return false;
  },

  // Banned IPs
  getBannedIps(): string[] {
    return loadJson<string[]>('banned_ips.json', []);
  },

  saveBannedIps(ips: string[]): void {
    saveJson('banned_ips.json', ips);
  },

  addBannedIp(ip: string): void {
    const ips = this.getBannedIps();
    if (!ips.includes(ip)) {
      ips.push(ip);
      this.saveBannedIps(ips);
    }
  },

  removeBannedIp(ip: string): void {
    const ips = this.getBannedIps().filter(i => i !== ip);
    this.saveBannedIps(ips);
  },

  // Real-time Store Statistics
  getStats() {
    const products = this.getProducts();
    const orders = this.getOrders();
    const auctions = this.getAuctions();
    const posts = this.getForumPosts();
    const customers = this.getCustomers();
    const bannedIps = this.getBannedIps();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const activeAuctions = auctions.filter(a => new Date(a.endTime).getTime() > Date.now()).length;

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalBannedIps: bannedIps.length,
      totalRevenue,
      totalPosts: posts.length,
      activeAuctions,
      serverTime: new Date().toISOString(),
      status: 'online',
      version: '2026.2.0-dynamic'
    };
  }
};


