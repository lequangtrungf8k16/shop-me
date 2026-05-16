import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const adminGetReviews = async (page = 1, limit = 20) => {
   const skip = (page - 1) * limit;

   const [reviews, total] = await Promise.all([
      prisma.review.findMany({
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         include: {
            user: { select: { id: true, fullName: true, email: true } },
            product: { select: { id: true, name: true, slug: true } },
         },
      }),
      prisma.review.count(),
   ]);

   return {
      reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
   };
};

export const adminDeleteReview = async (id: number) => {
   const review = await prisma.review.findUnique({ where: { id } });
   if (!review) throw new AppError("Đánh giá không tồn tại", 404);
   await prisma.review.delete({ where: { id } });
};

// ─── Comments ────────────────────────────────────────────────────────────────

export const adminGetComments = async (page = 1, limit = 20) => {
   const skip = (page - 1) * limit;

   const [comments, total] = await Promise.all([
      prisma.comment.findMany({
         where: { isDeleted: false },
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         include: {
            user: { select: { id: true, fullName: true } },
            product: { select: { id: true, name: true, slug: true } },
            article: { select: { id: true, title: true, slug: true } },
            parent: { select: { id: true, content: true } },
         },
      }),
      prisma.comment.count({ where: { isDeleted: false } }),
   ]);

   return {
      comments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
   };
};

export const adminDeleteComment = async (id: number) => {
   const comment = await prisma.comment.findUnique({ where: { id } });
   if (!comment) throw new AppError("Bình luận không tồn tại", 404);

   await prisma.comment.update({
      where: { id },
      data: { isDeleted: true, content: "[Bình luận đã bị xóa bởi Admin]" },
   });
};
