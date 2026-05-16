"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, ShoppingBag, MessageSquare, Info, X, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import axiosInstance from "@/lib/axios";
import { io, type Socket } from "socket.io-client";

interface AdminNotif { type: string; title: string; message: string; metadata?: Record<string, unknown>; createdAt: string; }

const ICONS: Record<string, React.ElementType> = {
  ORDER_PLACED: ShoppingBag, COMMENT_REPLY: MessageSquare,
  CONTACT_MESSAGE: MessageSquare, ORDER_STATUS_CHANGED: ShoppingBag,
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api").replace("/api", "");

const FMT = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "Vừa xong";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  return new Date(d).toLocaleDateString("vi-VN");
};

export default function NotificationBell() {
  const { token } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!token) return;
    const socket = io(API_BASE, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => socket.emit("join_admin_room"));
    socket.on("notification:admin", (data: AdminNotif) => {
      setNotifs((prev) => [data, ...prev].slice(0, 50));
      setUnread((n) => n + 1);
    });
    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [token]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/admin/dashboard") as any;
      const recent: AdminNotif[] = (res.data?.recentOrders ?? []).slice(0, 5).map((o: any) => ({
        type: "ORDER_PLACED", title: "Đơn hàng mới",
        message: `${o.customerName} — ${new Intl.NumberFormat("vi-VN").format(Number(o.totalAmount))}₫`,
        metadata: { orderId: o.id }, createdAt: o.createdAt,
      }));
      setNotifs((prev) => {
        const keys = new Set(prev.map((n) => n.createdAt + n.message));
        return [...prev, ...recent.filter((r) => !keys.has(r.createdAt + r.message))];
      });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  return (
    <div ref={panelRef} className="relative">
      <button onClick={() => { setOpen((v) => !v); if (!open) setUnread(0); }}
        className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-surface-variant rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-variant">
            <span className="text-[13px] font-bold text-on-surface">Thông báo Admin</span>
            <div className="flex items-center gap-1">
              {notifs.length > 0 && (
                <button onClick={() => { setNotifs([]); setUnread(0); }}
                  className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-primary px-2 py-1 rounded">
                  <CheckCheck size={12} /> Xóa tất cả
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface"><X size={14} /></button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-surface-variant">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant">
                <Bell size={28} className="mb-2 opacity-30" />
                <p className="text-[12px]">Chưa có thông báo</p>
              </div>
            ) : notifs.map((n, i) => {
              const Icon = ICONS[n.type] ?? Info;
              return (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-on-surface">{n.title}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-outline mt-1">{FMT(n.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
