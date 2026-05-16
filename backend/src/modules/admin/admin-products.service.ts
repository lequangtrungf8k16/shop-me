import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { createSlug } from "../../shared/utils/slug";

export interface AdminProductInput {
   name: string;
   description?: string;
   price: number;
   priceDiscount?: number | null;
   stock: number;
   thumbnail?: string;
   categoryId: number;
}

// Lấy danh sách sản phẩm (bao gồm đã ẩn, không bao gồm đã xóa mềm)
export const adminGetProducts = async (
   page = 1,
   limit = 15,
   search = "",
   categoryId?: number,
) => {
   const skip = (page - 1) * limit;

   const where = {
      deletedAt: null,
      ...(search ? { name: { contains: search } } : {}),
      ...(categoryId ? { categoryId } : {}),
   };

   const [products, total] = await Promise.all([
      prisma.product.findMany({
         where,
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         include: {
            category: { select: { id: true, name: true } },
            _count: { select: { reviews: true, orderItems: true } },
         },
      }),
      prisma.product.count({ where }),
   ]);

   return {
      products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
   };
};

// Tạo sản phẩm
export const adminCreateProduct = async (data: AdminProductInput) => {
   const slug = createSlug(data.name);

   const existing = await prisma.product.findFirst({
      where: { OR: [{ name: data.name }, { slug }], deletedAt: null },
   });
   if (existing) throw new AppError("Tên sản phẩm đã tồn tại", 409);

   return prisma.product.create({
      data: {
         name: data.name,
         slug,
         description: data.description ?? null,
         price: data.price,
         priceDiscount: data.priceDiscount ?? null,
         stock: data.stock,
         thumbnail: data.thumbnail ?? null,
         categoryId: data.categoryId,
      },
      include: { category: { select: { name: true } } },
   });
};

// Cập nhật sản phẩm
export const adminUpdateProduct = async (
   id: number,
   data: Partial<AdminProductInput>,
) => {
   const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
   });
   if (!product) throw new AppError("Sản phẩm không tồn tại", 404);

   const updateData: Record<string, unknown> = {};
   if (data.name !== undefined) {
      updateData["name"] = data.name;
      updateData["slug"] = createSlug(data.name);
   }
   if (data.description !== undefined)
      updateData["description"] = data.description;
   if (data.price !== undefined) updateData["price"] = data.price;
   if (data.priceDiscount !== undefined)
      updateData["priceDiscount"] = data.priceDiscount;
   if (data.stock !== undefined) updateData["stock"] = data.stock;
   if (data.thumbnail !== undefined) updateData["thumbnail"] = data.thumbnail;
   if (data.categoryId !== undefined)
      updateData["categoryId"] = data.categoryId;

   return prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: { select: { name: true } } },
   });
};

// Xóa mềm sản phẩm
export const adminSoftDeleteProduct = async (id: number) => {
   const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
   });
   if (!product) throw new AppError("Sản phẩm không tồn tại", 404);

   return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
   });
};
