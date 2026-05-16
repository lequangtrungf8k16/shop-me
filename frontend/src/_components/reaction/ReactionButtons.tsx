"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface Props {
   // Chỉ 1 trong 3 được truyền vào
   productId?: number;
   articleId?: number;
   commentId?: number;
   initialLikes?: number;
   initialDislikes?: number;
   initialUserReaction?: "LIKE" | "DISLIKE" | null;
   size?: "sm" | "md";
}

export default function ReactionButtons({
   productId,
   articleId,
   commentId,
   initialLikes = 0,
   initialDislikes = 0,
   initialUserReaction = null,
   size = "md",
}: Props) {
   const { isAuthenticated } = useAuthStore();
   const [likes, setLikes] = useState(initialLikes);
   const [dislikes, setDislikes] = useState(initialDislikes);
   const [userReaction, setUserReaction] = useState<"LIKE" | "DISLIKE" | null>(
      initialUserReaction,
   );
   const [loading, setLoading] = useState(false);

   const iconSize = size === "sm" ? 14 : 18;
   const textSize = size === "sm" ? "text-[11px]" : "text-[13px]";

   const handleReact = async (type: "LIKE" | "DISLIKE") => {
      if (!isAuthenticated()) {
         toast.error("Vui lòng đăng nhập để thực hiện thao tác này");
         return;
      }
      if (loading) return;

      // Optimistic update
      const prev = { likes, dislikes, userReaction };

      if (userReaction === type) {
         // Toggle off
         setUserReaction(null);
         if (type === "LIKE") setLikes((l) => l - 1);
         else setDislikes((d) => d - 1);
      } else {
         // Switch hoặc new
         if (userReaction === "LIKE") setLikes((l) => l - 1);
         if (userReaction === "DISLIKE") setDislikes((d) => d - 1);
         setUserReaction(type);
         if (type === "LIKE") setLikes((l) => l + 1);
         else setDislikes((d) => d + 1);
      }

      setLoading(true);
      try {
         await axiosInstance.post("/reactions/toggle", {
            type,
            productId,
            articleId,
            commentId,
         });
      } catch {
         // Rollback optimistic
         setLikes(prev.likes);
         setDislikes(prev.dislikes);
         setUserReaction(prev.userReaction);
         toast.error("Có lỗi xảy ra, vui lòng thử lại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex items-center gap-2">
         <button
            onClick={() => handleReact("LIKE")}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
               userReaction === "LIKE"
                  ? "bg-primary text-on-primary border-primary"
                  : "border-surface-variant text-on-surface-variant hover:border-primary hover:text-primary"
            } disabled:opacity-50`}
         >
            <ThumbsUp size={iconSize} />
            <span className={`${textSize} font-semibold`}>{likes}</span>
         </button>

         <button
            onClick={() => handleReact("DISLIKE")}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
               userReaction === "DISLIKE"
                  ? "bg-error text-on-error border-error"
                  : "border-surface-variant text-on-surface-variant hover:border-error hover:text-error"
            } disabled:opacity-50`}
         >
            <ThumbsDown size={iconSize} />
            <span className={`${textSize} font-semibold`}>{dislikes}</span>
         </button>
      </div>
   );
}
