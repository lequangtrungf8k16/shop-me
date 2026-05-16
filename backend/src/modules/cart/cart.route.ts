import { Router } from "express";
import * as cartController from "./cart.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { addToCartSchema, updateCartItemSchema } from "./cart.schema.js";

const router = Router();

router.use(authMiddleware);

// GET  /api/cart          — Lấy giỏ hàng
router.get("/", cartController.getCartController);

// POST /api/cart          — Thêm sản phẩm
router.post("/", validate(addToCartSchema), cartController.addToCartController);

// PUT  /api/cart/:productId — Cập nhật số lượng
router.put(
   "/:productId",
   validate(updateCartItemSchema),
   cartController.updateCartItemController,
);

// DELETE /api/cart/clear  — Xóa toàn bộ (đặt TRƯỚC /:productId để tránh conflict)
router.delete("/clear", cartController.clearCartController);

// DELETE /api/cart/:productId — Xóa 1 sản phẩm
router.delete("/:productId", cartController.removeFromCartController);

export default router;
