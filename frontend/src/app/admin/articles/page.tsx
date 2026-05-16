"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Newspaper, Eye, EyeOff, Trash2, Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Article { id: number; title: string; slug: string; excerpt: string|null; thumbnail: string|null; published: boolean; views: number; createdAt: string; author: { fullName: string }; _count: { comments: number; reactions: number }; }
const FD = (d: string) => new Date(d).toLocaleDateString("vi-VN");

export default function AdminArticlesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useQuery<any>({
    queryKey: ["adm-articles", page, filter],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: "15", ...(filter !== "" ? { published: filter } : {}) });
      return (await axiosInstance.get(`/admin/articles?${p}`) as any).data;
    },
  });
  const toggle = useMutation({
    mutationFn: (id: number) => axiosInstance.patch(`/admin/articles/${id}/toggle-publish`, {}),
    onSuccess: () => { toast.success("Đã cập nhật"); qc.invalidateQueries({ queryKey: ["adm-articles"] }); },
    onError: (e: any) => toast.error(e?.message),
  });
  const del = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/admin/articles/${id}`),
    onSuccess: () => { toast.success("Đã chuyển vào thùng rác"); qc.invalidateQueries({ queryKey: ["adm-articles"] }); },
    onError: (e: any) => toast.error(e?.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2"><Newspaper size={20} className="text-primary" />Bài viết</h1>
          <p className="text-[12px] text-on-surface-variant">{data?.pagination?.total ?? 0} bài viết</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg bg-surface border border-surface-variant text-[13px] focus:outline-none focus:border-primary">
            <option value="">Tất cả</option><option value="true">Đã publish</option><option value="false">Nháp</option>
          </select>
          <Link href="/admin/ai-articles" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-bold hover:opacity-90">
            <Sparkles size={15} /> AI Tạo bài
          </Link>
        </div>
      </div>
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-primary" /></div> : (
          <div className="divide-y divide-surface-variant">
            {(data?.articles ?? []).map((a: Article) => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container-low">
                <div className="w-16 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                  {a.thumbnail ? <img src={a.thumbnail} alt="" className="w-full h-full object-cover" /> : <Newspaper size={16} className="m-auto mt-3 text-outline" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-on-surface truncate">{a.title}</p>
                  <p className="text-[11px] text-on-surface-variant">{a.author.fullName} · {FD(a.createdAt)} · {a.views} lượt xem · {a._count.comments} bình luận</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${a.published ? "bg-green-100 text-green-700" : "bg-secondary-container text-on-secondary-container"}`}>
                  {a.published ? "Đã publish" : "Nháp"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggle.mutate(a.id)} disabled={toggle.isPending} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary">
                    {a.published ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => { if (confirm(`Xóa "${a.title}"?`)) del.mutate(a.id); }} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error">
                    <Trash2 size={15} />
                  </button>
                </div>
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
