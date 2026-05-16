import { Router } from "express";
import * as userController from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateProfileSchema } from "./user.schema";

const router = Router();

// Tất cả routes trong module này đều yêu cầu đăng nhập
router.use(authMiddleware);

// Lấy profile + lịch sử đơn hàng
router.get("/profile", userController.getProfileController);

// Cập nhật thông tin cá nhân
router.put(
   "/profile",
   validate(updateProfileSchema),
   userController.updateProfileController,
);

export default router;
