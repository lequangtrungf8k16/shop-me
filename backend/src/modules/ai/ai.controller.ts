import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { streamChatResponse, type ChatMessage } from "./ai-chat.service";
import {
   generateAndSaveArticle,
   getDraftArticles,
   publishArticle,
} from "./ai-articles.service";
import { AppError } from "../../shared/errors/AppError";

// POST /api/ai/chat — SSE Streaming
export const chatController = async (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   try {
      const { messages } = req.body as { messages: ChatMessage[] };

      if (!Array.isArray(messages) || messages.length === 0) {
         throw new AppError("Tin nhắn không hợp lệ", 400);
      }

      // Thiết lập SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // Tắt buffer nginx

      const stream = await streamChatResponse(messages);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      // Đọc stream từ Anthropic và forward sang client
      const pump = async () => {
         while (true) {
            const { done, value } = await reader.read();
            if (done) {
               res.write("data: [DONE]\n\n");
               res.end();
               return;
            }

            const chunk = decoder.decode(value, { stream: true });
            // Anthropic stream trả về "data: {...}\n\n" — forward thẳng
            const lines = chunk.split("\n");

            for (const line of lines) {
               if (!line.startsWith("data: ")) continue;
               const jsonStr = line.slice(6).trim();
               if (jsonStr === "[DONE]") continue;

               try {
                  const event = JSON.parse(jsonStr) as {
                     type: string;
                     delta?: { type: string; text?: string };
                  };

                  if (
                     event.type === "content_block_delta" &&
                     event.delta?.type === "text_delta" &&
                     event.delta.text
                  ) {
                     // Chỉ gửi text delta xuống client
                     res.write(
                        `data: ${JSON.stringify({ text: event.delta.text })}\n\n`,
                     );
                  }
               } catch {
                  // Bỏ qua JSON parse lỗi trong stream
               }
            }
         }
      };

      await pump();
   } catch (err) {
      // Nếu headers chưa gửi, xử lý lỗi bình thường
      if (!res.headersSent) {
         next(err);
      } else {
         res.write(
            `data: ${JSON.stringify({ error: "Stream bị gián đoạn" })}\n\n`,
         );
         res.end();
      }
   }
};

// POST /api/ai/articles/generate — Admin only
export const generateArticleController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
) => {
   try {
      const authorId = req.user?.id as number;
      const { topic, keywords, targetLength } = req.body as {
         topic: string;
         keywords?: string;
         targetLength?: "short" | "medium" | "long";
      };

      if (!topic || topic.trim().length < 5) {
         throw new AppError("Chủ đề tối thiểu 5 ký tự", 400);
      }

      const article = await generateAndSaveArticle({
         topic: topic.trim(),
         keywords,
         targetLength,
         authorId,
      });

      res.status(201).json({
         status: "success",
         message: "Bài viết đã được tạo và lưu dưới dạng nháp",
         data: article,
      });
   } catch (err) {
      next(err);
   }
};

// GET /api/ai/articles/drafts — Admin only
export const getDraftsController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
) => {
   try {
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 10;
      const result = await getDraftArticles(page, limit);
      res.status(200).json({ status: "success", data: result });
   } catch (err) {
      next(err);
   }
};

// PATCH /api/ai/articles/:id/publish — Admin only
export const publishArticleController = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
) => {
   try {
      const id = Number(req.params["id"]);
      const updated = await publishArticle(id);
      res.status(200).json({
         status: "success",
         message: "Bài viết đã được publish",
         data: updated,
      });
   } catch (err) {
      next(err);
   }
};
