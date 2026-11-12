import type { AuctionItem } from '../types.ts';

export const INITIAL_AUCTIONS: AuctionItem[] = [
  {
    id: 'auc-01',
    productName: 'CSM Double Driver Ver 1.5 Special Gold Plate Limited',
    code: 'CSM-W-GOLD-LIMITED',
    image: '/Sản Phẩm Đấu Giá Hoàng Gia/DX Don Onitaijin Gold Mekki Version.jpg',
    era: 'Heisei',
    startingBid: 6000000,
    currentBid: 8500000,
    highestBidder: 'Lê Minh Hoàng (RiderCollector_88)',
    bidCount: 24,
    endTime: '2026-07-31T21:00:00Z',
    condition: 'New Seal 100% - Số Seri #0007/1000',
    description: 'Phiên bản mạ vàng 24K đặc biệt sản xuất giới hạn 1000 chiếc trên toàn cầu của Bandai Premium. Có kèm chữ ký của diễn viên Kiriyama Renn (Shotaro).',
    bidHistory: [
      { bidderName: 'Lê Minh Hoàng', amount: 8500000, time: '20:15 - 27/07' },
      { bidderName: 'Nguyễn Văn An', amount: 8200000, time: '19:40 - 27/07' },
      { bidderName: 'Phạm Đức Trí', amount: 7800000, time: '18:10 - 27/07' },
      { bidderName: 'Trần Tuấn Kiệt', amount: 7000000, time: '15:20 - 27/07' }
    ]
  },
  {
    id: 'auc-02',
    productName: 'S.H.Figuarts Shinkocchou Seizou Kamen Rider Faiz (Chữ ký Kento Handa)',
    code: 'SKC-FAIZ-AUTOGRAPH',
    image: '/Sản Phẩm Đấu Giá Hoàng Gia/21272532_1434672139962663_2080887280343778585_n_3.webp',
    era: 'Heisei',
    startingBid: 3000000,
    currentBid: 4800000,
    highestBidder: 'Trịnh Quốc Bảo',
    bidCount: 18,
    endTime: '2026-08-01T20:00:00Z',
    condition: 'Like New 99% Fullbox + Autograph Card',
    description: 'Mô hình Chân Cốt Điêu Faiz 555 có chữ ký trực tiếp của nam diễn viên Takumi Inui (Kento Handa) tại sự kiện Tamashii Nation Tokyo.',
    bidHistory: [
      { bidderName: 'Trịnh Quốc Bảo', amount: 4800000, time: '16:05 - 27/07' },
      { bidderName: 'Hồ Thanh Tùng', amount: 4500000, time: '14:30 - 27/07' }
    ]
  }
];
