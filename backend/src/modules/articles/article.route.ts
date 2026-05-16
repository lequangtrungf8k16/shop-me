import { Router } from "express";
import * as articleController from "./article.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createArticleSchema } from "./article.schema";

const router = Router();

router.get("/", articleController.getArticlesController);
router.get("/:slug/related", articleController.getRelatedArticlesController);
router.get("/:slug", articleController.getArticleBySlugController);

router.post("/", authMiddleware, adminMiddleware, validate(createArticleSchema), articleController.createArticleController);
router.put("/:id", authMiddleware, adminMiddleware, articleController.updateArticleController);
router.delete("/:id", authMiddleware, adminMiddleware, articleController.deleteArticleController);

export default router;
