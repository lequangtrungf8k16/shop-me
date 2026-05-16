import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import redisClient from "../../config/redis.js";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
   try {
      const user = await authService.registerUser(req.body);
      return res.status(201).json({
         status: "success",
         message: "Tạo tài khoản thành công",
         data: user,
      });
   } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Đăng ký thất bại";
      return res.status(400).json({ status: "error", message: msg });
   }
};

export const login = async (req: Request, res: Response) => {
   try {
      const { email, password } = req.body as {
         email: string;
         password: string;
      };

      if (!email || !password) {
         return res.status(400).json({
            status: "error",
            message: "Vui lòng nhập đầy đủ email và mật khẩu",
         });
      }

      const result = await authService.loginUser({ email, password });

      return res.status(200).json({
         status: "success",
         message: "Đăng nhập thành công",
         data: result,
      });
   } catch (error: unknown) {
      const msg =
         error instanceof Error ? error.message : "Xác thực không chính xác";
      return res.status(401).json({ status: "error", message: msg });
   }
};

export const getMe = async (req: AuthRequest, res: Response) => {
   return res.status(200).json({ status: "success", data: req.user });
};

export const refreshToken = async (req: Request, res: Response) => {
   try {
      const { refreshToken: token } = req.body as { refreshToken: string };
      const result = await authService.refreshAccessToken(token);
      return res.status(200).json({
         status: "success",
         message: "Làm mới token thành công",
         data: result,
      });
   } catch (error: unknown) {
      const msg =
         error instanceof Error ? error.message : "Không thể làm mới token";
      return res.status(401).json({ status: "error", message: msg });
   }
};

export const logout = async (req: AuthRequest, res: Response) => {
   try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.split(" ")[1];
      const { refreshToken: token } = req.body as { refreshToken?: string };

      // Blacklist access token
      if (accessToken) {
         const decoded = jwt.decode(accessToken) as { exp?: number } | null;
         if (decoded?.exp) {
            const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
            if (timeLeft > 0) {
               await redisClient.setEx(
                  `blacklist_${accessToken}`,
                  timeLeft,
                  "revoked",
               );
            }
         }
      }

      // Blacklist refresh token
      if (token) {
         const decoded = jwt.decode(token) as { exp?: number } | null;
         if (decoded?.exp) {
            const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
            if (timeLeft > 0) {
               await redisClient.setEx(
                  `blacklist_${token}`,
                  timeLeft,
                  "revoked",
               );
            }
         }
      }

      return res.status(200).json({
         status: "success",
         message: "Đăng xuất thành công",
      });
   } catch {
      return res.status(500).json({
         status: "error",
         message: "Lỗi hệ thống khi đăng xuất",
      });
   }
};
