import { Router } from "express";
import * as commentController from "./comment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createCommentSchema } from "./comment.schema";

const router = Router();

// Lấy danh sách bình luận (public)
router.get("/", commentController.getCommentsController);

// Tạo bình luận (phải đăng nhập)
router.post(
   "/",
   authMiddleware,
   validate(createCommentSchema),
   commentController.createCommentController,
);

// Xóa bình luận (phải đăng nhập + là chủ hoặc admin)
router.delete(
   "/:id",
   authMiddleware,
   commentController.deleteCommentController,
);

export default router;
