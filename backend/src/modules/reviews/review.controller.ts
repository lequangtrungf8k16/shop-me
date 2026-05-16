import type { Response, NextFunction } from "express";
import type { Request } from "express";
import * as reviewService from "./review.service";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { ApiResponse } from "../../shared/types/index";

export const upsertReviewController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const review = await reviewService.upsertReview(userId, req.body);
      const response: ApiResponse = {
         status: "success",
         message: "Đánh giá đã được lưu",
         data: review,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

export const getProductReviewsController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const productId = Number(req.params["productId"]);
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 10;

      if (isNaN(productId)) {
         res.status(400).json({
            status: "error",
            message: "productId không hợp lệ",
         });
         return;
      }

      const data = await reviewService.getProductReviews(
         productId,
         page,
         limit,
      );
      const response: ApiResponse = {
         status: "success",
         message: "Lấy đánh giá thành công",
         data,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};
