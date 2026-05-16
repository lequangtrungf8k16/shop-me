import { Router } from "express";
import * as reviewController from "./review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createReviewSchema } from "./review.schema";

const router = Router();

// Lấy reviews của 1 sản phẩm (public)
router.get("/product/:productId", reviewController.getProductReviewsController);

// Tạo / cập nhật review (phải đăng nhập)
router.post(
   "/",
   authMiddleware,
   validate(createReviewSchema),
   reviewController.upsertReviewController,
);

export default router;
