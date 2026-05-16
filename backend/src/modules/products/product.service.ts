import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { createSlug } from "../../shared/utils/slug";
import type { CreateProductInput } from "./product.schema";

type SortField = "createdAt" | "price" | "name" | "stock";
type SortOrder = "asc" | "desc";

export const getAllProducts = async (
  page = 1,
  limit = 12,
  options: {
    search?: string;
    categoryId?: number;
    categorySlug?: string;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    minPrice?: number;
    maxPrice?: number;
  } = {},
) => {
  const skip = (page - 1) * limit;
  const {
    search, categoryId, categorySlug,
    sortBy = "createdAt", sortOrder = "desc",
    minPrice, maxPrice,
  } = options;

  // Resolve categorySlug → categoryId nếu cần
  let resolvedCategoryId = categoryId;
  if (categorySlug && !resolvedCategoryId) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    resolvedCategoryId = cat?.id;
  }

  const where = {
    deletedAt: null,
    ...(search ? { name: { contains: search } } : {}),
    ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip, take: limit, where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug, deletedAt: null },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!product) throw new AppError("Sản phẩm không tồn tại", 404);
  return product;
};

export const createProduct = async (data: CreateProductInput) => {
  const slug = createSlug(data.name);
  const existing = await prisma.product.findFirst({
    where: { OR: [{ name: data.name }, { slug }], deletedAt: null },
  });
  if (existing) throw new AppError("Tên sản phẩm đã tồn tại", 409);

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new AppError("Danh mục không tồn tại", 404);

  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      slug,
      price: data.price,
      priceDiscount: data.priceDiscount ?? null,
      stock: data.stock ?? 0,
      categoryId: data.categoryId,
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
};

export const getRelatedProducts = async (productId: number, categoryId: number, limit = 4) => {
  return prisma.product.findMany({
    where: { categoryId, id: { not: productId }, deletedAt: null, stock: { gt: 0 } },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });
};
