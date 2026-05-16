import { z } from "zod";

export const createCommentSchema = z.object({
   body: z
      .object({
         content: z
            .string({ error: "Nội dung là bắt buộc" })
            .min(1, "Bình luận không được để trống")
            .max(2000, "Tối đa 2000 ký tự"),
         parentId: z.number().int().positive().optional(),
         productId: z.number().int().positive().optional(),
         articleId: z.number().int().positive().optional(),
      })
      .refine((d) => d.productId || d.articleId, {
         message: "Phải truyền productId hoặc articleId",
      }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
