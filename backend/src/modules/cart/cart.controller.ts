import type { Response, NextFunction } from "express";
import * as cartService from "./cart.service";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { ApiResponse } from "../../shared/types/index";

// GET /api/cart — Lấy giỏ hàng hiện tại
export const getCartController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const items = await cartService.getCart(userId);

      const response: ApiResponse = {
         status: "success",
         message: "Lấy giỏ hàng thành công",
         data: items,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

// POST /api/cart — Thêm sản phẩm vào giỏ
export const addToCartController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const { productId, quantity } = req.body as {
         productId: number;
         quantity: number;
      };

      const items = await cartService.addToCart(userId, productId, quantity);

      const response: ApiResponse = {
         status: "success",
         message: "Đã thêm sản phẩm vào giỏ hàng",
         data: items,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

// PUT /api/cart/:productId — Cập nhật số lượng
export const updateCartItemController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const productId = Number(req.params["productId"]);
      const { quantity } = req.body as { quantity: number };

      if (isNaN(productId)) {
         res.status(400).json({
            status: "error",
            message: "productId không hợp lệ",
         });
         return;
      }

      const items = await cartService.updateCartItem(
         userId,
         productId,
         quantity,
      );

      const response: ApiResponse = {
         status: "success",
         message: "Đã cập nhật số lượng",
         data: items,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

// DELETE /api/cart/:productId — Xóa 1 sản phẩm
export const removeFromCartController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const productId = Number(req.params["productId"]);

      if (isNaN(productId)) {
         res.status(400).json({
            status: "error",
            message: "productId không hợp lệ",
         });
         return;
      }

      const items = await cartService.removeFromCart(userId, productId);

      const response: ApiResponse = {
         status: "success",
         message: "Đã xóa sản phẩm khỏi giỏ hàng",
         data: items,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

// DELETE /api/cart — Xóa toàn bộ giỏ hàng
export const clearCartController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      await cartService.clearCart(userId);

      const response: ApiResponse = {
         status: "success",
         message: "Đã xóa toàn bộ giỏ hàng",
         data: null,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};
