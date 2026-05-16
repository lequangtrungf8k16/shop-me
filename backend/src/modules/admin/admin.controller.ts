import type { Request, Response, NextFunction } from "express";
import * as adminService from "./admin.service";
import type { ApiResponse } from "../../shared/types/index";

// Lấy số liệu Dashboard
export const getDashboardController = async (
   _req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const stats = await adminService.getDashboardStats();
      const response: ApiResponse = {
         status: "success",
         message: "Lấy thống kê thành công",
         data: stats,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

// Lấy danh sách user
export const getUsersController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 10;

      const result = await adminService.getAllUsers(page, limit);
      const response: ApiResponse = {
         status: "success",
         message: "Lấy danh sách người dùng thành công",
         data: result,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

// Khóa / mở khóa tài khoản
export const toggleUserStatusController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = Number(req.params["id"]);
      if (isNaN(userId)) {
         res.status(400).json({ status: "error", message: "ID không hợp lệ" });
         return;
      }

      const updated = await adminService.toggleUserStatus(userId);
      const response: ApiResponse = {
         status: "success",
         message: `Tài khoản đã được ${updated.isActive ? "mở khóa" : "khóa"} thành công`,
         data: updated,
      };
      res.status(200).json(response);
   } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (msg === "Người dùng không tồn tại") {
         res.status(404).json({ status: "error", message: msg });
         return;
      }
      next(error);
   }
};
