import { z } from "zod";

export const createReviewSchema = z.object({
   body: z.object({
      productId: z.number({ error: "productId là bắt buộc" }).int().positive(),
      rating: z
         .number({ error: "rating là bắt buộc" })
         .int()
         .min(1, "Tối thiểu 1 sao")
         .max(5, "Tối đa 5 sao"),
      content: z.string().max(2000).optional(),
   }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];
