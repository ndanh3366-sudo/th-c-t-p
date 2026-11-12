import type { Order } from '../types.ts';

export const INITIAL_ORDERS: Order[] = [
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
