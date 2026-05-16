import type { Response, NextFunction } from "express";
import * as userService from "./user.service";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { ApiResponse } from "../../shared/types/index";

// Lấy thông tin profile + lịch sử đơn hàng của user đang đăng nhập
export const getProfileController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const profile = await userService.getUserProfile(userId);

      const response: ApiResponse = {
         status: "success",
         message: "Lấy thông tin thành công",
         data: profile,
      };

      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

// Cập nhật thông tin profile
export const updateProfileController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const updated = await userService.updateUserProfile(userId, req.body);

      const response: ApiResponse = {
         status: "success",
         message: "Cập nhật thông tin thành công",
         data: updated,
      };

      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};
