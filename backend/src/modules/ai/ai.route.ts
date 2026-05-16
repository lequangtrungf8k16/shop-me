import { Router } from "express";
import {
   chatController,
   generateArticleController,
   getDraftsController,
   publishArticleController,
} from "./ai.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const router = Router();

// ─── AI Chat (Public — không cần đăng nhập) ──────────────────────────────
// POST /api/ai/chat
router.post("/chat", chatController);

// ─── AI Articles (Admin only) ─────────────────────────────────────────────
// POST /api/ai/articles/generate
router.post(
   "/articles/generate",
   authMiddleware,
   adminMiddleware,
   generateArticleController,
);

// GET /api/ai/articles/drafts
router.get(
   "/articles/drafts",
   authMiddleware,
   adminMiddleware,
   getDraftsController,
);

// PATCH /api/ai/articles/:id/publish
router.patch(
   "/articles/:id/publish",
   authMiddleware,
   adminMiddleware,
   publishArticleController,
);

export default router;
