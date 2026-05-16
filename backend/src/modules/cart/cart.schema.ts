import { z } from "zod";

// Schema thêm / cập nhật sản phẩm trong giỏ
export const addToCartSchema = z.object({
   body: z.object({
      productId: z
         .number({ error: "productId phải là số nguyên" })
         .int()
         .positive("productId phải lớn hơn 0"),
      quantity: z
         .number({ error: "quantity phải là số nguyên" })
         .int()
         .min(1, "Số lượng tối thiểu là 1")
         .max(100, "Số lượng tối đa là 100"),
   }),
});

// Schema cập nhật số lượng (PUT)
export const updateCartItemSchema = z.object({
   params: z.object({
      productId: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
         message: "productId không hợp lệ",
      }),
   }),
   body: z.object({
      quantity: z
         .number({ error: "quantity phải là số nguyên" })
         .int()
         .min(1, "Số lượng tối thiểu là 1")
         .max(100, "Số lượng tối đa là 100"),
   }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>["body"];
