import { z } from "zod";

export const createArticleSchema = z.object({
   body: z.object({
      title: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự").max(255),
      excerpt: z.string().max(500).optional(),
      content: z.string().min(20, "Nội dung tối thiểu 20 ký tự"),
      thumbnail: z.string().url("URL thumbnail không hợp lệ").optional(),
      published: z.boolean().optional(),
   }),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>["body"];
