"use client";

import { useState } from "react";
import { MessageCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import ReactionButtons from "@/_components/reaction/ReactionButtons";
import type { Comment } from "@/types/comment.type";
import { useAuthStore } from "@/store/auth.store";

interface Props {
   comment: Comment;
   onReply: (parentId: number, parentAuthor: string) => void;
   onDelete: (commentId: number) => void;
   depth?: number; // 0 = root, 1 = reply, 2 = reply của reply
}

const formatTimeAgo = (date: string) => {
   const diff = Date.now() - new Date(date).getTime();
   const m = Math.floor(diff / 60000);
   if (m < 1) return "vừa xong";
   if (m < 60) return `${m} phút trước`;
   const h = Math.floor(m / 60);
   if (h < 24) return `${h} giờ trước`;
   const d = Math.floor(h / 24);
   if (d < 30) return `${d} ngày trước`;
   return new Date(date).toLocaleDateString("vi-VN");
};

export default function CommentItem({
   comment,
   onReply,
   onDelete,
   depth = 0,
}: Props) {
   const { user, isAuthenticated } = useAuthStore();
   const [showReplies, setShowReplies] = useState(depth === 0);

   const likes = comment.reactions.filter((r) => r.type === "LIKE").length;
   const dislikes = comment.reactions.filter(
      (r) => r.type === "DISLIKE",
   ).length;
   const userReaction = user
      ? (comment.reactions.find((r) => r.userId === user.id)?.type ?? null)
      : null;

   const canDelete =
      isAuthenticated() &&
      (user?.id === comment.user.id || user?.role === "ADMIN");

   const initials = comment.user.fullName.charAt(0).toUpperCase();

   return (
      <div className={`flex gap-3 ${depth > 0 ? "ml-8 mt-3" : ""}`}>
         {/* Avatar */}
         <div
            className={`shrink-0 rounded-full flex items-center justify-center font-bold text-primary bg-primary/10 ${
               depth === 0 ? "w-9 h-9 text-[14px]" : "w-7 h-7 text-[12px]"
            }`}
         >
            {initials}
         </div>

         {/* Body */}
         <div className="flex-1 min-w-0">
            <div className="bg-surface-container-low rounded-lg px-4 py-3">
               <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-bold text-on-surface">
                     {comment.user.fullName}
                  </span>
                  <span className="text-[11px] text-on-surface-variant shrink-0">
                     {formatTimeAgo(comment.createdAt)}
                  </span>
               </div>
               <p
                  className={`text-[13px] leading-relaxed ${
                     comment.isDeleted
                        ? "italic text-on-surface-variant"
                        : "text-on-surface"
                  }`}
               >
                  {comment.content}
               </p>
            </div>

            {/* Actions */}
            {!comment.isDeleted && (
               <div className="flex items-center gap-3 mt-1.5 pl-1">
                  <ReactionButtons
                     commentId={comment.id}
                     initialLikes={likes}
                     initialDislikes={dislikes}
                     initialUserReaction={userReaction}
                     size="sm"
                  />

                  {depth < 2 && (
                     <button
                        onClick={() =>
                           onReply(comment.id, comment.user.fullName)
                        }
                        className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
                     >
                        <MessageCircle size={13} /> Trả lời
                     </button>
                  )}

                  {canDelete && (
                     <button
                        onClick={() => onDelete(comment.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant hover:text-error transition-colors ml-auto"
                     >
                        <Trash2 size={13} /> Xóa
                     </button>
                  )}
               </div>
            )}

            {/* Replies toggle */}
            {comment.replies && comment.replies.length > 0 && (
               <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 mt-2 pl-1 text-[12px] font-semibold text-primary hover:underline"
               >
                  {showReplies ? (
                     <ChevronUp size={14} />
                  ) : (
                     <ChevronDown size={14} />
                  )}
                  {showReplies ? "Ẩn" : "Xem"} {comment.replies.length} phản hồi
               </button>
            )}

            {/* Nested replies */}
            {showReplies &&
               comment.replies?.map((reply) => (
                  <CommentItem
                     key={reply.id}
                     comment={reply}
                     onReply={onReply}
                     onDelete={onDelete}
                     depth={depth + 1}
                  />
               ))}
         </div>
      </div>
   );
}
