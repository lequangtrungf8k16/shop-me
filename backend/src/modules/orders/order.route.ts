import { Router } from "express";
import * as orderController from "./order.controller";
import { validate } from "../../middlewares/validate.middleware";
import { checkoutSchema } from "./order.schema";

const router = Router();

// Tạo đơn hàng mới (Checkout)
router.post(
   "/",
   validate(checkoutSchema),
   orderController.createOrderController,
);

// Lấy chi tiết đơn hàng theo ID
router.get("/:id", orderController.getOrderController);

export default router;
