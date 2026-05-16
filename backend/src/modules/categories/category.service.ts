import { prisma } from "../../config/prisma";
import { createSlug } from "../../shared/utils/slug";
import { AppError } from "../../shared/errors/AppError";
import type { CreateCategoryInput } from "./category.schema";

export const createCategory = async (data: CreateCategoryInput) => {
   const slug = createSlug(data.name);

   const existingCategory = await prisma.category.findFirst({
      where: {
         OR: [{ name: data.name }, { slug }],
      },
   });

   if (existingCategory) {
      throw new AppError("Tên danh mục hoặc slug đã tồn tại", 409);
   }

   const newCategory = await prisma.category.create({
      data: {
         name: data.name,
         description: data.description ?? null,
         slug,
         parentId: data.parentId ?? null,
         isActive: data.isActive ?? true,
      },
   });

   return newCategory;
};

export const getAllCategories = async () => {
   const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
         id: true,
         name: true,
         slug: true,
         description: true,
         parentId: true,
         isActive: true,
         createdAt: true,
      },
   });

   return categories;
};
