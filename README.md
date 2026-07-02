# PIC PLS (Mobile App) 📸

PIC PLS là ứng dụng di động kết nối khách hàng với các nhiếp ảnh gia (Grapher) chuyên nghiệp. Ứng dụng cung cấp giải pháp toàn diện để tìm kiếm, đặt lịch chụp ảnh, thanh toán và quản lý quá trình chụp ảnh cho cả hai vai trò: Khách hàng và Nhiếp ảnh gia.

## 🌟 Tính năng nổi bật

### Dành cho Khách hàng (Customer)
- **Khám phá & Tìm kiếm:** Lọc nhiếp ảnh gia theo địa điểm, phong cách chụp, giá cả, và đánh giá.
- **Hồ sơ chi tiết:** Xem portfolio, giới thiệu, phong cách và các gói dịch vụ của từng nhiếp ảnh gia.
- **Đặt lịch chụp:** Chọn gói dịch vụ, đặt thời gian, địa điểm và ghi chú.
- **Đánh giá & Khiếu nại (Disputes):** Để lại đánh giá sau buổi chụp hoặc báo cáo sự cố nếu có vấn đề.

### Dành cho Nhiếp ảnh gia (Grapher)
- **Quản lý Đơn hàng:** Xem và xác nhận/hủy các yêu cầu đặt lịch từ khách hàng.
- **Theo dõi lịch trình:** Bắt đầu và hoàn thành buổi chụp ngay trên ứng dụng.
- **Quản lý thanh toán:** Theo dõi tổng tiền dịch vụ, phí nền tảng và doanh thu thực nhận.

### Tính năng chung (Global)
- **Hệ thống Thông báo (Notifications):** Cập nhật theo thời gian thực trạng thái đơn hàng (chờ duyệt, đã xác nhận, hoàn thành).
- **Quản lý Tài khoản:** Cập nhật thông tin cá nhân và thay đổi ảnh đại diện (Avatar).
- **Trải nghiệm mượt mà:** Giao diện tối ưu UI/UX với Skeleton Loading, Pull-to-refresh, và Toast Notifications.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

- **Framework:** [React Native](https://reactnative.dev/) kết hợp với [Expo](https://expo.dev/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Điều hướng (Navigation):** React Navigation (Bottom Tabs & Native Stack)
- **Gọi API (Networking):** Axios
- **State Management:** Custom Auth Store sử dụng `useSyncExternalStore`
- **UI Components & Icons:** Vanilla CSS (StyleSheet), Expo Vector Icons, React Native Toast Message.

---

## 🚀 Hướng dẫn cài đặt và khởi chạy (Local Setup)

### Yêu cầu hệ thống
- Node.js (phiên bản 18.x trở lên)
- Npm hoặc Yarn
- Expo CLI (cài đặt thông qua lệnh: `npm install -g expo-cli`)
- Thiết bị di động đã cài đặt ứng dụng **Expo Go** hoặc **Expo Dev Client** (Hoặc phần mềm giả lập Android Studio / iOS Simulator).

### Bước 1: Clone Repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name/Mobile
```

### Bước 2: Cài đặt thư viện phụ thuộc (Dependencies)
```bash
npm install
```

### Bước 3: Cấu hình API Endpoint
Đảm bảo bạn đã có Backend đang chạy. Mở file thư mục API (ví dụ: `src/api/axiosClient.ts`) và đảm bảo đường dẫn `baseURL` trỏ đúng về địa chỉ server Backend của bạn (ví dụ: `http://localhost:5000` hoặc IP local mạng wifi của bạn).

### Bước 4: Khởi chạy ứng dụng
Chạy lệnh sau để khởi động Metro Bundler:
```bash
npx expo start --dev-client
# Hoặc nếu muốn xóa cache trước khi chạy:
npx expo start --dev-client -c
```

Sau khi chạy lệnh trên, terminal sẽ hiển thị một mã QR Code.
- **Đối với thiết bị vật lý:** Mở ứng dụng Camera (trên iOS) hoặc quét QR (trên Android) bằng ứng dụng Expo Go.
- **Đối với máy ảo:** Nhấn phím `a` để mở trên Android Emulator, hoặc `i` để mở trên iOS Simulator.

---

## 📂 Cấu trúc thư mục (Folder Structure)

```text
Mobile/
├── assets/             # Hình ảnh logo, splash screen, font chữ
├── src/                # Mã nguồn chính của ứng dụng
│   ├── api/            # Các cấu hình Axios và hàm gọi API (auth, booking, user,...)
│   ├── components/     # Các thành phần giao diện tái sử dụng (Skeleton, Toast,...)
│   ├── navigation/     # Cấu hình Stack Navigator & Bottom Tab Navigator
│   ├── screens/        # Giao diện các trang (Home, Notifications, Profile,...)
│   ├── store/          # Quản lý trạng thái toàn cục (AuthStore)
│   ├── theme/          # Cấu hình màu sắc, typography dùng chung
│   └── types/          # Khai báo các interface, type của TypeScript
├── App.tsx             # Entry point của ứng dụng
├── app.json            # File cấu hình của Expo (tên app, splash screen, icon)
└── package.json        # Danh sách thư viện và scripts
```

## 📝 License
Dự án được thực hiện cho môn học EXE201.
