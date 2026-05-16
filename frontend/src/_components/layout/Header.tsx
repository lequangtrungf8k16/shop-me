"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   Menu,
   Search,
   User,
   ShoppingCart,
   Laptop,
   Cpu,
   Monitor,
   Keyboard,
   LogOut,
   Settings,
   LayoutDashboard,
   ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useUIStore } from "@/store/ui.store";

export default function Header() {
   const router = useRouter();
   const items = useCartStore((state) => state.items);
   const { user, logout, isAuthenticated } = useAuthStore();

   const [mounted, setMounted] = useState(false);
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const openSidebar = useUIStore((state) => state.openSidebar);

   useEffect(() => {
      const timer = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(timer);
   }, []);

   // Đóng dropdown khi click ra ngoài
   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(e.target as Node)
         ) {
            setDropdownOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const cartCount = mounted
      ? items.reduce((total, item) => total + item.quantity, 0)
      : 0;
   const loggedIn = mounted ? isAuthenticated() : false;

   const handleLogout = async () => {
      try {
         const refreshToken = null; // Nếu có lưu refresh token thì truyền vào
         await axiosInstance.post("/auth/logout", { refreshToken });
      } catch {
         // Bỏ qua lỗi network khi logout
      } finally {
         logout();
         toast.success("Đã đăng xuất thành công");
         router.push("/login");
         setDropdownOpen(false);
      }
   };

   return (
      <header className="bg-surface border-b border-surface-variant shadow-sm z-50 sticky top-0">
         <div className="flex flex-col">
            {/* Top bar */}
            <Link
               href="/category/laptop-gaming"
               className="bg-primary text-on-primary py-2 px-margin-page text-center text-[12px] font-semibold cursor-pointer hover:bg-primary-container transition-colors"
            >
               Tặng ngay Ba lô khi mua Laptop Gaming!
            </Link>

            {/* Main Nav */}
            <div className="flex justify-between items-center w-full px-margin-page py-stack-default max-w-container-max mx-auto">
               {/* Left: Brand */}
               <div className="flex items-center gap-6">
                  <Link
                     href="/"
                     className="text-[24px] leading-[32px] font-bold text-primary tracking-tight"
                  >
                     TECHNOLOGY
                  </Link>
                  <button
                     onClick={openSidebar}
                     className="hidden lg:flex items-center gap-1 bg-surface-container hover:bg-surface-container-high px-3 py-2 rounded text-on-surface text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                     <Menu size={20} />
                     Danh mục
                  </button>
               </div>

               {/* Center: Search */}
               <div className="flex-1 max-w-125 px-4">
                  <div className="relative w-full">
                     <input
                        type="text"
                        className="w-full bg-surface-container-lowest border border-outline rounded-full py-2 pl-4 pr-10 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                        placeholder="Bạn cần tìm gì hôm nay?"
                     />
                     <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary flex items-center justify-center cursor-pointer">
                        <Search size={20} />
                     </button>
                  </div>
               </div>

               {/* Right: Actions */}
               <div className="flex items-center gap-4">
                  {/* USER AUTH AREA */}
                  {loggedIn && user ? (
                     <div className="relative" ref={dropdownRef}>
                        <button
                           onClick={() => setDropdownOpen(!dropdownOpen)}
                           className="flex flex-col items-center text-on-surface hover:text-primary transition-colors"
                        >
                           <div className="flex items-center gap-1">
                              <User size={24} strokeWidth={1.5} />
                              <ChevronDown
                                 size={14}
                                 className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                              />
                           </div>
                           <span className="text-[10px] font-semibold mt-0.5 max-w-20 truncate">
                              {user.fullName.split(" ").pop()}
                           </span>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                           <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-surface-variant rounded-lg shadow-lg overflow-hidden z-50">
                              {/* User Info Header */}
                              <div className="px-4 py-3 border-b border-surface-variant bg-surface-container-low">
                                 <p className="text-[13px] font-bold text-on-surface truncate">
                                    {user.fullName}
                                 </p>
                                 <p className="text-[11px] text-on-surface-variant truncate">
                                    {user.email}
                                 </p>
                              </div>

                              <Link
                                 href="/profile"
                                 onClick={() => setDropdownOpen(false)}
                                 className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
                              >
                                 <Settings size={16} /> Tài khoản của tôi
                              </Link>

                              {user.role === "ADMIN" && (
                                 <Link
                                    href="/admin/dashboard"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-primary font-semibold hover:bg-surface-container transition-colors"
                                 >
                                    <LayoutDashboard size={16} /> Quản trị hệ
                                    thống
                                 </Link>
                              )}

                              <div className="border-t border-surface-variant">
                                 <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-error hover:bg-error-container/30 transition-colors"
                                 >
                                    <LogOut size={16} /> Đăng xuất
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  ) : (
                     <Link
                        href="/login"
                        className="flex flex-col items-center text-on-surface hover:text-primary transition-colors"
                     >
                        <User size={24} strokeWidth={1.5} />
                        <span className="text-[10px] font-semibold mt-0.5">
                           Đăng nhập
                        </span>
                     </Link>
                  )}

                  {/* GIỎ HÀNG */}
                  <Link
                     href="/cart"
                     className="flex flex-col items-center text-on-surface hover:text-primary transition-colors relative"
                  >
                     <ShoppingCart size={24} strokeWidth={1.5} />
                     {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-secondary-container text-on-secondary-container text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                           {cartCount > 99 ? "99+" : cartCount}
                        </span>
                     )}
                     <span className="text-[10px] font-semibold mt-0.5">
                        Giỏ hàng
                     </span>
                  </Link>
               </div>
            </div>

            {/* Secondary Nav */}
            <div className="border-t border-surface-variant hidden md:block">
               <nav className="flex justify-center items-center gap-6 py-2 max-w-container-max mx-auto px-margin-page">
                  <Link
                     href="/category/laptop-gaming"
                     className="text-[12px] font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                  >
                     <Laptop size={18} /> Laptops
                  </Link>
                  <Link
                     href="/category/linh-kien-pc"
                     className="text-[12px] font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                  >
                     <Cpu size={18} /> Linh kiện PC
                  </Link>
                  <Link
                     href="/category/man-hinh"
                     className="text-[12px] font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                  >
                     <Monitor size={18} /> Màn hình
                  </Link>
                  <Link
                     href="/category/ban-phim-co"
                     className="text-[12px] font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                  >
                     <Keyboard size={18} /> Bàn phím cơ
                  </Link>
               </nav>
            </div>
         </div>
      </header>
   );
}
