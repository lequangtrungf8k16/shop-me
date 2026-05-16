import { AppError } from "../../shared/errors/AppError";

export interface ChatMessage {
   role: "user" | "assistant";
   content: string;
}

const SYSTEM_PROMPT = `Bạn là trợ lý bán hàng AI của cửa hàng TECHNOLOGY — chuyên bán laptop, linh kiện PC, gaming gear.

Nhiệm vụ:
- Tư vấn sản phẩm phù hợp nhu cầu và ngân sách
- Giải đáp thắc mắc về chính sách đổi trả, bảo hành, giao hàng
- Hỗ trợ tra cứu đơn hàng (hướng dẫn vào trang /orders)
- Giải thích thông số kỹ thuật sản phẩm công nghệ

Nguyên tắc:
- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, chuyên nghiệp
- Không bịa thông tin về giá, tồn kho cụ thể — hướng user xem trang sản phẩm
- Nếu không biết, thành thật nói không biết và hướng dẫn liên hệ admin
- Tối đa 3-4 câu mỗi lượt trả lời`;

// Gọi Anthropic API với streaming — trả về ReadableStream
export const streamChatResponse = async (
   messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> => {
   const apiKey = process.env["ANTHROPIC_API_KEY"];
   if (!apiKey) throw new AppError("ANTHROPIC_API_KEY chưa được cấu hình", 500);

   // Giới hạn lịch sử 10 tin nhắn gần nhất để tiết kiệm token
   const recentMessages = messages.slice(-10);

   const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "x-api-key": apiKey,
         "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
         model: "claude-sonnet-4-20250514",
         max_tokens: 1024,
         system: SYSTEM_PROMPT,
         stream: true,
         messages: recentMessages,
      }),
   });

   if (!response.ok) {
      const errorBody = await response.text();
      console.error("Anthropic API error:", errorBody);
      throw new AppError("AI service tạm thời không khả dụng", 503);
   }

   if (!response.body) throw new AppError("Không nhận được stream từ AI", 500);

   return response.body;
};
