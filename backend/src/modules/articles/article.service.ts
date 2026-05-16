import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { createSlug } from "../../shared/utils/slug";
import type { CreateArticleInput } from "./article.schema";

export const getPublishedArticles = async (page = 1, limit = 9, search = "") => {
  const skip = (page - 1) * limit;
  const where = {
    published: true,
    deletedAt: null,
    ...(search ? { OR: [{ title: { contains: search } }, { excerpt: { contains: search } }] } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true, thumbnail: true,
        views: true, createdAt: true,
        author: { select: { id: true, fullName: true } },
        _count: {
          select: {
            comments: { where: { isDeleted: false } },
            reactions: { where: { type: "LIKE" } },
          },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getArticleBySlug = async (slug: string) => {
  const article = await prisma.article.findFirst({
    where: { slug, published: true, deletedAt: null },
    include: {
      author: { select: { id: true, fullName: true } },
      _count: {
        select: {
          comments: { where: { isDeleted: false } },
          reactions: true,
        },
      },
    },
  });

  if (!article) throw new AppError("Bài viết không tồn tại", 404);

  void prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  return article;
};

export const getRelatedArticles = async (currentId: number, limit = 4) => {
  return prisma.article.findMany({
    where: { published: true, deletedAt: null, id: { not: currentId } },
    take: limit,
    orderBy: { views: "desc" },
    select: {
      id: true, title: true, slug: true, thumbnail: true,
      views: true, createdAt: true,
      author: { select: { fullName: true } },
    },
  });
};

export const createArticle = async (authorId: number, data: CreateArticleInput) => {
  const slug = createSlug(data.title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) throw new AppError("Slug bài viết đã tồn tại", 409);
  return prisma.article.create({
    data: { title: data.title, slug, excerpt: data.excerpt ?? null, content: data.content, thumbnail: data.thumbnail ?? null, published: data.published ?? false, authorId },
    include: { author: { select: { id: true, fullName: true } } },
  });
};

export const updateArticle = async (id: number, data: Partial<CreateArticleInput>) => {
  const article = await prisma.article.findUnique({ where: { id, deletedAt: null } });
  if (!article) throw new AppError("Bài viết không tồn tại", 404);
  return prisma.article.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.content && { content: data.content }),
      ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
      ...(data.published !== undefined && { published: data.published }),
    },
  });
};

export const deleteArticle = async (id: number) => {
  const article = await prisma.article.findUnique({ where: { id, deletedAt: null } });
  if (!article) throw new AppError("Bài viết không tồn tại", 404);
  // Soft delete
  await prisma.article.update({ where: { id }, data: { deletedAt: new Date(), published: false } });
};
