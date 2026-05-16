import { Router } from "express";
import * as ctrl from "./notification.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);
router.get("/", ctrl.getMyNotifications);
router.get("/unread-count", ctrl.getUnreadCount);
router.patch("/read-all", ctrl.markAsRead);
router.patch("/:id/read", ctrl.markAsRead);
export default router;
