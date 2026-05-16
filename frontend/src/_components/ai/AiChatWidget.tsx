"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
   MessageCircle,
   X,
   Send,
   Bot,
   User,
   Loader2,
   Sparkles,
} from "lucide-react";

interface IChatMessage {
   role: "user" | "assistant";
   content: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const WELCOME: IChatMessage = {
   role: "assistant",
   content:
      "Xin chào! Tôi là trợ lý AI của TECHNOLOGY. Tôi có thể tư vấn sản phẩm, giải đáp chính sách và hỗ trợ đơn hàng. Bạn cần giúp gì?",
};
const SUGGESTED = [
   "Laptop gaming dưới 20 triệu nên mua gì?",
   "Chính sách đổi trả như thế nào?",
   "Bàn phím cơ switch nào phù hợp cho người mới?",
];

export default function AiChatWidget() {
   const [open, setOpen] = useState(false);
   const [messages, setMessages] = useState<IChatMessage[]>([WELCOME]);
   const [input, setInput] = useState("");
   const [streaming, setStreaming] = useState(false);
   const [unread, setUnread] = useState(false);
   const endRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const abortRef = useRef<AbortController | null>(null);

   useEffect(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);
   useEffect(() => {
      if (open) {
         setUnread(false);
         setTimeout(() => inputRef.current?.focus(), 100);
      }
   }, [open]);

   const send = useCallback(
      async (text: string) => {
         const trimmed = text.trim();
         if (!trimmed || streaming) return;
         const userMsg: IChatMessage = { role: "user", content: trimmed };
         const updated = [...messages, userMsg];
         setMessages(updated);
         setInput("");
         setStreaming(true);
         setMessages((p) => [...p, { role: "assistant", content: "" }]);
         try {
            abortRef.current = new AbortController();
            const res = await fetch(`${API_URL}/ai/chat`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ messages: updated.slice(-10) }),
               signal: abortRef.current.signal,
            });
            if (!res.body) throw new Error("No stream");
            const reader = res.body.getReader();
            const dec = new TextDecoder();
            let acc = "";
            while (true) {
               const { done, value } = await reader.read();
               if (done) break;
               for (const line of dec
                  .decode(value, { stream: true })
                  .split("\n")) {
                  if (!line.startsWith("data: ")) continue;
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") break;
                  try {
                     const p = JSON.parse(data) as { text?: string };
                     if (p.text) {
                        acc += p.text;
                        setMessages((prev) => {
                           const n = [...prev];
                           n[n.length - 1] = {
                              role: "assistant",
                              content: acc,
                           };
                           return n;
                        });
                     }
                  } catch {
                     /**/
                  }
               }
            }
            if (!open) setUnread(true);
         } catch (e: any) {
            if (e?.name === "AbortError") return;
            setMessages((prev) => {
               const n = [...prev];
               n[n.length - 1] = {
                  role: "assistant",
                  content: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại.",
               };
               return n;
            });
         } finally {
            setStreaming(false);
         }
      },
      [messages, streaming, open],
   );

   return (
      <>
         <button
            onClick={() => setOpen(true)}
            className={`fixed bottom-18 right-4 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all items-center justify-center cursor-pointer ${open ? "hidden" : "flex"}`}
         >
            <MessageCircle size={24} />
            {unread && (
               <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-error rounded-full border-2 border-white animate-pulse" />
            )}
         </button>

         {open && (
            <div
               className="fixed bottom-6 right-6 z-50 w-90 max-w-[calc(100vw-2rem)] bg-surface border border-surface-variant rounded-2xl shadow-2xl flex flex-col overflow-hidden"
               style={{ height: "520px" }}
            >
               <div className="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary shrink-0">
                  <div className="w-8 h-8 rounded-full bg-on-primary/20 flex items-center justify-center">
                     <Sparkles size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-[13px] font-bold">
                        Trợ lý AI TECHNOLOGY
                     </p>
                     <p className="text-[10px] opacity-75 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                        Luôn sẵn sàng
                     </p>
                  </div>
                  <button
                     onClick={() => {
                        abortRef.current?.abort();
                        setMessages([WELCOME]);
                        setInput("");
                     }}
                     className="text-on-primary/60 hover:text-on-primary text-[11px] px-2 py-1 rounded hover:bg-on-primary/10 cursor-pointer"
                  >
                     Xóa
                  </button>
                  <button
                     onClick={() => setOpen(false)}
                     className="text-on-primary/60 hover:text-on-primary p-1 cursor-pointer"
                  >
                     <X size={18} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface-container-lowest">
                  {messages.map((msg, i) => (
                     <div
                        key={i}
                        className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                     >
                        <div
                           className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}
                        >
                           {msg.role === "assistant" ? (
                              <Bot size={13} />
                           ) : (
                              <User size={13} />
                           )}
                        </div>
                        <div
                           className={`max-w-[78%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${msg.role === "user" ? "bg-primary text-on-primary rounded-tr-sm" : "bg-surface-container text-on-surface rounded-tl-sm"}`}
                        >
                           {msg.content || (
                              <span className="flex items-center gap-1 text-on-surface-variant">
                                 <Loader2 size={11} className="animate-spin" />{" "}
                                 Đang soạn...
                              </span>
                           )}
                        </div>
                     </div>
                  ))}
                  {messages.length === 1 && (
                     <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] text-on-surface-variant px-1">
                           Câu hỏi thường gặp:
                        </p>
                        {SUGGESTED.map((q) => (
                           <button
                              key={q}
                              onClick={() => void send(q)}
                              className="w-full text-left text-[12px] text-primary border border-primary/30 rounded-xl px-3 py-2 hover:bg-primary/5 cursor-pointer"
                           >
                              {q}
                           </button>
                        ))}
                     </div>
                  )}
                  <div ref={endRef} />
               </div>

               <div className="px-3 py-3 border-t border-surface-variant bg-surface shrink-0">
                  <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2">
                     <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              void send(input);
                           }
                        }}
                        placeholder="Nhập câu hỏi..."
                        disabled={streaming}
                        className="flex-1 text-[13px] bg-transparent text-on-surface placeholder:text-on-surface-variant outline-none disabled:opacity-60"
                     />
                     <button
                        onClick={() => void send(input)}
                        disabled={!input.trim() || streaming}
                        className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 shrink-0 hover:opacity-90 cursor-pointer"
                     >
                        {streaming ? (
                           <Loader2 size={14} className="animate-spin" />
                        ) : (
                           <Send size={14} />
                        )}
                     </button>
                  </div>
                  <p className="text-[10px] text-on-surface-variant text-center mt-1.5">
                     Powered by AI
                  </p>
               </div>
            </div>
         )}
      </>
   );
}
