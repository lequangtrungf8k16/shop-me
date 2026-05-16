import type { Response, NextFunction } from "express";
import * as reactionService from "./reaction.service";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { ApiResponse } from "../../shared/types/index";

export const toggleReactionController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const result = await reactionService.toggleReaction(userId, req.body);
      const response: ApiResponse = {
         status: "success",
         message: "Cập nhật reaction thành công",
         data: result,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};
