# TECHNOLOGY - High Performance Systems

**TECHNOLOGY** là hệ thống thương mại điện tử chuyên cung cấp các sản phẩm máy tính, linh kiện, và phụ kiện công nghệ chất lượng cao. Dự án được phát triển với kiến trúc tách biệt giữa Frontend và Backend, sử dụng các công nghệ hiện đại nhất để đảm bảo hiệu suất, bảo mật và trải nghiệm người dùng tối ưu.

**Kiến trúc hệ thống:**
- **Frontend (Next.js 16 / React 19):** Xây dựng giao diện mượt mà, tối ưu SEO với Server-Side Rendering (SSR). Sử dụng TailwindCSS v4 để tạo kiểu, Zustand quản lý state toàn cục và React Query để quản lý dữ liệu từ server.
- **Backend (Node.js / Express 5):** Hệ thống API RESTful mạnh mẽ, tích hợp Prisma ORM tương tác với cơ sở dữ liệu MariaDB/MySQL. 
- **Tính năng nổi bật:**
  - **Quản lý sản phẩm đa dạng:** Tìm kiếm, lọc và phân trang mượt mà.
  - **Giỏ hàng & Thanh toán:** Tích hợp giỏ hàng và xử lý thanh toán thực tế (VNPAY IPN).
  - **Hệ thống Real-time:** Sử dụng Socket.io để đẩy thông báo trạng thái đơn hàng cho khách hàng và thông báo có Đánh giá/Đơn hàng mới cho Admin ngay lập tức.
  - **AI Tích hợp:** 
    - *Chatbot AI (Claude Anthropic)* hỗ trợ khách hàng.
    - *Công cụ sinh bài viết AI* cho quản trị viên, tự động tạo nội dung chuẩn SEO dựa trên từ khóa.
  - **Hệ thống gửi Email:** Gửi email xác nhận, hỗ trợ bằng Nodemailer với template EJS đẹp mắt.

Dự án cung cấp một bộ khung (boilerplate) hoàn chỉnh cho một ứng dụng e-commerce hiện đại, có thể dễ dàng mở rộng và tùy chỉnh theo nhu cầu kinh doanh.

---

## 🛠️ Hướng Dẫn Khởi Tạo & Cấu Hình Dự Án

### 1. Cài đặt thư viện và khởi tạo Database
Chạy các lệnh sau trong thư mục `backend`:
```bash
cd backend
npm install
# Khởi tạo database và chạy file seed để tạo 1000 sản phẩm mẫu
npx prisma db push
npx tsx prisma/seed.ts
```

Chạy các lệnh sau trong thư mục `frontend`:
```bash
cd frontend
npm install
```

### 2. Cấu hình tính năng Gửi Mail
Mở file `backend/.env` và tìm các biến môi trường sau:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email-cua-ban@gmail.com
SMTP_PASS=mat-khau-ung-dung-cua-ban
```
- **SMTP_USER**: Nhập địa chỉ Gmail của bạn.
- **SMTP_PASS**: Sử dụng **Mật khẩu ứng dụng (App Password)** từ tài khoản Google của bạn (không dùng mật khẩu đăng nhập thông thường). Để tạo mật khẩu ứng dụng, hãy bật xác minh 2 bước trong tài khoản Google, tìm mục "App passwords" và tạo mật khẩu mới.

### 3. Cấu hình tính năng AI (Chatbot & Viết bài tự động)
Hệ thống sử dụng API của Anthropic (Claude) để vận hành chatbot tư vấn khách hàng và công cụ tự động sinh bài viết tin tức.
Mở file `backend/.env` và thêm/cập nhật dòng sau:
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxx
```
- Thay thế chuỗi `sk-ant-api03-...` bằng API Key thực tế bạn lấy từ trang [Anthropic Console](https://console.anthropic.com/).

### 4. Khởi động dự án
Khởi động Backend (mở terminal 1):
```bash
cd backend
npm run dev
```

Khởi động Frontend (mở terminal 2):
```bash
cd frontend
npm run dev
```
Truy cập `http://localhost:3000` để bắt đầu trải nghiệm!
- **Tài khoản Admin:** `admin@shop.com` / Mật khẩu: `123456`
- **Tài khoản User:** `user@shop.com` / Mật khẩu: `123456`
