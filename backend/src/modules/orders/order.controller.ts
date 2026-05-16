import type { Request, Response, NextFunction } from "express";
import * as orderService from "./order.service";
import type { ApiResponse } from "../../shared/types/index";

export const createOrderController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const newOrder = await orderService.createOrder(req.body);
      const response: ApiResponse = {
         status: "success",
         message: "Đặt hàng thành công",
         data: newOrder,
      };
      res.status(201).json(response);
   } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("không tồn tại") || msg.includes("chỉ còn")) {
         res.status(400).json({ status: "error", message: msg });
         return;
      }
      next(error);
   }
};

export const getOrderController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const id = Number(req.params["id"]);
      if (isNaN(id)) {
         res.status(400).json({
            status: "error",
            message: "ID đơn hàng không hợp lệ",
         });
         return;
      }

      const order = await orderService.getOrderById(id);
      const response: ApiResponse = {
         status: "success",
         message: "Lấy thông tin đơn hàng thành công",
         data: order,
      };
      res.status(200).json(response);
   } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (msg === "Đơn hàng không tồn tại") {
         res.status(404).json({ status: "error", message: msg });
         return;
      }
      next(error);
   }
};
