"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Send, Loader2, CheckCircle, Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: (user as any)?.fullName ?? "",
    email: (user as any)?.email ?? "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) { toast.error("Vui lòng điền đầy đủ"); return; }
    setLoading(true);
    try {
      await axiosInstance.post("/contact", form);
      setSent(true);
      toast.success("Đã gửi! Chúng tôi sẽ phản hồi trong 24h.");
    } catch (e: any) { toast.error(e?.message ?? "Gửi thất bại"); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-[22px] font-bold text-on-surface">Gửi thành công!</h2>
      <p className="text-[14px] text-on-surface-variant">
        Chúng tôi sẽ phản hồi tới <strong>{form.email}</strong> trong 24 giờ.
      </p>
      <button onClick={() => { setSent(false); setForm((f) => ({ ...f, subject: "", message: "" })); }}
        className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-[13px] font-bold hover:opacity-90">
        Gửi tin nhắn khác
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-[28px] font-bold text-on-surface">Liên hệ hỗ trợ</h1>
        <p className="text-[14px] text-on-surface-variant mt-2">Luôn sẵn sàng hỗ trợ bạn</p>
      </div>
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          {[
            { icon: Phone, title: "Hotline", value: "1900 0000", sub: "8:00 – 21:00" },
            { icon: Mail, title: "Email", value: "support@technology.shop", sub: "Phản hồi trong 24h" },
            { icon: MapPin, title: "Địa chỉ", value: "Hà Nội, Việt Nam", sub: "Showroom & Bảo hành" },
          ].map(({ icon: Icon, title, value, sub }) => (
            <div key={title} className="flex items-start gap-3 p-4 bg-surface-container-lowest border border-surface-variant rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase">{title}</p>
                <p className="text-[13px] font-semibold text-on-surface mt-0.5">{value}</p>
                <p className="text-[11px] text-on-surface-variant">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-3 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-on-surface flex items-center gap-2 mb-5">
            <MessageCircle size={18} className="text-primary" /> Gửi tin nhắn
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[["name","Họ tên *","text","Nguyễn Văn A"],["email","Email *","email","email@example.com"]].map(([k,l,t,p]) => (
                <div key={k}>
                  <label className="block text-[12px] font-semibold text-on-surface mb-1.5">{l}</label>
                  <input type={t} required value={form[k as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} placeholder={p}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-surface-variant text-[13px] focus:outline-none focus:border-primary placeholder:text-outline" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-on-surface mb-1.5">Chủ đề *</label>
              <input type="text" required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="VD: Hỏi về chính sách đổi trả"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-surface-variant text-[13px] focus:outline-none focus:border-primary placeholder:text-outline" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-on-surface mb-1.5">Nội dung *</label>
              <textarea required rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Mô tả chi tiết..."
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-surface-variant text-[13px] focus:outline-none focus:border-primary placeholder:text-outline resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary font-bold text-[14px] disabled:opacity-50 hover:opacity-90">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Đang gửi..." : "Gửi tin nhắn"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
