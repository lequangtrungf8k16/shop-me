import z from "zod";

// SCHEMA VALIDATION CHO API TẠO MỚI SẢN PHẨM
export const createProductSchema = z.object({
   body: z
      .object({
         name: z
            .string({ error: "Tên sản phẩm là bắt buộc" })
            .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự")
            .max(250, "Tên sản phẩm không được vượt quá 250 ký tự"),
         description: z.string().optional(),

         // Giá sản phẩm
         price: z
            .number({ error: "Giá sản phẩm là bắt buộc" })
            .positive("Giá sản phẩm phải lớn hơn 0"),

         // Giá khuyến mãi
         priceDiscount: z
            .number({ error: "Giá sản phẩm phải là số" })
            .nonnegative("Giá sản phẩm không được là số âm")
            .optional(),

         // Tồn kho
         stock: z
            .number({ error: "Số lượng tồn kho phải là 1 số" })
            .int("Số lượng tồn kho phải là số nguyên")
            .nonnegative("Số lượng tồn kho không được là số âm")
            .default(0),

         // Liên kết danh mục
         categoryId: z
            .number({ error: "Id danh mục là bắt buộc" })
            .int("Id danh mục phải là số nguyên")
            .positive("Id danh mục phải lơn hơn 0"),
      })
      .strict(),
});

// SCHEMA VALIDATION CHO API CẬP NHẬT SẢN PHẨM
export const updateProductSchema = z.object({
   params: z.object({
      id: z
         .string({ error: "Id sản phẩm là bắt buộc" })
         .regex(/^\d+$/, "Id sản phẩm phải là một số nguyên hợp lệ"),
   }),
   body: z
      .object({
         name: z
            .string({ error: "Tên sản phẩm là bắt buộc" })
            .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự")
            .max(250, "Tên sản phẩm không được vượt quá 250 ký tự"),
         description: z.string().optional(),

         // Giá sản phẩm
         price: z
            .number({ error: "Giá sản phẩm là bắt buộc" })
            .positive("Giá sản phẩm phải lớn hơn 0"),

         // Giá khuyến mãi
         priceDiscount: z
            .number({ error: "Giá sản phẩm phải là số" })
            .nonnegative("Giá sản phẩm không được là số âm")
            .optional(),

         // Tồn kho
         stock: z
            .number({ error: "Số lượng tồn kho phải là 1 số" })
            .int("Số lượng tồn kho phải là số nguyên")
            .nonnegative("Số lượng tồn kho không được là số âm")
            .default(0),

         // Liên kết danh mục
         categoryId: z
            .number({ error: "Id danh mục là bắt buộc" })
            .int("Id danh mục phải là số nguyên")
            .positive("Id danh mục phải lơn hơn 0"),
      })
      .strict(),
});

// EXPORT TYPES/INTERFACES TỰ ĐỘNG

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type ProductParams = z.infer<typeof updateProductSchema>["params"];
