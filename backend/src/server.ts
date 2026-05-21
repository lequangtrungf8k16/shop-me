import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { z } from "zod";

// 1. Tái tạo __dirname cho môi trường ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nạp cấu hình từ .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 2. Validate biến môi trường bằng Zod (Bắt buộc theo chuẩn hệ thống)
const envSchema = z.object({
   PORT: z.string().default("5000"),
   DATABASE_URL: z.string(),
});

const envParsed = envSchema.safeParse(process.env);
if (!envParsed.success) {
   console.error("❌ Lỗi cấu hình hệ thống (.env):", envParsed.error.format());
   process.exit(1); // Dừng hệ thống nếu cấu hình sai lệch
}

import express, {
   type NextFunction,
   type Request,
   type Response,
} from "express";
import { createServer } from "http";
import { Prisma } from "@prisma/client";
import { AppError } from "./shared/errors/AppError.js";
import { corsMiddleware } from "./config/cors.js";
import { initSocket } from "./config/socket.js";

import categoryRoutes from "./modules/categories/category.route.js";
import productRoutes from "./modules/products/product.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import orderRoutes from "./modules/orders/order.route.js";
import userRoutes from "./modules/users/user.route.js";
import adminRoutes from "./modules/admin/admin.route.js";
import reviewRoutes from "./modules/reviews/review.route.js";
import reactionRoutes from "./modules/reactions/reaction.route.js";
import commentRoutes from "./modules/comments/comment.route.js";
import articleRoutes from "./modules/articles/article.route.js";
import cartRoutes from "./modules/cart/cart.route.js";
import aiRoutes from "./modules/ai/ai.route.js";
import notificationRoutes from "./modules/notifications/notification.route.js";
import contactRoutes from "./modules/contact/contact.route.js";
import uploadRoutes from "./modules/upload/upload.route.js";

const app = express();
const PORT = Number(envParsed.data.PORT);
const httpServer = createServer(app);

initSocket(httpServer);

app.use(corsMiddleware);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 3. Phân phối tài liệu lưu trữ nội bộ
app.use("/uploads", express.static(path.resolve(__dirname, "../../uploads")));

// Cấu hình Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);

// Health Check cho Container Orchestration (Docker/Nginx)
app.get("/health", (_req, res) => {
   res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Xử lý Route không tồn tại
app.use((_req, res) => {
   res.status(404).json({
      status: "error",
      message: "Đường dẫn không tồn tại trên hệ thống",
   });
});

// Middleware xử lý lỗi tập trung
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
   if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
         res.status(409).json({
            status: "error",
            message: "Dữ liệu đã tồn tại trong cơ sở dữ liệu",
         });
         return;
      }
      if (err.code === "P2025") {
         res.status(404).json({
            status: "error",
            message: "Không tìm thấy bản ghi yêu cầu",
         });
         return;
      }
   }
   if (err instanceof AppError) {
      res.status(err.statusCode).json({
         status: "error",
         message: err.message,
      });
      return;
   }
   console.error("Lỗi hệ thống chưa kiểm soát:", err);
   res.status(500).json({
      status: "error",
      message: "Sự cố máy chủ nội bộ. Vui lòng liên hệ kỹ thuật viên.",
   });
});

httpServer.listen(PORT, () => {
   console.log(`✅ Trạm điều hành Server sẵn sàng tại Port: ${PORT}`);
   console.log(`🔌 Kết nối Socket.IO thời gian thực đã kích hoạt`);
});

export default app;
