"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Package, ShoppingBag, Newspaper,
  Star, MessageSquare, BarChart3, Trash2, Settings, LogOut,
  Menu, X, Tag, MessageCircle, ChevronRight, Sparkles, Bell,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import NotificationBell from "@/_components/admin/NotificationBell";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package, sep: true },
  { href: "/admin/categories", label: "Danh mục", icon: Tag },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/articles", label: "Bài viết", icon: Newspaper, sep: true },
  { href: "/admin/ai-articles", label: "AI Viết bài", icon: Sparkles },
  { href: "/admin/reviews", label: "Đánh giá", icon: Star },
  { href: "/admin/comments", label: "Bình luận", icon: MessageSquare },
  { href: "/admin/messages", label: "Tin nhắn HT", icon: MessageCircle },
  { href: "/admin/users", label: "Tài khoản", icon: Users, sep: true },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/trash", label: "Thùng rác", icon: Trash2 },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 0); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated()) { router.replace("/login"); return; }
    if (user?.role !== "ADMIN") { toast.error("Không có quyền truy cập"); router.replace("/"); }
  }, [mounted, isAuthenticated, user, router]);

  const handleLogout = async () => {
    try { await axiosInstance.post("/auth/logout", {}); } catch { /**/ }
    finally { logout(); router.push("/login"); }
  };

  if (!mounted) return null;

  const currentLabel = NAV.find((n) => pathname === n.href || (n.href !== "/admin/dashboard" && pathname.startsWith(n.href)))?.label;

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 bottom-0 w-[220px] bg-surface border-r border-surface-variant z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="px-5 py-4 border-b border-surface-variant flex items-center justify-between shrink-0">
          <Link href="/" className="text-[17px] font-bold text-primary tracking-tight">TECHNOLOGY</Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-on-surface-variant"><X size={18} /></button>
        </div>

        <div className="px-4 py-3 border-b border-surface-variant bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2.5">
            {(user as any)?.avatar
              ? <img src={(user as any).avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              : <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[13px] shrink-0">{user?.fullName?.charAt(0).toUpperCase()}</div>
            }
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-on-surface truncate">{user?.fullName}</p>
              <p className="text-[10px] text-primary font-semibold">Quản trị viên</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, sep }) => {
            const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <div key={href}>
                {sep && <div className="h-px bg-surface-variant my-1.5 mx-1" />}
                <Link href={href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${active ? "bg-primary text-on-primary" : "text-on-surface hover:bg-surface-container"}`}>
                  <Icon size={15} className="shrink-0" />
                  <span className="truncate">{label}</span>
                  {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="p-2 border-t border-surface-variant space-y-0.5 shrink-0">
          <Link href="/" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
            ← Về cửa hàng
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-error hover:bg-error-container/20 transition-colors">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-surface border-b border-surface-variant px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="lg:hidden text-on-surface hover:text-primary"><Menu size={22} /></button>
          <div className="flex items-center gap-2 text-[13px] min-w-0 flex-1">
            <span className="text-on-surface-variant hidden sm:block text-[12px]">Admin</span>
            {currentLabel && (
              <><ChevronRight size={12} className="text-on-surface-variant hidden sm:block" />
              <span className="font-bold text-on-surface truncate">{currentLabel}</span></>
            )}
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}
