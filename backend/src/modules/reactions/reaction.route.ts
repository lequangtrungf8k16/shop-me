import { Router } from "express";
import * as reactionController from "./reaction.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { toggleReactionSchema } from "./reaction.schema";

const router = Router();

router.post(
   "/toggle",
   authMiddleware,
   validate(toggleReactionSchema),
   reactionController.toggleReactionController,
);

export default router;
