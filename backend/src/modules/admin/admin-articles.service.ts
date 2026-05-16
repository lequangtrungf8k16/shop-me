import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { createSlug } from "../../shared/utils/slug";

export const adminGetArticles = async (
   page = 1,
   limit = 15,
   published?: boolean,
) => {
   const skip = (page - 1) * limit;

   const where = {
      deletedAt: null,
      ...(published !== undefined ? { published } : {}),
   };

   const [articles, total] = await Promise.all([
      prisma.article.findMany({
         where,
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            thumbnail: true,
            published: true,
            views: true,
            createdAt: true,
            author: { select: { id: true, fullName: true } },
            _count: {
               select: {
                  comments: { where: { isDeleted: false } },
                  reactions: true,
               },
            },
         },
      }),
      prisma.article.count({ where }),
   ]);

   return {
      articles,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
   };
};

export const adminTogglePublish = async (id: number) => {
   const article = await prisma.article.findUnique({
      where: { id, deletedAt: null },
   });
   if (!article) throw new AppError("Bài viết không tồn tại", 404);

   return prisma.article.update({
      where: { id },
      data: { published: !article.published },
   });
};

export const adminUpdateArticle = async (
   id: number,
   data: {
      title?: string;
      excerpt?: string;
      content?: string;
      thumbnail?: string;
   },
) => {
   const article = await prisma.article.findUnique({
      where: { id, deletedAt: null },
   });
   if (!article) throw new AppError("Bài viết không tồn tại", 404);

   const updateData: Record<string, unknown> = {};
   if (data.title) {
      updateData["title"] = data.title;
      updateData["slug"] = createSlug(data.title);
   }
   if (data.excerpt !== undefined) updateData["excerpt"] = data.excerpt;
   if (data.content) updateData["content"] = data.content;
   if (data.thumbnail !== undefined) updateData["thumbnail"] = data.thumbnail;

   return prisma.article.update({ where: { id }, data: updateData });
};

export const adminSoftDeleteArticle = async (id: number) => {
   const article = await prisma.article.findUnique({
      where: { id, deletedAt: null },
   });
   if (!article) throw new AppError("Bài viết không tồn tại", 404);

   return prisma.article.update({
      where: { id },
      data: { deletedAt: new Date(), published: false },
   });
};
