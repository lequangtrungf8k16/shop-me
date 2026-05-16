import { z } from "zod";

// Schema validate khi user cập nhật profile
export const updateProfileSchema = z.object({
   body: z
      .object({
         fullName: z
            .string({ error: "Họ tên là bắt buộc" })
            .min(2, "Họ tên phải có ít nhất 2 ký tự")
            .optional(),
         phone: z
            .string()
            .regex(
               /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
               "Số điện thoại không hợp lệ",
            )
            .optional(),
         address: z.string().max(255).optional(),
      })
      .strict(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
