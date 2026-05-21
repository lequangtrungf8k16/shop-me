import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import type { CreateReviewInput } from "./review.schema";
import { notifyAdmins } from "../notifications/notification.service";

// Tạo hoặc cập nhật review (upsert — đã review thì update lại)
export const upsertReview = async (userId: number, data: CreateReviewInput) => {
   const product = await prisma.product.findUnique({
      where: { id: data.productId },
   });
   if (!product) throw new AppError("Sản phẩm không tồn tại", 404);

   const review = await prisma.review.upsert({
      where: {
         userId_productId: { userId, productId: data.productId },
      },
      create: {
         userId,
         productId: data.productId,
         rating: data.rating,
         content: data.content ?? null,
      },
      update: {
         rating: data.rating,
         content: data.content ?? null,
      },
      include: {
         user: { select: { id: true, fullName: true } },
      },
   });

   // Notify admins about the new review
   notifyAdmins({
      type: "NEW_REVIEW",
      title: "Đánh giá mới",
      message: `Sản phẩm "${product.name}" vừa nhận được đánh giá ${data.rating} sao từ ${review.user.fullName}.`,
      metadata: { productId: data.productId, reviewId: review.id },
   });

   return review;
};

// Lấy danh sách review kèm thống kê rating của 1 sản phẩm
export const getProductReviews = async (
   productId: number,
   page = 1,
   limit = 10,
) => {
   const skip = (page - 1) * limit;

   const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
         where: { productId },
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         include: {
            user: { select: { id: true, fullName: true } },
         },
      }),
      prisma.review.count({ where: { productId } }),
      // Tổng hợp điểm trung bình và phân bổ từng sao
      prisma.review.groupBy({
         by: ["rating"],
         where: { productId },
         _count: { id: true },
      }),
   ]);

   // Tính điểm trung bình
   const totalRating = stats.reduce(
      (sum, s) => sum + s.rating * s._count.id,
      0,
   );
   const averageRating = total > 0 ? (totalRating / total).toFixed(1) : "0.0";

   // Phân bổ sao (1 → 5)
   const distribution = [5, 4, 3, 2, 1].map((star) => {
      const found = stats.find((s) => s.rating === star);
      return {
         star,
         count: found?._count.id ?? 0,
         percent:
            total > 0 ? Math.round(((found?._count.id ?? 0) / total) * 100) : 0,
      };
   });

   return {
      reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: { averageRating, totalReviews: total, distribution },
   };
};
