"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, CheckCircle2, PenLine, X } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import type { ReviewsApiResponse } from "@/types/review.type";
import Link from "next/link";

interface Props {
   productId: number;
}

const StarRating = ({
   value,
   onChange,
   readonly = false,
   size = 20,
}: {
   value: number;
   onChange?: (v: number) => void;
   readonly?: boolean;
   size?: number;
}) => {
   const [hovered, setHovered] = useState(0);

   return (
      <div className="flex">
         {[1, 2, 3, 4, 5].map((star) => (
            <button
               key={star}
               type="button"
               disabled={readonly}
               onClick={() => onChange?.(star)}
               onMouseEnter={() => !readonly && setHovered(star)}
               onMouseLeave={() => !readonly && setHovered(0)}
               className={`${readonly ? "cursor-default" : "cursor-pointer"}`}
            >
               <Star
                  size={size}
                  className={`transition-colors ${
                     star <= (hovered || value)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-surface-variant"
                  }`}
               />
            </button>
         ))}
      </div>
   );
};

const formatTimeAgo = (date: string) => {
   const diff = Date.now() - new Date(date).getTime();
   const d = Math.floor(diff / 86400000);
   if (d === 0) return "Hôm nay";
   if (d < 7) return `${d} ngày trước`;
   if (d < 30) return `${Math.floor(d / 7)} tuần trước`;
   return new Date(date).toLocaleDateString("vi-VN");
};

export default function ReviewSection({ productId }: Props) {
   const queryClient = useQueryClient();
   const { isAuthenticated } = useAuthStore();

   const [showForm, setShowForm] = useState(false);
   const [rating, setRating] = useState(5);
   const [content, setContent] = useState("");

   const queryKey = ["reviews", productId];

   const { data, isLoading } = useQuery<ReviewsApiResponse>({
      queryKey,
      queryFn: async () => {
         const res = await axiosInstance.get<ReviewsApiResponse>(
            `/reviews/product/${productId}`,
         );
         return res.data;
      },
   });

   const submitMutation = useMutation({
      mutationFn: () =>
         axiosInstance.post("/reviews", { productId, rating, content }),
      onSuccess: () => {
         toast.success("Cảm ơn đánh giá của bạn!");
         setShowForm(false);
         setContent("");
         setRating(5);
         queryClient.invalidateQueries({ queryKey });
      },
      onError: (err: { message?: string }) => {
         toast.error(err.message ?? "Không thể gửi đánh giá");
      },
   });

   const stats = data?.stats;

   return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-section-gap">
         {/* Cột trái — Thống kê */}
         <div className="lg:col-span-4 space-y-4">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm text-center">
               {/* Điểm trung bình */}
               <div className="text-[56px] font-bold text-on-surface leading-none mb-1">
                  {stats?.averageRating ?? "0.0"}
                  <span className="text-[22px] text-on-surface-variant">
                     /5
                  </span>
               </div>
               <StarRating
                  value={Math.round(Number(stats?.averageRating ?? 0))}
                  readonly
                  size={22}
               />
               <p className="text-[13px] text-on-surface-variant mt-1 mb-5">
                  {stats?.totalReviews ?? 0} đánh giá
               </p>

               {/* Phân bổ sao */}
               <div className="space-y-2 mb-5">
                  {stats?.distribution.map((d) => (
                     <div
                        key={d.star}
                        className="flex items-center gap-2 text-[12px]"
                     >
                        <span className="w-4 text-on-surface-variant text-right shrink-0">
                           {d.star}
                        </span>
                        <Star
                           size={12}
                           className="fill-amber-400 text-amber-400 shrink-0"
                        />
                        <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                           <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${d.percent}%` }}
                           />
                        </div>
                        <span className="w-6 text-on-surface-variant shrink-0">
                           {d.count}
                        </span>
                     </div>
                  ))}
               </div>

               {/* Nút viết đánh giá */}
               {isAuthenticated() ? (
                  <button
                     onClick={() => setShowForm(!showForm)}
                     className="w-full border border-primary text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                     <PenLine size={16} />
                     {showForm ? "Hủy đánh giá" : "VIẾT ĐÁNH GIÁ"}
                  </button>
               ) : (
                  <Link
                     href="/login"
                     className="block w-full border border-primary text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-colors text-center"
                  >
                     Đăng nhập để đánh giá
                  </Link>
               )}
            </div>

            {/* Form viết đánh giá */}
            {showForm && (
               <div className="bg-surface-container-lowest border border-primary/30 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="text-[15px] font-bold text-on-surface">
                        Đánh giá của bạn
                     </h4>
                     <button onClick={() => setShowForm(false)}>
                        <X
                           size={18}
                           className="text-on-surface-variant hover:text-on-surface"
                        />
                     </button>
                  </div>

                  <div className="mb-3">
                     <p className="text-[12px] font-semibold text-on-surface-variant uppercase mb-1">
                        Chọn số sao
                     </p>
                     <StarRating
                        value={rating}
                        onChange={setRating}
                        size={28}
                     />
                  </div>

                  <div className="mb-4">
                     <p className="text-[12px] font-semibold text-on-surface-variant uppercase mb-1">
                        Nhận xét (tuỳ chọn)
                     </p>
                     <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        rows={4}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                     />
                  </div>

                  <button
                     onClick={() => submitMutation.mutate()}
                     disabled={submitMutation.isPending}
                     className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-60"
                  >
                     {submitMutation.isPending ? "Đang gửi..." : "GỬI ĐÁNH GIÁ"}
                  </button>
               </div>
            )}
         </div>

         {/* Cột phải — Danh sách */}
         <div className="lg:col-span-8 space-y-4">
            {isLoading ? (
               <div className="space-y-4">
                  {[1, 2].map((i) => (
                     <div
                        key={i}
                        className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 animate-pulse"
                     >
                        <div className="h-4 bg-surface-container rounded w-32 mb-3" />
                        <div className="h-3 bg-surface-container rounded w-full mb-2" />
                        <div className="h-3 bg-surface-container rounded w-3/4" />
                     </div>
                  ))}
               </div>
            ) : data?.reviews.length === 0 ? (
               <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-10 text-center">
                  <Star
                     size={40}
                     className="text-outline-variant mx-auto mb-3"
                  />
                  <p className="text-on-surface-variant text-[14px]">
                     Chưa có đánh giá nào. Hãy là người đầu tiên!
                  </p>
               </div>
            ) : (
               data?.reviews.map((review) => (
                  <div
                     key={review.id}
                     className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 shadow-sm"
                  >
                     <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[15px]">
                              {review.user.fullName.charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-[14px] font-bold text-on-surface flex items-center gap-2">
                                 {review.user.fullName}
                                 <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Đã mua hàng
                                 </span>
                              </p>
                              <p className="text-[11px] text-on-surface-variant">
                                 {formatTimeAgo(review.createdAt)}
                              </p>
                           </div>
                        </div>
                        <StarRating value={review.rating} readonly size={14} />
                     </div>

                     {review.content && (
                        <p className="text-[14px] text-on-surface-variant leading-relaxed">
                           {review.content}
                        </p>
                     )}
                  </div>
               ))
            )}
         </div>
      </div>
   );
}
