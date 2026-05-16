import type { Response, NextFunction } from "express";
import type { Request } from "express";
import * as commentService from "./comment.service";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { ApiResponse } from "../../shared/types/index";

export const createCommentController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const comment = await commentService.createComment(userId, req.body);
      const response: ApiResponse = {
         status: "success",
         message: "Bình luận thành công",
         data: comment,
      };
      res.status(201).json(response);
   } catch (error) {
      next(error);
   }
};

export const getCommentsController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const productId = req.query["productId"]
         ? Number(req.query["productId"])
         : undefined;
      const articleId = req.query["articleId"]
         ? Number(req.query["articleId"])
         : undefined;
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 20;

      if (!productId && !articleId) {
         res.status(400).json({
            status: "error",
            message: "Phải truyền productId hoặc articleId",
         });
         return;
      }

      const data = await commentService.getComments(
         { productId, articleId },
         page,
         limit,
      );
      const response: ApiResponse = {
         status: "success",
         message: "Lấy bình luận thành công",
         data,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};

export const deleteCommentController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id as number;
      const isAdmin = req.user?.role === "ADMIN";
      const commentId = Number(req.params["id"]);

      await commentService.deleteComment(commentId, userId, isAdmin);
      const response: ApiResponse = {
         status: "success",
         message: "Đã xóa bình luận",
         data: null,
      };
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};
