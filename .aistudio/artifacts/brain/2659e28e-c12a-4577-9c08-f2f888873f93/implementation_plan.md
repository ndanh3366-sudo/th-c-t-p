# Kế Hoạch: Bỏ Hoàn Toàn Tất Cả Chức Năng Liên Quan Tới Live

## Tóm Tắt Nhiệm Vụ
Yêu cầu của người dùng: "bỏ hoàn toàn tất cả chức năng liên quan tới live". Loại bỏ toàn bộ giao diện, luồng phát sóng, WebSocket, SRS, client, camera, tab, menu, route server và database liên quan đến live stream.

## Các Hạng Mục Đã Hoàn Thành

1. **Client Views & Components:**
   - Xóa file `src/views/LiveShoppingView.tsx` (giao diện xem live, phát live, bộ lọc, chat live, giỏ hàng live).
   - Xóa `src/utils/srsClient.ts`, `src/utils/srsCameraConfig.ts`, `src/utils/liveFilters.ts`.
   - Cập nhật `src/App.tsx`:
     - Xóa import `LiveShoppingView` và state `liveStreamerMode`.
     - Xóa tab view `activeTab === 'live'`.
     - Xóa nút floating quick launcher phát sóng live.
     - Xóa prop `onGoToLiveStudio` truyền vào `AdminModal`.
   - Cập nhật `src/components/Header.tsx`:
     - Xóa mục `{ id: 'live', label: 'Live Sản Phẩm' }` trong thanh menu điều hướng.
     - Xóa nút truy cập nhanh "🔴 LIVE SẢN PHẨM" ở thanh chuyển cổng web khách / web quản lý.
     - Dọn dẹp toàn bộ class conditional `link.id === 'live'`.
   - Cập nhật `src/components/Footer.tsx`:
     - Xóa liên kết "🔴 Live Sản Phẩm" khỏi danh mục Quick Links.
   - Cập nhật `src/components/AdminModal.tsx`:
     - Xóa tab "🔴 Mở Phòng Live Stream" và toàn bộ nội dung Tab 0 (Form tạo phòng live, danh sách phòng live, nút đặt lại kênh live).
     - Xóa nút header "Lên Sóng Live Studio".
     - Đặt tab mặc định khi quản trị viên đăng nhập thành `'customers'`.
     - Xóa các state, handler liên quan đến live stream (`liveRooms`, `fetchLiveRooms`, `handleLaunchLiveStream`, `handleCreateNewLiveRoom`, v.v.).

2. **Types & Models:**
   - Cập nhật `src/types.ts`: Xóa toàn bộ type định nghĩa live stream (`LiveFilterType`, `LiveMessageLink`, `LiveMessageFile`, `LiveChatMessage`, `LiveSessionState`, `LiveRoom`, `SrsConfig`, `SrsServerStatus`).

3. **Backend Server & Database:**
   - Cập nhật `server.ts`:
     - Xóa WebSocketServer signaling, socket room handler (`streamer:join`, `viewer:join`, `signal:offer`, `live:frame`...).
     - Xóa toàn bộ REST endpoint `/api/live/*` (phòng live, tin nhắn, khóa chat, ghim sản phẩm, tồn kho live, cấm chat, mua hàng trên live, upload ảnh).
     - Xóa các endpoint giao thức SRS `/rtc/v1/*` (publish, play, whip, whep, srs/config, srs/status, srs/ping).
     - Xóa import `WebSocketServer` và `WebSocket`.
   - Cập nhật `server/db.ts`:
     - Xóa import các type live.
     - Xóa biến dữ liệu khởi tạo `INITIAL_LIVE_ROOMS` và `DEFAULT_SRS_CONFIG`.
     - Xóa toàn bộ hàm database thao tác phòng live, tin nhắn live, moderation và cấu hình SRS.

4. **Kiểm Tra & Xác Minh:**
   - `compile_applet`: Build thành công, không phát sinh lỗi.
   - `lint_applet`: `tsc --noEmit` hoàn thành không lỗi.
   - `restart_dev_server`: Dev server đã khởi động lại sạch sẽ.
