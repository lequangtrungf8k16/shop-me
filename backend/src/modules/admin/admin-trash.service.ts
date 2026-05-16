import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";

// Lấy tất cả items đã xóa mềm
export const getTrashItems = async () => {
   const [products, articles] = await Promise.all([
      prisma.product.findMany({
         where: { deletedAt: { not: null } },
         select: {
            id: true,
            name: true,
            thumbnail: true,
            price: true,
            deletedAt: true,
            category: { select: { name: true } },
         },
         orderBy: { deletedAt: "desc" },
      }),
      prisma.article.findMany({
         where: { deletedAt: { not: null } },
         select: {
            id: true,
            title: true,
            thumbnail: true,
            deletedAt: true,
            author: { select: { fullName: true } },
         },
         orderBy: { deletedAt: "desc" },
      }),
   ]);

   return { products, articles };
};

// Khôi phục sản phẩm
export const restoreProduct = async (id: number) => {
   const product = await prisma.product.findUnique({
      where: { id, deletedAt: { not: null } },
   });
   if (!product)
      throw new AppError("Sản phẩm không tồn tại trong thùng rác", 404);

   return prisma.product.update({
      where: { id },
      data: { deletedAt: null },
   });
};

// Xóa hẳn sản phẩm
export const permanentDeleteProduct = async (id: number) => {
   const product = await prisma.product.findUnique({
      where: { id, deletedAt: { not: null } },
   });
   if (!product)
      throw new AppError("Sản phẩm không tồn tại trong thùng rác", 404);

   await prisma.product.delete({ where: { id } });
};

// Khôi phục bài viết
export const restoreArticle = async (id: number) => {
   const article = await prisma.article.findUnique({
      where: { id, deletedAt: { not: null } },
   });
   if (!article)
      throw new AppError("Bài viết không tồn tại trong thùng rác", 404);

   return prisma.article.update({
      where: { id },
      data: { deletedAt: null },
   });
};

// Xóa hẳn bài viết
export const permanentDeleteArticle = async (id: number) => {
   const article = await prisma.article.findUnique({
      where: { id, deletedAt: { not: null } },
   });
   if (!article)
      throw new AppError("Bài viết không tồn tại trong thùng rác", 404);

   await prisma.article.delete({ where: { id } });
};
