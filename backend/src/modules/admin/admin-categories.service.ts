import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { createSlug } from "../../shared/utils/slug";

export interface AdminCategoryInput {
   name: string;
   description?: string;
   parentId?: number | null;
   isActive?: boolean;
}

export const adminGetCategories = async () => {
   const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
         id: true,
         name: true,
         slug: true,
         description: true,
         parentId: true,
         isActive: true,
         createdAt: true,
         _count: { select: { products: true } },
      },
   });
   return categories;
};

export const adminCreateCategory = async (data: AdminCategoryInput) => {
   const slug = createSlug(data.name);
   const existing = await prisma.category.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
   });
   if (existing) throw new AppError("Tên danh mục đã tồn tại", 409);

   return prisma.category.create({
      data: {
         name: data.name,
         slug,
         description: data.description ?? null,
         parentId: data.parentId ?? null,
         isActive: data.isActive ?? true,
      },
   });
};

export const adminUpdateCategory = async (
   id: number,
   data: Partial<AdminCategoryInput>,
) => {
   const category = await prisma.category.findUnique({ where: { id } });
   if (!category) throw new AppError("Danh mục không tồn tại", 404);

   const updateData: Record<string, unknown> = {};
   if (data.name !== undefined) {
      updateData["name"] = data.name;
      updateData["slug"] = createSlug(data.name);
   }
   if (data.description !== undefined)
      updateData["description"] = data.description;
   if (data.isActive !== undefined) updateData["isActive"] = data.isActive;
   if (data.parentId !== undefined) updateData["parentId"] = data.parentId;

   return prisma.category.update({ where: { id }, data: updateData });
};

export const adminDeleteCategory = async (id: number) => {
   const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
   });
   if (!category) throw new AppError("Danh mục không tồn tại", 404);
   if (category._count.products > 0) {
      throw new AppError(
         `Không thể xóa: danh mục đang có ${category._count.products} sản phẩm`,
         400,
      );
   }
   await prisma.category.delete({ where: { id } });
};
