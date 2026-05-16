"use client";

import { useState } from "react";
import {
   Sparkles,
   Loader2,
   ExternalLink,
   CheckCircle,
   Clock,
   BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import type {
   IGenerateArticlePayload,
   IGeneratedArticle,
} from "@/types/ai.type";

const LENGTH_OPTIONS = [
   { value: "short", label: "Ngắn", desc: "600-800 từ" },
   { value: "medium", label: "Vừa", desc: "1000-1400 từ" },
   { value: "long", label: "Dài", desc: "1800-2200 từ" },
] as const;

interface ApiResponse<T> {
   status: string;
   data: T;
   message?: string;
}

interface DraftListItem extends IGeneratedArticle {
   published?: boolean;
}

export default function AiArticlesPage() {
   const [form, setForm] = useState<IGenerateArticlePayload>({
      topic: "",
      keywords: "",
      targetLength: "medium",
   });
   const [isGenerating, setIsGenerating] = useState(false);
   const [generatedArticle, setGeneratedArticle] =
      useState<IGeneratedArticle | null>(null);
   const [drafts, setDrafts] = useState<DraftListItem[]>([]);
   const [loadingDrafts, setLoadingDrafts] = useState(false);
   const [publishingId, setPublishingId] = useState<number | null>(null);

   const handleGenerate = async () => {
      if (!form.topic.trim() || form.topic.trim().length < 5) {
         toast.error("Chủ đề tối thiểu 5 ký tự");
         return;
      }

      setIsGenerating(true);
      setGeneratedArticle(null);

      try {
         const res = await axiosInstance.post<
            IGenerateArticlePayload,
            ApiResponse<IGeneratedArticle>
         >("/ai/articles/generate", form);

         setGeneratedArticle(res.data);
         toast.success("Bài viết đã được tạo và lưu nháp!");
         // Làm mới danh sách drafts
         void loadDrafts();
      } catch (err: unknown) {
         if (err instanceof Error) {
            toast.error(err.message);
         } else {
            toast.error("Không thể tạo bài viết");
         }
      } finally {
         setIsGenerating(false);
      }
   };

   const loadDrafts = async () => {
      setLoadingDrafts(true);
      try {
         const res = await axiosInstance.get<
            unknown,
            ApiResponse<{ articles: DraftListItem[] }>
         >("/ai/articles/drafts");
         setDrafts(res.data.articles);
      } catch {
         toast.error("Không thể tải danh sách nháp");
      } finally {
         setLoadingDrafts(false);
      }
   };

   const handlePublish = async (id: number) => {
      setPublishingId(id);
      try {
         await axiosInstance.patch(`/ai/articles/${id}/publish`, {});
         toast.success("Bài viết đã được publish!");
         setDrafts((prev) => prev.filter((d) => d.id !== id));
      } catch (err: unknown) {
         if (err instanceof Error) {
            toast.error(err.message);
         } else {
            toast.error("Publish thất bại");
         }
      } finally {
         setPublishingId(null);
      }
   };

   return (
      <div className="space-y-8">
         {/* Page header */}
         <div>
            <h1 className="text-[24px] font-bold text-on-surface flex items-center gap-2">
               <Sparkles size={22} className="text-primary" />
               AI Tạo Bài Viết Công Nghệ
            </h1>
            <p className="text-[14px] text-on-surface-variant mt-1">
               Nhập chủ đề, AI sẽ tự động viết bài và lưu nháp để bạn review
               trước khi publish.
            </p>
         </div>

         {/* Generate Form */}
         <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6">
            <h2 className="text-[15px] font-bold text-on-surface mb-5">
               ✍️ Thông tin bài viết
            </h2>

            <div className="space-y-4">
               {/* Topic */}
               <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                     Chủ đề / Tiêu đề gợi ý{" "}
                     <span className="text-error">*</span>
                  </label>
                  <input
                     value={form.topic}
                     onChange={(e) =>
                        setForm((f) => ({ ...f, topic: e.target.value }))
                     }
                     placeholder="VD: So sánh RTX 5080 và RX 9070 XT cho gaming 4K"
                     className="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-surface-variant text-on-surface text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant"
                  />
               </div>

               {/* Keywords */}
               <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-1.5">
                     Từ khóa liên quan{" "}
                     <span className="text-on-surface-variant font-normal">
                        (tuỳ chọn)
                     </span>
                  </label>
                  <input
                     value={form.keywords}
                     onChange={(e) =>
                        setForm((f) => ({ ...f, keywords: e.target.value }))
                     }
                     placeholder="VD: GPU, ray tracing, DLSS, FSR, benchmark"
                     className="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-surface-variant text-on-surface text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant"
                  />
               </div>

               {/* Length */}
               <div>
                  <label className="block text-[13px] font-semibold text-on-surface mb-2">
                     Độ dài bài viết
                  </label>
                  <div className="flex gap-2">
                     {LENGTH_OPTIONS.map(({ value, label, desc }) => (
                        <button
                           key={value}
                           onClick={() =>
                              setForm((f) => ({ ...f, targetLength: value }))
                           }
                           className={`flex-1 py-2.5 rounded-lg border text-[13px] font-semibold transition-colors ${
                              form.targetLength === value
                                 ? "bg-primary text-on-primary border-primary"
                                 : "bg-surface-container border-surface-variant text-on-surface hover:border-primary"
                           }`}
                        >
                           {label}
                           <span
                              className={`block text-[11px] font-normal mt-0.5 ${
                                 form.targetLength === value
                                    ? "text-on-primary/80"
                                    : "text-on-surface-variant"
                              }`}
                           >
                              {desc}
                           </span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* Submit */}
               <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !form.topic.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary font-bold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
               >
                  {isGenerating ? (
                     <>
                        <Loader2 size={18} className="animate-spin" />
                        AI đang viết bài... (15-30 giây)
                     </>
                  ) : (
                     <>
                        <Sparkles size={18} />
                        Tạo bài viết với AI
                     </>
                  )}
               </button>
            </div>
         </div>

         {/* Generated Result */}
         {generatedArticle && (
            <div className="bg-surface-container-lowest border border-primary/40 rounded-xl p-6 animate-in fade-in">
               <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                     <CheckCircle size={18} className="text-success shrink-0" />
                     <h2 className="text-[15px] font-bold text-on-surface">
                        Bài viết vừa được tạo
                     </h2>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-warning-container text-warning font-semibold shrink-0">
                     Nháp
                  </span>
               </div>

               <div className="flex gap-4">
                  {generatedArticle.thumbnail && (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img
                        src={generatedArticle.thumbnail}
                        alt=""
                        className="w-24 h-16 rounded-lg object-cover shrink-0"
                     />
                  )}
                  <div className="flex-1 min-w-0">
                     <p className="text-[14px] font-bold text-on-surface mb-1">
                        {generatedArticle.title}
                     </p>
                     <p className="text-[12px] text-on-surface-variant line-clamp-2">
                        {generatedArticle.excerpt}
                     </p>
                  </div>
               </div>

               <div className="flex gap-2 mt-4">
                  <a
                     href={`/news/${generatedArticle.slug}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-surface-variant text-on-surface text-[13px] font-semibold hover:bg-surface-container transition-colors"
                  >
                     <ExternalLink size={14} /> Xem trước
                  </a>
                  <button
                     onClick={() => void handlePublish(generatedArticle.id)}
                     disabled={publishingId === generatedArticle.id}
                     className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                     {publishingId === generatedArticle.id ? (
                        <Loader2 size={14} className="animate-spin" />
                     ) : (
                        <CheckCircle size={14} />
                     )}
                     Publish ngay
                  </button>
               </div>
            </div>
         )}

         {/* Draft List */}
         <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
               <h2 className="text-[15px] font-bold text-on-surface flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  Bài viết nháp chờ duyệt
               </h2>
               <button
                  onClick={loadDrafts}
                  disabled={loadingDrafts}
                  className="text-[13px] text-primary font-semibold hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
               >
                  {loadingDrafts ? (
                     <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  Tải danh sách
               </button>
            </div>

            {drafts.length === 0 ? (
               <p className="text-[13px] text-on-surface-variant text-center py-8">
                  Nhấn <b>Tải danh sách</b> để xem bài nháp, hoặc tạo bài mới
                  bên trên.
               </p>
            ) : (
               <div className="space-y-3">
                  {drafts.map((draft) => (
                     <div
                        key={draft.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-surface-container border border-surface-variant hover:border-primary/40 transition-colors"
                     >
                        {draft.thumbnail && (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img
                              src={draft.thumbnail}
                              alt=""
                              className="w-16 h-12 rounded-lg object-cover shrink-0"
                           />
                        )}
                        <div className="flex-1 min-w-0">
                           <p className="text-[13px] font-semibold text-on-surface truncate">
                              {draft.title}
                           </p>
                           <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {new Date(draft.createdAt).toLocaleDateString(
                                 "vi-VN",
                              )}
                              {" · "}
                              {draft.author.fullName}
                           </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <a
                              href={`/news/${draft.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                              title="Xem trước"
                           >
                              <ExternalLink size={14} />
                           </a>
                           <button
                              onClick={() => void handlePublish(draft.id)}
                              disabled={publishingId === draft.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[12px] font-bold hover:bg-primary/20 disabled:opacity-50 transition-colors"
                           >
                              {publishingId === draft.id ? (
                                 <Loader2 size={12} className="animate-spin" />
                              ) : (
                                 <CheckCircle size={12} />
                              )}
                              Publish
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
