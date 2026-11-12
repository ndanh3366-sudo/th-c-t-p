import type { Product } from '../types.ts';

export interface PosterItem {
  id: string;
  title: string;
  series: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  paperType: string;
  dimensions: string;
  badge: string;
  description: string;
}

export const POSTER_ITEMS: PosterItem[] = [
  {
    "id": "poster-1",
    "title": "Poster Dọc Kamen Rider Official Art #1",
    "series": "Kamen Rider Gavv",
    "image": "/Bộ Sưu Tập Poster Dọc/3yya7pw1zck91.jpg",
    "price": 150000,
    "originalPrice": 220000,
    "rating": 5,
    "reviewCount": 25,
    "soldCount": 150,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "🔥 HOT POSTER",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-2",
    "title": "Poster Dọc Kamen Rider Official Art #2",
    "series": "Kamen Rider Series",
    "image": "/Bộ Sưu Tập Poster Dọc/DNvuIXb.webp",
    "price": 160000,
    "originalPrice": 230000,
    "rating": 5,
    "reviewCount": 28,
    "soldCount": 162,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "✨ ART PRINT",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-3",
    "title": "Poster Dọc Kamen Rider Official Art #3",
    "series": "Kamen Rider Gavv",
    "image": "/Bộ Sưu Tập Poster Dọc/Kamen_Rider_Cross-Z_Poster.webp",
    "price": 170000,
    "originalPrice": 240000,
    "rating": 5,
    "reviewCount": 31,
    "soldCount": 174,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "✨ ART PRINT",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-4",
    "title": "Poster Dọc Kamen Rider Official Art #4",
    "series": "Kamen Rider Series",
    "image": "/Bộ Sưu Tập Poster Dọc/Kamen_Rider_Gotchard_Poster.png",
    "price": 180000,
    "originalPrice": 250000,
    "rating": 5,
    "reviewCount": 34,
    "soldCount": 186,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "🔥 HOT POSTER",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-5",
    "title": "Poster Dọc Kamen Rider Official Art #5",
    "series": "Kamen Rider Gavv",
    "image": "/Bộ Sưu Tập Poster Dọc/MV5BNTczMDEzY2QtYzg0Zi00MjExLWJjNjMtODhmYTc2NDI3ZDA5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "price": 190000,
    "originalPrice": 260000,
    "rating": 5,
    "reviewCount": 37,
    "soldCount": 198,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "✨ ART PRINT",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-6",
    "title": "Poster Dọc Kamen Rider Official Art #6",
    "series": "Kamen Rider Series",
    "image": "/Bộ Sưu Tập Poster Dọc/MV5BYjg2ODg1MzAtYmVhMi00ZjI1LWExMzMtNTMwMzg3OTlkZTI4XkEyXkFqcGc@._V1_.jpg",
    "price": 150000,
    "originalPrice": 220000,
    "rating": 5,
    "reviewCount": 40,
    "soldCount": 210,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "✨ ART PRINT",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-7",
    "title": "Poster Dọc Kamen Rider Official Art #7",
    "series": "Kamen Rider Gavv",
    "image": "/Bộ Sưu Tập Poster Dọc/brand-new-official-poster-for-gavvs-latest-arc-v0-tgav2jhk04te1.webp",
    "price": 160000,
    "originalPrice": 230000,
    "rating": 5,
    "reviewCount": 43,
    "soldCount": 222,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "🔥 HOT POSTER",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-8",
    "title": "Poster Dọc Kamen Rider Official Art #8",
    "series": "Kamen Rider Series",
    "image": "/Bộ Sưu Tập Poster Dọc/first-poster-for-kamen-rider-the-summer-movie-2024-v0-vjn6l4fwdqvc1.webp",
    "price": 170000,
    "originalPrice": 240000,
    "rating": 5,
    "reviewCount": 46,
    "soldCount": 234,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "✨ ART PRINT",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-9",
    "title": "Poster Dọc Kamen Rider Official Art #9",
    "series": "Kamen Rider Gavv",
    "image": "/Bộ Sưu Tập Poster Dọc/fty6-1iaqaewwjk_orig.jpg",
    "price": 180000,
    "originalPrice": 250000,
    "rating": 5,
    "reviewCount": 49,
    "soldCount": 246,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "✨ ART PRINT",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-10",
    "title": "Poster Dọc Kamen Rider Official Art #10",
    "series": "Kamen Rider Series",
    "image": "/Bộ Sưu Tập Poster Dọc/greaseposter.webp",
    "price": 190000,
    "originalPrice": 260000,
    "rating": 5,
    "reviewCount": 52,
    "soldCount": 258,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "🔥 HOT POSTER",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  },
  {
    "id": "poster-11",
    "title": "Poster Dọc Kamen Rider Official Art #11",
    "series": "Kamen Rider Gavv",
    "image": "/Bộ Sưu Tập Poster Dọc/new-gavv-poster-v0-48h4kp8apa8e1.webp",
    "price": 180000,
    "originalPrice": 250000,
    "rating": 5,
    "reviewCount": 64,
    "soldCount": 306,
    "paperType": "Giấy Coucher Glossy 300gsm Phủ UV",
    "dimensions": "Khổ A2 (42 x 59.4 cm)",
    "badge": "✨ ART PRINT",
    "description": "Poster dọc chính hãng in trên giấy Coucher Glossy 300gsm phủ UV chống phai màu, mực in màu chuẩn Bandai Japan & Toei Company."
  }
];

export const posterToProduct = (poster: PosterItem): Product => {
  return {
    id: poster.id,
    name: poster.title,
    code: `POSTER-BANDAI-${poster.id.toUpperCase()}`,
    category: 'item-card',
    era: 'Reiwa',
    series: poster.series as any,
    price: poster.price,
    originalPrice: poster.originalPrice,
    isFlashSale: false,
    soldCount: poster.soldCount,
    stock: 99,
    rating: poster.rating,
    reviewCount: poster.reviewCount,
    images: [poster.image],
    condition: 'New Seal 100%',
    isHot: true,
    description: poster.description,
    fullDescription: [
      poster.description,
      `Kích thước tiêu chuẩn: ${poster.dimensions}`,
      `Chất liệu in: ${poster.paperType}`,
      `Nguồn gốc: Nhập khẩu chính hãng Bandai Japan & Toei Company`,
      `Đóng gói: Ống carton cứng chống gập móp, bọc ni-lông bóng chấn động.`
    ],
    specifications: {
      manufacturer: 'Bandai Japan / Toei Company',
      material: poster.paperType,
      size: poster.dimensions,
      releaseYear: '2026'
    }
  };
};
