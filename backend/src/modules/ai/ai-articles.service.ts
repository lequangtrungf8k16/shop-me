import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { createSlug } from "../../shared/utils/slug";

interface GenerateArticlePayload {
   topic: string;
   keywords?: string;
   targetLength?: "short" | "medium" | "long";
   authorId: number;
}

interface GeneratedArticleData {
   title: string;
   excerpt: string;
   content: string;
   thumbnail: string;
}

const LENGTH_MAP = {
   short: "600-800 từ",
   medium: "1000-1400 từ",
   long: "1800-2200 từ",
};

// Gọi Anthropic API để generate bài viết (non-streaming)
const callAnthropicForArticle = async (
   topic: string,
   keywords: string,
   targetLength: string,
): Promise<GeneratedArticleData> => {
   const apiKey = process.env["ANTHROPIC_API_KEY"];
   if (!apiKey) throw new AppError("ANTHROPIC_API_KEY chưa được cấu hình", 500);

   const prompt = `Hãy viết một bài viết tin tức công nghệ chất lượng cao cho cửa hàng TECHNOLOGY.

Chủ đề: ${topic}
Từ khóa liên quan: ${keywords || "không có"}
Độ dài mục tiêu: ${targetLength}

Yêu cầu bắt buộc — trả về JSON với cấu trúc sau (KHÔNG có markdown code block):
{
  "title": "Tiêu đề hấp dẫn, SEO-friendly, tối đa 90 ký tự",
  "excerpt": "Tóm tắt 2-3 câu, tóm gọn nội dung chính, 120-160 ký tự",
  "thumbnail": "URL ảnh từ https://picsum.photos/seed/RANDOM_WORD/800/450 (thay RANDOM_WORD bằng từ khóa liên quan topic)",
  "content": "Nội dung HTML đầy đủ dùng các thẻ: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>. Không dùng thẻ <html>, <body>, <head>. Viết bằng tiếng Việt, chuyên sâu, có số liệu thực tế, có ví dụ cụ thể."
}

Chỉ trả về JSON thuần, không có text nào khác.`;

   const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "x-api-key": apiKey,
         "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
         model: "claude-sonnet-4-20250514",
         max_tokens: 4096,
         messages: [{ role: "user", content: prompt }],
      }),
   });

   if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic error:", errorText);
      throw new AppError("AI service tạm thời không khả dụng", 503);
   }

   const data = (await response.json()) as {
      content: { type: string; text: string }[];
   };

   const rawText = data.content.find((b) => b.type === "text")?.text ?? "";

   // Strip markdown code blocks nếu AI vẫn wrap
   const cleanJson = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

   try {
      return JSON.parse(cleanJson) as GeneratedArticleData;
   } catch {
      throw new AppError("AI trả về dữ liệu không đúng định dạng", 500);
   }
};

// Generate + lưu bài viết vào DB (draft)
export const generateAndSaveArticle = async (
   payload: GenerateArticlePayload,
) => {
   const { topic, keywords = "", targetLength = "medium", authorId } = payload;

   const lengthLabel = LENGTH_MAP[targetLength];
   const articleData = await callAnthropicForArticle(
      topic,
      keywords,
      lengthLabel,
   );

   // Tạo slug unique (thêm timestamp nếu trùng)
   let slug = createSlug(articleData.title);
   const existing = await prisma.article.findUnique({ where: { slug } });
   if (existing) {
      slug = `${slug}-${Date.now()}`;
   }

   const saved = await prisma.article.create({
      data: {
         title: articleData.title,
         slug,
         excerpt: articleData.excerpt,
         content: articleData.content,
         thumbnail: articleData.thumbnail,
         published: false, // Luôn lưu draft, admin review trước khi publish
         authorId,
      },
      include: { author: { select: { id: true, fullName: true } } },
   });

   return saved;
};

// Lấy danh sách bài viết draft để admin review
export const getDraftArticles = async (page = 1, limit = 10) => {
   const skip = (page - 1) * limit;

   const [articles, total] = await Promise.all([
      prisma.article.findMany({
         where: { published: false },
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            thumbnail: true,
            createdAt: true,
            author: { select: { fullName: true } },
         },
      }),
      prisma.article.count({ where: { published: false } }),
   ]);

   return {
      articles,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
   };
};

// Publish bài viết draft
export const publishArticle = async (id: number) => {
   const article = await prisma.article.findUnique({ where: { id } });
   if (!article) throw new AppError("Bài viết không tồn tại", 404);

   return prisma.article.update({
      where: { id },
      data: { published: true },
   });
};
