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

---

## 🐳 Hướng Dẫn Khởi Chạy Bằng Docker (Môi trường Production)

Dự án đã được tích hợp sẵn `docker-compose.yml` hoàn chỉnh với các service: MySQL, Redis, Backend, Frontend và Nginx (Reverse Proxy).

**Các bước thực hiện:**
1. Tạo file `.env` cho thư mục `backend` và `frontend` dựa trên `.env.example` (hệ thống sẽ tự động sử dụng cấu hình này và đè lên một số biến quan trọng từ `docker-compose.yml` để các container nhận diện nhau).
2. Tại thư mục gốc của dự án, chạy lệnh:
```bash
docker-compose up -d --build
```
3. Sau khi quá trình build hoàn tất, hệ thống sẽ chạy tại địa chỉ Nginx proxy: [http://localhost:8080](http://localhost:8080). (Tài khoản Admin/User vẫn như trên).

*Lưu ý: Lần đầu tiên build có thể mất vài phút. Bạn không cần chạy lệnh migrate database thủ công vì `npx prisma db push` cần được chạy sau khi container database khởi động (hoặc bạn có thể truy cập vào bash của container backend).*

---

## 🚀 Hướng Dẫn Triển Khai (Deploy) Lên Internet

Để deploy hệ thống lên một máy chủ thực tế (VD: VPS Ubuntu trên AWS, DigitalOcean, Linode,...), bạn có thể làm theo các bước sau:

1. **Chuẩn bị Máy chủ:** 
   - Đảm bảo máy chủ (VPS) đã được cài đặt sẵn **Docker** và **Docker Compose**.
2. **Đưa Source code lên VPS:**
   - Clone repository dự án về máy chủ.
3. **Cấu hình Môi trường:**
   - Sao chép `.env.example` thành `.env` trong cả 2 thư mục `backend` và `frontend`.
   - Chỉnh sửa `backend/.env` bằng thông tin thực tế (thay thế Mật khẩu, API Keys).
   - Ở `docker-compose.yml`, kiểm tra phần biến môi trường `ALLOWED_ORIGINS` của service `backend` và thay đổi `192.168.1.x` hoặc `localhost` thành IP Public/Domain của bạn. Tương tự, cập nhật `NEXT_PUBLIC_API_URL` ở service `frontend`.
4. **Cấu hình Tên miền (Domain):**
   - Trỏ bản ghi A/CNAME của tên miền về địa chỉ IP của VPS.
   - Sửa cấu hình trong `nginx/nginx.conf`: Thay đổi `server_name localhost;` thành `server_name tenmiencuaban.com;`.
5. **Khởi chạy Hệ thống:**
   - Tại thư mục gốc, chạy lệnh:
   ```bash
   docker-compose up -d --build
   ```
6. **Khởi tạo dữ liệu (Lần đầu tiên):**
   - Để khởi tạo bảng trong database MySQL qua Docker, bạn có thể chạy:
   ```bash
   docker exec -it shop-me-backend npx prisma db push
   docker exec -it shop-me-backend npx tsx prisma/seed.ts
   ```

*Hệ thống mạng nội bộ (shop-me-network) của Docker đảm bảo tính bảo mật. Các ứng dụng bên ngoài không thể truy cập trực tiếp vào Database hay Redis, chúng chỉ có thể đi qua Nginx.*
