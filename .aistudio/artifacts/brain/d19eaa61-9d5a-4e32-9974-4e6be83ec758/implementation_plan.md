# Gỡ Bỏ Nút Âm Thanh và Nút Giới Thiệu Ở Thanh Đầu Trang

Kế hoạch tối ưu hóa giao diện thanh thông báo đầu trang (Top Header Bar), loại bỏ nút chuyển đổi âm thanh và nút mở lại giới thiệu nhằm tạo không gian thoáng đãng, gọn gàng và tinh tế hơn cho website.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Nút Âm Thanh trên đầu trang:** Được loại bỏ để giao diện thanh trên cùng không bị rối mắt. Âm thanh click chuột chân thực vẫn tiếp tục hoạt động mượt mà khi người dùng tương tác.
> - **Nút Giới Thiệu trên đầu trang:** Được loại bỏ khỏi thanh thông báo trên cùng. Người dùng vẫn có thể xem thông tin giới thiệu qua tab "Giới Thiệu Web" trên thanh điều hướng chính (Navigation Bar) hoặc nút "Về chúng tôi" ở chân trang (Footer).
> - **Màn hình chào mừng (Intro Overlay):** Tắt tự động hiển thị intro khi mở trang web để người dùng vào thẳng trang chủ nhanh chóng.

---

### 1. Overview & Core Concept

- **Mục tiêu:** Tinh giản hàng trên cùng (Top Announcement Bar) của Header, giảm thiểu các nút bấm phụ không cần thiết, giúp khách hàng tập trung vào ưu đãi chính và danh mục sản phẩm đồ chơi Kamen Rider / Tokusatsu.
- **Đối tượng người dùng:** Khách hàng, nhà sưu tầm Tokusatsu muốn trải nghiệm duyệt web mượt mà, trực quan, không bị các nút bấm và banner che chắn tầm nhìn.

---

### 2. User Experience & Visual Design

- **Trước khi thay đổi:**
  - Thanh trên cùng chứa: Mã giảm giá Noel, Đối tác Bandai, Team NPT Official, **Nút Âm thanh: Bật/Tắt**, **Nút Giới thiệu**, Chính Hãng Bandai, Freeship, PWA Install.
  - Khi tải trang lần đầu xuất hiện màn hình Intro chào mừng phải bấm bỏ qua.
- **Sau khi thay đổi:**
  - Thanh trên cùng chỉ giữ các thông tin cốt lõi: Banner khuyến mãi Noel 2026, chứng nhận chính hãng Bandai Japan, nút PWA cài đặt.
  - Loại bỏ hoàn toàn 2 nút `onToggleSound` và `onReplayIntro` khỏi thanh trên cùng.
  - Tải trang tức thì, không bị chặn bởi Intro overlay.

---

### 3. Key Decisions & Technical Strategy

- **Thực hiện trong `src/components/Header.tsx`:**
  - Gỡ bỏ khối button `onToggleSound` (âm thanh) và `onReplayIntro` (giới thiệu) trong thẻ `div` thanh thông báo đầu trang.
  - Căn chỉnh lại khoảng cách và bố cục `flex items-center` giữa các thông tin còn lại.
- **Thực hiện trong `src/App.tsx`:**
  - Đặt `showIntro` ban đầu thành `false` để trang hiển thị ngay tức thì mà không cần đóng intro.
- **Đảm bảo không phá vỡ logic âm thanh:**
  - Âm thanh click chuột máy tính (`playMouseClickSound`) vẫn tiếp tục hoạt động tự động trên toàn bộ các nút bấm và liên kết.

---

### 4. Technical Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│               Top Announcement Bar (Streamlined)       │
│  [🎄 Mã Noel 2026] • [Bandai Japan]  ───  [PWA Install]│
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│                   Main Navigation Bar                  │
│ [Logo]  [Tìm kiếm sản phẩm]  [Giỏ hàng]  [Tài khoản]   │
└────────────────────────────────────────────────────────┘
```
