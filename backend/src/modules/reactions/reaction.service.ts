import { prisma } from "../../config/prisma";
import type { ToggleReactionInput } from "./reaction.schema";

// Toggle reaction: LIKE → xóa (nếu đã LIKE), LIKE → đổi sang DISLIKE (nếu đang DISLIKE)
export const toggleReaction = async (
   userId: number,
   data: ToggleReactionInput,
) => {
   // Xác định target key
   const targetKey = data.productId
      ? { userId, productId: data.productId }
      : data.articleId
        ? { userId, articleId: data.articleId }
        : { userId, commentId: data.commentId };

   // Tìm reaction hiện tại của user với target này
   const existing = await prisma.reaction.findFirst({ where: targetKey });

   if (existing) {
      if (existing.type === data.type) {
         // Cùng loại → xóa (toggle off)
         await prisma.reaction.delete({ where: { id: existing.id } });
         return { action: "removed", type: null };
      } else {
         // Khác loại → cập nhật sang loại mới
         const updated = await prisma.reaction.update({
            where: { id: existing.id },
            data: { type: data.type },
         });
         return { action: "updated", type: updated.type };
      }
   }

   // Chưa có → tạo mới
   const created = await prisma.reaction.create({
      data: {
         type: data.type,
         userId,
         productId: data.productId ?? null,
         articleId: data.articleId ?? null,
         commentId: data.commentId ?? null,
      },
   });

   return { action: "created", type: created.type };
};

// Lấy tổng count like/dislike và reaction hiện tại của user
export const getReactionSummary = async (
   target: { productId?: number; articleId?: number; commentId?: number },
   userId?: number,
) => {
   const where = target.productId
      ? { productId: target.productId }
      : target.articleId
        ? { articleId: target.articleId }
        : { commentId: target.commentId };

   const [likes, dislikes, userReaction] = await Promise.all([
      prisma.reaction.count({ where: { ...where, type: "LIKE" } }),
      prisma.reaction.count({ where: { ...where, type: "DISLIKE" } }),
      userId
         ? prisma.reaction.findFirst({
              where: { ...where, userId },
              select: { type: true },
           })
         : null,
   ]);

   return {
      likes,
      dislikes,
      userReaction: userReaction?.type ?? null,
   };
};
