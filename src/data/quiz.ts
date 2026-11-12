export interface QuizOption {
  label: string;
  rider: 'Gavv' | 'Build' | 'Gotchard' | 'Kuuga';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export interface RiderResult {
  rider: 'Gavv' | 'Build' | 'Gotchard' | 'Kuuga';
  name: string;
  title: string;
  image: string;
  henshinCatchphrase: string;
  recommendedBeltId: string;
  description: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Khi đối mặt với thử thách khó khăn, phong thái của bạn là gì?',
    options: [
      { label: 'Năng nổ, độc đáo, sẵn sàng biến nỗi đau đắng thành sức mạnh bánh kẹo', rider: 'Gavv' },
      { label: 'Dùng trí tuệ, phân tích công thức khoa học để tìm ra giải pháp tối ưu', rider: 'Build' },
      { label: 'Nhiệt huyết, lạc quan, tin tưởng vào tình bạn và phản ứng hóa học kỳ diệu', rider: 'Gotchard' },
      { label: 'Điềm tĩnh, luôn mỉm cười và sẵn sàng xả thân bảo vệ nụ cười của mọi người', rider: 'Kuuga' }
    ]
  },
  {
    id: 2,
    question: 'Món phụ kiện / Item biến hình nào hấp dẫn bạn nhất?',
    options: [
      { label: 'Các hộp kẹo Gochizo / Capsem đắng ngọt đầy bất ngờ', rider: 'Gavv' },
      { label: 'Các chai Fullbottle lắc lọc xọc sinh động', rider: 'Build' },
      { label: 'Những lá thẻ Ride Chemy Cards lấp lánh thuật giả kim', rider: 'Gotchard' },
      { label: 'Đai linh thạch Arcle cổ đại phát sáng sức mạnh nguyên thủy', rider: 'Kuuga' }
    ]
  },
  {
    id: 3,
    question: 'Phong cách chiến đấu yêu thích của bạn là gì?',
    options: [
      { label: 'Nhai giòn tan, kích hoạt vũ khí bánh kẹo tung cú đấm Gavv bùng nổ', rider: 'Gavv' },
      { label: 'Tính toán quỹ đạo parabol chuẩn xác rồi dồn lực Voltech Finish', rider: 'Build' },
      { label: 'Hợp thể cùng linh thú Chemy, tung cú đá lộn vòng đầy năng lượng', rider: 'Gotchard' },
      { label: 'Giơ ngón tay cái (Thumbs Up) rồi tung cú đá Rider Kick nổ uy lực', rider: 'Kuuga' }
    ]
  }
];

export const RIDER_RESULTS: Record<string, RiderResult> = {
  Gavv: {
    rider: 'Gavv',
    name: 'Kamen Rider Bitter Gavv / Gavv (Shoma)',
    title: 'Kẹo Đắng Độc Đáo - Sức Mạnh Bánh Kẹo & Poppingmy',
    image: '/Ảnh Sản Phẩm/kamen rider/bitter gavv.webp',
    henshinCatchphrase: 'Ăn vị đắng, nuốt ngọt ngào, bảo vệ nụ cười thế giới!',
    recommendedBeltId: 'p-real-02',
    description: 'Bạn là người tràn đầy năng lượng, có chút độc đáo và luôn biết biến thử thách cay đắng thành động lực ngọt ngào. Chiếc đai DX Gavv / Capsem sinh ra là để dành cho bạn!'
  },
  Build: {
    rider: 'Build',
    name: 'Kamen Rider Build (Kiryu Sento)',
    title: 'Thiên Tài Vật Lý - Khởi Tạo Công Thức Chiến Thắng',
    image: '/Ảnh Sản Phẩm/kamen rider/builfd.jpg',
    henshinCatchphrase: 'Quy luật của chiến thắng đã được thiết lập!',
    recommendedBeltId: 'p-real-01',
    description: 'Bạn là người thông minh, đam mê khám phá và luôn dùng đầu óc để giải quyết các mớ bế tắc. Hãy lắc chai Fullbottle và biến hình!'
  },
  Gotchard: {
    rider: 'Gotchard',
    name: 'Kamen Rider Gotchard (Ichinose Houtaro)',
    title: 'Nhà Giả Kim Thuật - Kết Nối Trái Tim Linh Thú Chemy',
    image: '/Ảnh Sản Phẩm/kamen rider/gotchard.webp',
    henshinCatchphrase: 'Gotcha & Go! Tạo nên phản ứng hóa học kỳ diệu!',
    recommendedBeltId: 'p-real-05',
    description: 'Trái tim chân thành, tinh thần đồng đội và niềm tin mãnh liệt là sức mạnh lớn nhất của bạn. Đai DX Gotchardriver sẽ biến ước mơ thành hiện thực.'
  },
  Kuuga: {
    rider: 'Kuuga',
    name: 'Kamen Rider Kuuga (Godai Yusuke)',
    title: 'Chiến Binh Nụ Cười - Sức Mạnh Nguyên Thủy Linto',
    image: '/Ảnh Sản Phẩm/kamen rider/kuuga.jpg',
    henshinCatchphrase: 'Vì nụ cười của tất cả mọi người, tôi sẽ chiến đấu!',
    recommendedBeltId: 'p-showa-01',
    description: 'Bạn kiên cường, ấm áp và sẵn sàng cống hiến hết mình vì sự bình yên của những người xung quanh. Đai huyền thoại Arcle linh thạch chính là định mệnh của bạn!'
  }
};
