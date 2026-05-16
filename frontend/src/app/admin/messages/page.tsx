"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Loader2, ChevronDown, ChevronUp, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

type CS = "PENDING" | "REPLIED" | "CLOSED";
interface Msg { id: number; name: string; email: string; subject: string; message: string; status: CS; adminReply: string|null; repliedAt: string|null; createdAt: string; }
const ST: Record<CS, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Chờ xử lý", color: "bg-secondary-container text-on-secondary-container", icon: Clock },
  REPLIED: { label: "Đã phản hồi", color: "bg-green-100 text-green-700", icon: CheckCircle },
  CLOSED: { label: "Đã đóng", color: "bg-surface-container text-on-surface-variant", icon: XCircle },
};
const FD = (d: string) => new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function MsgRow({ msg, onReply, onClose }: { msg: Msg; onReply: (id: number, r: string) => Promise<void>; onClose: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const Icon = ST[msg.status].icon;
  const handleSend = async () => {
    if (!reply.trim()) { toast.error("Vui lòng nhập nội dung"); return; }
    setSending(true);
    try { await onReply(msg.id, reply); setReply(""); setExpanded(false); } finally { setSending(false); }
  };
  return (
    <div className={`bg-surface-container-lowest border rounded-xl overflow-hidden ${msg.status === "PENDING" ? "border-primary/40" : "border-surface-variant"}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-on-surface">{msg.name}</span>
            <span className="text-[11px] text-on-surface-variant">{msg.email}</span>
            {msg.status === "PENDING" && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
          </div>
          <p className="text-[12px] text-on-surface-variant truncate">{msg.subject}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${ST[msg.status].color}`}>
            <Icon size={10} /> {ST[msg.status].label}
          </span>
          <span className="text-[11px] text-on-surface-variant hidden sm:block">{FD(msg.createdAt)}</span>
          {expanded ? <ChevronUp size={15} className="text-on-surface-variant" /> : <ChevronDown size={15} className="text-on-surface-variant" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-variant space-y-4 pt-4">
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase mb-1.5">Nội dung</p>
            <div className="bg-surface-container p-3 rounded-lg text-[13px] text-on-surface whitespace-pre-line">{msg.message}</div>
          </div>
          {msg.adminReply && (
            <div>
              <p className="text-[11px] font-bold text-green-700 uppercase mb-1.5">Phản hồi đã gửi</p>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-[13px] text-green-900 whitespace-pre-line">{msg.adminReply}</div>
            </div>
          )}
          {msg.status !== "CLOSED" && (
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase mb-1.5">{msg.adminReply ? "Gửi thêm" : "Phản hồi"}</p>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} placeholder={`Nhập phản hồi gửi đến ${msg.email}...`}
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-surface-variant text-[13px] focus:outline-none focus:border-primary resize-none" />
              <div className="flex items-center gap-2 mt-2">
                <button onClick={handleSend} disabled={sending||!reply.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-[12px] font-bold disabled:opacity-50 hover:opacity-90">
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Gửi email phản hồi
                </button>
                {msg.status === "REPLIED" && (
                  <button onClick={() => onClose(msg.id)} className="px-4 py-2 rounded-lg border border-surface-variant text-[12px] font-semibold text-on-surface-variant hover:bg-surface-container">
                    Đóng ticket
                  </button>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5">✉️ Email sẽ được gửi tới <strong>{msg.email}</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminMessagesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [stFilter, setStFilter] = useState("");
  const { data, isLoading } = useQuery<any>({
    queryKey: ["adm-messages", page, stFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), ...(stFilter ? { status: stFilter } : {}) });
      return (await axiosInstance.get(`/admin/messages?${p}`) as any).data;
    },
  });
  const reply = useMutation({
    mutationFn: ({ id, r }: { id: number; r: string }) => axiosInstance.post(`/admin/messages/${id}/reply`, { reply: r }),
    onSuccess: () => { toast.success("Đã gửi phản hồi!"); qc.invalidateQueries({ queryKey: ["adm-messages"] }); },
    onError: (e: any) => toast.error(e?.message),
  });
  const close = useMutation({
    mutationFn: (id: number) => axiosInstance.patch(`/admin/messages/${id}/close`, {}),
    onSuccess: () => { toast.success("Đã đóng ticket"); qc.invalidateQueries({ queryKey: ["adm-messages"] }); },
    onError: (e: any) => toast.error(e?.message),
  });

  const pending = data?.messages?.filter((m: Msg) => m.status === "PENDING").length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2"><MessageCircle size={20} className="text-primary" />Tin nhắn hỗ trợ</h1>
          <p className="text-[12px] text-on-surface-variant">{data?.pagination?.total ?? 0} tin nhắn {pending > 0 && <span className="text-primary font-bold">· {pending} chờ xử lý</span>}</p>
        </div>
        <select value={stFilter} onChange={(e) => { setStFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg bg-surface border border-surface-variant text-[13px] focus:outline-none focus:border-primary">
          <option value="">Tất cả</option><option value="PENDING">Chờ xử lý</option><option value="REPLIED">Đã phản hồi</option><option value="CLOSED">Đã đóng</option>
        </select>
      </div>
      {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div> : (data?.messages?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center py-20 text-on-surface-variant bg-surface-container-lowest border border-surface-variant rounded-xl">
          <MessageCircle size={36} className="mb-2 opacity-30" /><p className="text-[14px]">Không có tin nhắn nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data.messages ?? []).map((msg: Msg) => (
            <MsgRow key={msg.id} msg={msg}
              onReply={(id, r) => reply.mutateAsync({ id, r })}
              onClose={(id) => close.mutate(id)} />
          ))}
        </div>
      )}
      {data?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 rounded-lg border border-surface-variant text-[13px] font-semibold disabled:opacity-40 hover:bg-surface-container">← Trước</button>
          <span className="text-[13px] text-on-surface-variant px-2">{page} / {data.pagination.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pagination.totalPages,p+1))} disabled={page===data.pagination.totalPages} className="px-4 py-2 rounded-lg border border-surface-variant text-[13px] font-semibold disabled:opacity-40 hover:bg-surface-container">Sau →</button>
        </div>
      )}
    </div>
  );
}
