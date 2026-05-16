import { Router } from "express";
import * as authController from "./auth.controller";
import * as oauthController from "./oauth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authMiddleware, authController.logout);

// Google OAuth
router.get("/google", oauthController.googleRedirect);
router.get("/google/callback", oauthController.googleCallback);

export default router;
