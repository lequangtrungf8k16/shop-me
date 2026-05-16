import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../shared/errors/AppError.js";
import redisClient from "../config/redis.js";

export interface AuthRequest extends Request {
   user?: {
      id: number;
      email: string;
      role: string;
      iat?: number;
      exp?: number;
   };
}

export const authMiddleware = async (
   req: AuthRequest,
   _res: Response,
   next: NextFunction,
) => {
   try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         throw new AppError(
            "Bạn chưa đăng nhập. Vui lòng cung cấp token!",
            401,
         );
      }

      const token = authHeader.split(" ")[1];
      if (!token) throw new AppError("Định dạng token không hợp lệ!", 401);

      // Kiểm tra blacklist Redis
      const isBlacklisted = await redisClient.get(`blacklist_${token}`);
      if (isBlacklisted) {
         throw new AppError(
            "Token này đã bị thu hồi. Vui lòng đăng nhập lại!",
            401,
         );
      }

      const JWT_SECRET =
         process.env["JWT_ACCESS_SECRET"] || "technology_secret_key_super_safe";

      const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
      req.user = decoded;

      next();
   } catch (error: unknown) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
         return next(
            new AppError("Token đã hết hạn. Vui lòng đăng nhập lại!", 401),
         );
      }
      if (error instanceof AppError) return next(error);
      return next(new AppError("Token không hợp lệ!", 401));
   }
};
