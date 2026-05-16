import { z } from "zod";

export const checkoutSchema = z.object({
   body: z
      .object({
         customerName: z
            .string({ error: "Tên người nhận là bắt buộc" })
            .min(2, "Tên người nhận phải có ít nhất 2 ký tự"),

         customerPhone: z
            .string({ error: "Số điện thoại là bắt buộc" })
            .regex(
               /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
               "Số điện thoại không hợp lệ",
            ),

         shippingAddress: z
            .string({ error: "Địa chỉ là bắt buộc" })
            .min(10, "Địa chỉ giao hàng quá ngắn, vui lòng ghi rõ"),

         paymentMethod: z.string().default("COD"),

         // Client sẽ gửi lên một mảng các sản phẩm trong giỏ hàng
         items: z
            .array(
               z.object({
                  productId: z.number().int().positive(),
                  quantity: z
                     .number()
                     .int()
                     .positive("Số lượng phải lớn hơn 0"),
               }),
            )
            .min(1, "Giỏ hàng không được để trống"),
      })
      .strict(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>["body"];
