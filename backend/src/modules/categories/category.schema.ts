import z from "zod";

// SCHEMA VALIDATION CHO API TẠO MỚI CATEGORY
export const createCategorySchema = z.object({
   body: z
      .object({
         name: z
            .string({ error: "Tên danh mục là bắt buộc" })
            .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
            .max(250, "Tên danh mục không được vượt quá 250 ký tự"),

         description: z.string().optional(),

         parentId: z
            .number()
            .int("parentId phải là số nguyên")
            .positive("parentId phải là số dương")
            .optional(),

         isActive: z.boolean().optional(),
      })
      .strict(),
});

// SCHEMA VALIDATION CHO API CẬP NHẬT CATEGORY
export const updateCategorySchema = z.object({
   params: z.object({
      id: z
         .string({ error: "ID danh mục là bắt buộc" })
         .regex(/^\d+$/, "ID danh mục phải là số nguyên hợp lệ"),
   }),
   body: z
      .object({
         name: z
            .string()
            .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
            .max(250, "Tên danh mục không được vượt quá 250 ký tự")
            .optional(),

         description: z.string().optional(),

         parentId: z
            .number()
            .int("parentId phải là số nguyên")
            .positive("parentId phải là số dương")
            .optional(),

         isActive: z.boolean().optional(),
      })
      .strict(),
});

// EXPORT TYPES/INTERFACES
export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
export type CategoryParams = z.infer<typeof updateCategorySchema>["params"];
