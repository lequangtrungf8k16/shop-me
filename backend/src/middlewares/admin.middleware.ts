import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware";
import { AppError } from "../shared/errors/AppError";

// Middleware kiểm tra quyền ADMIN
// Phải chạy SAU authMiddleware (req.user đã được gán)
export const adminMiddleware = (
   req: AuthRequest,
   _res: Response,
   next: NextFunction,
) => {
   if (!req.user) {
      return next(new AppError("Chưa xác thực. Vui lòng đăng nhập.", 401));
   }

   if (req.user.role !== "ADMIN") {
      return next(
         new AppError("Truy cập bị từ chối. Bạn không có quyền Admin.", 403),
      );
   }

   next();
};
