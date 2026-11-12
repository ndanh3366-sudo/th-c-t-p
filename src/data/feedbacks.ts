import { CustomerFeedback, TributeCustomer } from '../types';
import { generateCustomerAvatarSvgUrl } from '../utils/avatarGenerator';

export const INITIAL_FEEDBACKS: CustomerFeedback[] = [
  {
    id: 'fb-001',
    customerName: 'Trần Minh Quân',
    customerLocation: 'Hà Nội',
    customerAvatar: generateCustomerAvatarSvgUrl({
      maskId: 'geats-fox',
      colorId: 'crimson-ruby',
      initials: 'MQ',
      customerName: 'Trần Minh Quân'
    }),
    rating: 5,
    category: 'Chất lượng sản phẩm',
    productId: 'csm-typhoon-50th',
    productName: 'Đai biến hình Kamen Rider Ichigo CSM Typhoon 50th Anniversary',
    productImage: '/Ảnh Sản Phẩm/dx/Đai biến hình Kamen Rider Ichigo CSM Typhoon 50th Anniversary Bandai Japan 1.jpg',
    comment: 'Hàng về nguyên seal băng keo Bandai Japan góc cạnh cực kỳ nét, không tì vết. Đai CSM Typhoon 50th Anniversary cầm nặng tay đầm chắc, mô tơ cánh quạt xoay êm ru không một tiếng rè, cảm biến vẫy tay siêu nhạy. Đã sưu tầm đai tại NPT Store gần 2 năm nay, lúc nào cũng an tâm tuyệt đối về chất lượng hàng chuẩn Nhật!',
    images: [
      '/Ảnh Sản Phẩm/dx/Đai biến hình Kamen Rider Ichigo CSM Typhoon 50th Anniversary Bandai Japan 1.jpg',
      '/Ảnh Sản Phẩm/dx/Đai biến hình Kamen Rider Ichigo CSM Typhoon 50th Anniversary Bandai Japan 2.jpg'
    ],
    verifiedPurchase: true,
    date: '10/11/2026',
    helpfulCount: 38,
    adminReply: {
      author: 'Ban Quản Trị NPT Store',
      date: '10/11/2026',
      content: 'Chân thành cảm ơn anh Quân đã luôn đồng hành và ủng hộ NPTTEAMSTORE! Chiếc đai CSM Typhoon huyền thoại chúc anh trưng bày góc sưu tập thật mãn nhãn!'
    }
  },
  {
    id: 'fb-002',
    customerName: 'Nguyễn Quốc Bảo',
    customerLocation: 'Đà Nẵng',
    customerAvatar: generateCustomerAvatarSvgUrl({
      maskId: 'decade-king',
      colorId: 'gold-bandai',
      initials: 'QB',
      customerName: 'Nguyễn Quốc Bảo'
    }),
    rating: 5,
    category: 'Đóng gói & Vận chuyển',
    productId: 'super-best-sengoku',
    productName: 'Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set',
    productImage: '/Ảnh Sản Phẩm/dx/Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set 1.jpg',
    comment: 'Khâu đóng gói của shop phải nói là đỉnh nhất trong các shop Tokusatsu mình từng mua. Thùng carton cứng chuyên dụng, bọc bóng khí bọt tuyết chống sốc 5 lớp dày cộm, góc hộp có nẹp bảo vệ cẩn thận. Giao từ TP.HCM ra Đà Nẵng bằng hỏa tốc mà hộp còn nguyên vẹn góc vuông 90 độ, collector nhìn là mê liền!',
    images: [
      '/Ảnh Sản Phẩm/dx/Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set 1.jpg',
      '/Ảnh Sản Phẩm/dx/Super Best DX Sengoku Driver Kamen Rider Gaim & Baron Set 2.jpg'
    ],
    verifiedPurchase: true,
    date: '08/11/2026',
    helpfulCount: 29,
    adminReply: {
      author: 'Đội Ngũ Kho Vận NPT',
      date: '08/11/2026',
      content: 'Dạ NPT Store hiểu hộp giấy và góc hộp quan trọng thế nào với anh em Collector, nên tiêu chuẩn bọc hàng luôn là ưu tiên số 1 ạ. Cảm ơn anh Bảo rất nhiều!'
    }
  },
  {
    id: 'fb-003',
    customerName: 'Lê Hoàng Nam',
    customerLocation: 'TP. Hồ Chí Minh',
    customerAvatar: generateCustomerAvatarSvgUrl({
      maskId: 'gavv-gummy',
      colorId: 'cyber-cyan',
      initials: 'HN',
      customerName: 'Lê Hoàng Nam'
    }),
    rating: 5,
    category: 'Chất lượng sản phẩm',
    productId: 'shf-bitter-gavv',
    productName: 'SHF Kamen Rider Bitter Gavv Marblebreacookie Form Bandai',
    productImage: '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Bitter Gavv Marblebreacookie Form1.jpg',
    comment: 'Mô hình S.H.Figuarts Bitter Gavv khớp cực kỳ đầm, biên độ tạo dáng linh hoạt, màu sơn chi tiết kẹo bánh quy sắc nét đến từng milimet. Đặt hàng qua showroom Nguyễn Trãi nhân viên đem sẵn cả khăn lau mô hình hỗ trợ kiểm tra khớp trước khi thanh toán. Trải nghiệm dịch vụ 5 sao xứng đáng!',
    images: [
      '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Bitter Gavv Marblebreacookie Form1.jpg',
      '/Ảnh Sản Phẩm/shf/[Chính Hãng] SHF Kamen Rider Bitter Gavv Marblebreacookie Form2.jpg'
    ],
    verifiedPurchase: true,
    date: '05/11/2026',
    helpfulCount: 24,
    adminReply: {
      author: 'Showroom NPT TP.HCM',
      date: '05/11/2026',
      content: 'Cảm ơn anh Nam ghé showroom trải nghiệm! Bitter Gavv đợt này về số lượng giới hạn, anh may mắn sở hữu sớm form đặc biệt này ạ.'
    }
  },
  {
    id: 'fb-004',
    customerName: 'Phạm Hoàng Long',
    customerLocation: 'Hải Phòng',
    customerAvatar: generateCustomerAvatarSvgUrl({
      maskId: 'zero-one',
      colorId: 'dark-purple',
      initials: 'HL',
      customerName: 'Phạm Hoàng Long'
    }),
    rating: 5,
    category: 'Bảo hành & Hậu mãi',
    productId: 'dx-zeztz-invoker',
    productName: 'Kamen Rider Zeztz DX Henshin Belt Lord Invoker',
    productImage: '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg',
    comment: 'Lúc đầu nhận đai bị lỏng pin một chút do vận chuyển, mình liên hệ số hotline kỹ thuật NPT là được hướng dẫn rất tận tình. Shop còn chủ động gửi thêm 1 vỉ pin Maxell xịn kèm móc khóa quà tặng bù đắp. Chính sách bảo hành và hậu mãi ở đây thực sự chu đáo và giữ chữ tín hàng đầu.',
    images: [
      '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg'
    ],
    verifiedPurchase: true,
    date: '02/11/2026',
    helpfulCount: 19,
    adminReply: {
      author: 'Bộ Phận Kỹ Thuật NPT',
      date: '02/11/2026',
      content: 'NPT Store cam kết hỗ trợ kỹ thuật trọn đời cho mọi anh em Rider. Chúc anh Long có những giờ phút giải trí và biến hình thật vui vẻ ạ!'
    }
  },
  {
    id: 'fb-005',
    customerName: 'Đặng Đức Huy',
    customerLocation: 'Huế',
    customerAvatar: generateCustomerAvatarSvgUrl({
      maskId: 'faiz-red',
      colorId: 'gold-bandai',
      initials: 'ĐH',
      customerName: 'Đặng Đức Huy'
    }),
    rating: 5,
    category: 'Trải nghiệm & Dịch vụ',
    productId: 'shf-ark-one',
    productName: 'SHF Kamen Rider Ark-One Premium Bandai',
    productImage: '/Ảnh Sản Phẩm/shf premium/[Chính Hãng] SHF Kamen Rider Ark-One 1.jpg',
    comment: 'Giao diện web mượt mà, tra cứu mã đơn hàng hiển thị chi tiết tiến độ. Sản phẩm SHF Ark-One thuộc bản Premium Bandai hiếm, shop giao đúng hẹn kèm thư cảm ơn viết tay rất trang trọng. Cảm giác mua sắm tại NPT Store như đang được phục vụ tại các store lớn ở Akihabara Nhật Bản vậy.',
    images: [
      '/Ảnh Sản Phẩm/shf premium/[Chính Hãng] SHF Kamen Rider Ark-One 1.jpg'
    ],
    verifiedPurchase: true,
    date: '28/10/2026',
    helpfulCount: 17
  },
  {
    id: 'fb-006',
    customerName: 'Vũ Gia Hân',
    customerLocation: 'Cần Thơ',
    customerAvatar: generateCustomerAvatarSvgUrl({
      maskId: 'saber-dragon',
      colorId: 'crimson-ruby',
      initials: 'GH',
      customerName: 'Vũ Gia Hân'
    }),
    rating: 5,
    category: 'Chất lượng sản phẩm',
    productId: 'dx-gotchard-legend-raiser',
    productName: 'Đồ chơi biến hình Kamen Rider Gotchard DX Legend Kamen Raiser',
    productImage: '/Ảnh Sản Phẩm/dx/Đồ chơi biến hình Kamen Rider Gotchard DX Legend Kamen Raiser.jpg',
    comment: 'Mua tặng sinh nhật cho em trai đam mê Kamen Rider Gotchard. Âm thanh to rõ, đèn LED sáng lung linh đúng chất phim. Giá cả rất cạnh tranh so với các bên order xách tay, lại có bảo hành tem chống hàng giả đầy đủ. Chắc chắn sẽ quay lại ủng hộ shop tiếp!',
    images: [
      '/Ảnh Sản Phẩm/dx/Đồ chơi biến hình Kamen Rider Gotchard DX Legend Kamen Raiser.jpg'
    ],
    verifiedPurchase: true,
    date: '25/10/2026',
    helpfulCount: 14
  }
];

// Danh sách khách hàng thân thiết được vinh danh (Chỉ những khách hàng đã mua từ 20 sản phẩm trở lên)
export const CERTIFIED_TOP_CUSTOMERS: TributeCustomer[] = [
  {
    id: 'trib-001',
    name: 'Trần Minh Quân',
    location: 'Hà Nội',
    avatar: generateCustomerAvatarSvgUrl({
      maskId: 'geats-fox',
      colorId: 'crimson-ruby',
      initials: 'MQ',
      customerName: 'Trần Minh Quân'
    }),
    title: 'Đại Sứ Sưu Tầm CSM',
    tierBadge: 'Hạng 1 - Vương Miện Vàng',
    totalProductsPurchased: 28, // >= 20 sản phẩm
    totalOrders: 18,
    memberSince: 'Tháng 03/2024',
    favoriteSeries: 'Kamen Rider Geats & Kamen Rider W',
    featuredCollection: [
      'CSM Typhoon 50th Anniversary',
      'CSM Decadriver Ver.2',
      'DX Henshin Belt Lord Invoker',
      'Super Best DX Sengoku Driver Gaim & Baron',
      'SHF Geats Magnum Boost Form'
    ]
  },
  {
    id: 'trib-002',
    name: 'Nguyễn Quốc Bảo',
    location: 'Đà Nẵng',
    avatar: generateCustomerAvatarSvgUrl({
      maskId: 'decade-king',
      colorId: 'gold-bandai',
      initials: 'QB',
      customerName: 'Nguyễn Quốc Bảo'
    }),
    title: 'Chuyên Gia Đai DX & Henshin Item',
    tierBadge: 'Hạng 2 - Vương Miện Bạc',
    totalProductsPurchased: 24, // >= 20 sản phẩm
    totalOrders: 15,
    memberSince: 'Tháng 06/2024',
    favoriteSeries: 'Kamen Rider Gotchard & Kamen Rider Gavv',
    featuredCollection: [
      'DX Desire Driver Full Set',
      'DX Legend Ride Magnum',
      'DX Valvarusher & Ride Chemy Phase 01',
      'SHF Kamen Rider Xross Saber',
      'DX Chain Array & Claw Raise Buckle'
    ]
  },
  {
    id: 'trib-003',
    name: 'Lê Hoàng Nam',
    location: 'TP. Hồ Chí Minh',
    avatar: generateCustomerAvatarSvgUrl({
      maskId: 'gavv-gummy',
      colorId: 'cyber-cyan',
      initials: 'HN',
      customerName: 'Lê Hoàng Nam'
    }),
    title: 'Nhà Sưu Tầm S.H.Figuarts Kỳ Cựu',
    tierBadge: 'Hạng 3 - Vương Miện Đồng',
    totalProductsPurchased: 21, // >= 20 sản phẩm
    totalOrders: 14,
    memberSince: 'Tháng 01/2025',
    favoriteSeries: 'Kamen Rider Saber & Kamen Rider Revice',
    featuredCollection: [
      'SHF Kamen Rider Ark-One',
      'SHF Bitter Gavv Marblebreacookie Form',
      'SHF Saber Brave Dragon Metallic Edition',
      'Super Best DX Sengoku Driver Set',
      'DX Magnum Shooter 40X Weapon'
    ]
  }
];
