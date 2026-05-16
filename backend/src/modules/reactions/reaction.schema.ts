import { z } from "zod";

export const toggleReactionSchema = z.object({
   body: z
      .object({
         type: z.enum(["LIKE", "DISLIKE"], {
            error: "type phải là LIKE hoặc DISLIKE",
         }),
         // Chỉ 1 trong 3 được truyền vào
         productId: z.number().int().positive().optional(),
         articleId: z.number().int().positive().optional(),
         commentId: z.number().int().positive().optional(),
      })
      .refine(
         (d) =>
            [d.productId, d.articleId, d.commentId].filter(Boolean).length ===
            1,
         {
            message:
               "Phải truyền đúng 1 trong 3: productId, articleId, commentId",
         },
      ),
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>["body"];
