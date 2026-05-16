"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Review { id: number; rating: number; comment: string; createdAt: string; user: { fullName: string; email: string }; product: { name: string; slug: string }; }
const FD = (d: string) => new Date(d).toLocaleDateString("vi-VN");

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<any>({ queryKey: ["adm-reviews", page], queryFn: async () => (await axiosInstance.get(`/admin/reviews?page=${page}`) as any).data });
  const del = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/admin/reviews/${id}`),
    onSuccess: () => { toast.success("Đã xóa đánh giá"); qc.invalidateQueries({ queryKey: ["adm-reviews"] }); },
    onError: (e: any) => toast.error(e?.message),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2"><Star size={20} className="text-primary" />Đánh giá</h1>
        <p className="text-[12px] text-on-surface-variant">{data?.pagination?.total ?? 0} đánh giá</p>
      </div>
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-primary" /></div> : (
          <div className="divide-y divide-surface-variant">
            {(data?.reviews ?? []).map((r: Review) => (
              <div key={r.id} className="flex items-start gap-4 px-4 py-3 hover:bg-surface-container-low">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[12px] font-bold text-on-surface">{r.user.fullName}</span>
                    <span className="text-[11px] text-on-surface-variant">{r.user.email}</span>
                    <span className="text-[11px] font-semibold text-primary truncate">· {r.product.name}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-outline"} />)}
                    <span className="text-[11px] text-on-surface-variant ml-1">{FD(r.createdAt)}</span>
                  </div>
                  <p className="text-[12px] text-on-surface">{r.comment}</p>
                </div>
                <button onClick={() => { if (confirm("Xóa đánh giá này?")) del.mutate(r.id); }} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
        {data?.pagination?.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-surface-variant flex items-center justify-between">
            <p className="text-[12px] text-on-surface-variant">Trang {page}/{data.pagination.totalPages}</p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg border border-surface-variant hover:bg-surface-container disabled:opacity-40"><ChevronLeft size={15}/></button>
              <button onClick={() => setPage((p) => Math.min(data.pagination.totalPages,p+1))} disabled={page===data.pagination.totalPages} className="p-1.5 rounded-lg border border-surface-variant hover:bg-surface-container disabled:opacity-40"><ChevronRight size={15}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
