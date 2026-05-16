"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, X } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import CommentItem from "./CommentItem";
import type { CommentsApiResponse } from "@/types/comment.type";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
   productId?: number;
   articleId?: number;
}

export default function CommentSection({ productId, articleId }: Props) {
   const queryClient = useQueryClient();
   const { isAuthenticated, user } = useAuthStore();
   const [content, setContent] = useState("");
   const [replyTo, setReplyTo] = useState<{
      parentId: number;
      author: string;
   } | null>(null);
   const textareaRef = useRef<HTMLTextAreaElement>(null);

   const queryKey = ["comments", { productId, articleId }];

   // Fetch comments
   const { data, isLoading } = useQuery<CommentsApiResponse>({
      queryKey,
      queryFn: async () => {
         const params = productId
            ? `productId=${productId}`
            : `articleId=${articleId}`;
         const res = await axiosInstance.get<CommentsApiResponse>(
            `/comments?${params}`,
         );

         return res.data;
      },
   });

   // Mutation tạo comment
   const createMutation = useMutation({
      mutationFn: (payload: {
         content: string;
         parentId?: number;
         productId?: number;
         articleId?: number;
      }) => axiosInstance.post("/comments", payload),
      onSuccess: () => {
         setContent("");
         setReplyTo(null);
         queryClient.invalidateQueries({ queryKey });
         toast.success("Đã đăng bình luận");
      },
      onError: (err: { message?: string }) => {
         toast.error(err.message ?? "Không thể đăng bình luận");
      },
   });

   // Mutation xóa comment
   const deleteMutation = useMutation({
      mutationFn: (commentId: number) =>
         axiosInstance.delete(`/comments/${commentId}`),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey });
         toast.success("Đã xóa bình luận");
      },
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim()) return;
      createMutation.mutate({
         content: content.trim(),
         parentId: replyTo?.parentId,
         productId,
         articleId,
      });
   };

   const handleReply = (parentId: number, author: string) => {
      setReplyTo({ parentId, author });
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({
         behavior: "smooth",
         block: "center",
      });
   };

   const totalComments = data?.pagination.total ?? 0;

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" />
            <h3 className="text-[18px] font-bold text-on-surface">
               Bình luận ({totalComments})
            </h3>
         </div>

         {/* Form nhập bình luận */}
         {isAuthenticated() ? (
            <form
               onSubmit={handleSubmit}
               className="bg-surface-container-lowest border border-surface-variant rounded-lg p-4 shadow-sm"
            >
               {/* Reply indicator */}
               {replyTo && (
                  <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded px-3 py-2 mb-3">
                     <span className="text-[12px] text-primary font-semibold">
                        Đang trả lời <strong>{replyTo.author}</strong>
                     </span>
                     <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="text-primary hover:text-on-surface"
                     >
                        <X size={14} />
                     </button>
                  </div>
               )}

               <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[13px] shrink-0">
                     {user?.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                     <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                           replyTo
                              ? `Trả lời ${replyTo.author}...`
                              : "Viết bình luận của bạn..."
                        }
                        rows={3}
                        maxLength={2000}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                     />
                     <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-on-surface-variant">
                           {content.length}/2000
                        </span>
                        <button
                           type="submit"
                           disabled={
                              !content.trim() || createMutation.isPending
                           }
                           className="flex items-center gap-2 bg-primary text-on-primary text-[13px] font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                        >
                           <Send size={14} />
                           {createMutation.isPending ? "Đang gửi..." : "Gửi"}
                        </button>
                     </div>
                  </div>
               </div>
            </form>
         ) : (
            <div className="bg-surface-container-low border border-surface-variant rounded-lg p-4 text-center">
               <p className="text-[14px] text-on-surface-variant">
                  Vui lòng{" "}
                  <Link
                     href="/login"
                     className="text-primary font-bold hover:underline"
                  >
                     đăng nhập
                  </Link>{" "}
                  để bình luận.
               </p>
            </div>
         )}

         {/* Danh sách bình luận */}
         {isLoading ? (
            <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                     <div className="w-9 h-9 rounded-full bg-surface-container" />
                     <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface-container rounded w-32" />
                        <div className="h-16 bg-surface-container rounded" />
                     </div>
                  </div>
               ))}
            </div>
         ) : data?.comments.length === 0 ? (
            <div className="text-center py-10">
               <MessageCircle
                  size={40}
                  className="text-outline-variant mx-auto mb-2"
               />
               <p className="text-[14px] text-on-surface-variant">
                  Chưa có bình luận nào. Hãy là người đầu tiên!
               </p>
            </div>
         ) : (
            <div className="space-y-4">
               {data?.comments.map((comment) => (
                  <CommentItem
                     key={comment.id}
                     comment={comment}
                     onReply={handleReply}
                     onDelete={(id) => deleteMutation.mutate(id)}
                     depth={0}
                  />
               ))}

               {/* Load more */}
               {data && data.pagination.totalPages > data.pagination.page && (
                  <button className="text-primary font-semibold text-[14px] hover:underline">
                     Xem thêm bình luận...
                  </button>
               )}
            </div>
         )}
      </div>
   );
}
