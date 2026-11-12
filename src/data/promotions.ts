import { Coupon } from '../types';

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'NOEL2026',
    title: '🎄 Đại Lễ Giáng Sinh Noel - Giảm 15%',
    description: 'Ưu đãi Giáng Sinh 2026 giảm ngay 15% cho mọi đơn hàng mô hình & đai biến hình Tokusatsu.',
    discountType: 'percent',
    value: 15,
    minOrder: 500000,
    expiry: '31/12/2026',
    colorTag: 'ruby'
  },
  {
    code: 'RIDER100K',
    title: 'Mã Giảm 100.000đ Đơn Đầu Tiên',
    description: 'Áp dụng cho tất cả thành viên mới đặt đơn mua đai DX hoặc CSM từ 1.000.000đ trở lên.',
    discountType: 'fixed',
    value: 100000,
    minOrder: 1000000,
    expiry: '31/12/2026',
    colorTag: 'gold'
  },
  {
    code: 'CSM2026',
    title: 'Voucher Giảm 5% Sản Phẩm CSM',
    description: 'Ưu đãi dành riêng cho dòng sản phẩm Complete Selection Modification cao cấp.',
    discountType: 'percent',
    value: 5,
    minOrder: 5000000,
    expiry: '31/12/2026',
    colorTag: 'ruby'
  },
  {
    code: 'FREESHIP',
    title: 'Miễn Phí Vận Chuyển Toàn Quốc',
    description: 'Trợ giá tối đa 50.000đ phí ship Hỏa Tốc / Chuyển Phát Nhanh cho đơn hàng từ 1.500.000đ.',
    discountType: 'fixed',
    value: 50000,
    minOrder: 1500000,
    expiry: 'Khống thời hạn',
    colorTag: 'gold'
  },
  {
    code: 'GAVVIP50',
    title: 'Giảm 50K Mua Combo Kẹo Gochizo',
    description: 'Áp dụng khi mua từ 3 mẫu Gochizo mở rộng thuộc series Kamen Rider Gavv.',
    discountType: 'fixed',
    value: 50000,
    minOrder: 500000,
    expiry: '31/10/2026',
    colorTag: 'emerald'
  }
];
