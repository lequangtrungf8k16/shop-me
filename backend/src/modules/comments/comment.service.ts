import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { createNotification } from "../notifications/notification.service";
import type { CreateCommentInput } from "./comment.schema";

const COMMENT_SELECT = {
   id: true,
   content: true,
   isDeleted: true,
   parentId: true,
   createdAt: true,
   updatedAt: true,
   user: { select: { id: true, fullName: true } },
   reactions: { select: { type: true, userId: true } },
} as const;

export const createComment = async (
   userId: number,
   data: CreateCommentInput,
) => {
   let parentAuthorId: number | null = null;

   if (data.parentId) {
      const parent = await prisma.comment.findUnique({
         where: { id: data.parentId },
         select: { id: true, isDeleted: true, userId: true },
      });
      if (!parent || parent.isDeleted) {
         throw new AppError("Bình luận gốc không tồn tại hoặc đã bị xóa", 404);
      }
      // Ghi nhớ chủ bình luận gốc để notify sau
      parentAuthorId = parent.userId;
   }

   const comment = await prisma.comment.create({
      data: {
         content: data.content,
         userId,
         parentId: data.parentId ?? null,
         productId: data.productId ?? null,
         articleId: data.articleId ?? null,
      },
      select: {
         ...COMMENT_SELECT,
         replies: { select: COMMENT_SELECT },
      },
   });

   // Notify chủ bình luận gốc khi có người reply (không tự notify chính mình)
   if (parentAuthorId && parentAuthorId !== userId) {
      const replier = await prisma.user.findUnique({
         where: { id: userId },
         select: { fullName: true, role: true },
      });

      await createNotification({
         userId: parentAuthorId,
         type: "COMMENT_REPLY",
         title: "Có phản hồi bình luận",
         message: `${replier?.fullName ?? "Ai đó"} đã trả lời bình luận của bạn`,
         metadata: {
            commentId: comment.id,
            parentId: data.parentId,
            productId: data.productId,
            articleId: data.articleId,
            replierRole: replier?.role,
         },
      });
   }

   return comment;
};

export const getComments = async (
   target: { productId?: number; articleId?: number },
   page = 1,
   limit = 20,
) => {
   const where = {
      ...(target.productId ? { productId: target.productId } : {}),
      ...(target.articleId ? { articleId: target.articleId } : {}),
      parentId: null,
   };

   const skip = (page - 1) * limit;

   const [comments, total] = await Promise.all([
      prisma.comment.findMany({
         where,
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         select: {
            ...COMMENT_SELECT,
            replies: {
               where: { isDeleted: false },
               orderBy: { createdAt: "asc" },
               select: {
                  ...COMMENT_SELECT,
                  replies: {
                     where: { isDeleted: false },
                     orderBy: { createdAt: "asc" },
                     select: COMMENT_SELECT,
                  },
               },
            },
         },
      }),
      prisma.comment.count({ where }),
   ]);

   return {
      comments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
   };
};

export const deleteComment = async (
   commentId: number,
   userId: number,
   isAdmin: boolean,
) => {
   const comment = await prisma.comment.findUnique({
      where: { id: commentId },
   });
   if (!comment) throw new AppError("Bình luận không tồn tại", 404);

   if (comment.userId !== userId && !isAdmin) {
      throw new AppError("Bạn không có quyền xóa bình luận này", 403);
   }

   await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true, content: "[Bình luận đã bị xóa]" },
   });
};
