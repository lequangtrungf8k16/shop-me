"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, EyeOff, Eye, LogIn } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const API_BASE = (
   process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"
).replace("/api", "");

// 1. Tách phần nội dung có chứa useSearchParams ra một component con
function LoginContent() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const setLogin = useAuthStore((s) => s.login);

   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [formData, setFormData] = useState({ email: "", password: "" });

   useEffect(() => {
      const error = searchParams.get("error");
      if (error === "oauth_cancelled")
         toast.error("Đăng nhập Google đã bị hủy");
      else if (error) toast.error(decodeURIComponent(error));
   }, [searchParams]);

   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         const res = (await axiosInstance.post("/auth/login", formData)) as {
            data: {
               accessToken: string;
               refreshToken: string;
               user: {
                  id: number;
                  fullName: string;
                  email: string;
                  role: string;
               };
            };
         };
         const { accessToken, user } = res.data;

         console.log("🕵️ Dữ liệu User từ API:", user);

         setLogin(user, accessToken);
         toast.success(`Chào mừng ${user.fullName}!`);

         if (user?.role?.toUpperCase() === "ADMIN") {
            router.push("/admin/dashboard");
         } else {
            router.push("/");
         }

         router.push(user.role === "ADMIN" ? "/admin/dashboard" : "/");
      } catch (error: any) {
         console.error("❌ Lỗi khi đăng nhập:", error);
         toast.error(error?.message ?? "Đăng nhập thất bại");
      } finally {
         setIsLoading(false);
      }
   };

   const handleGoogleLogin = () => {
      window.location.href = `${API_BASE}/api/auth/google`;
   };

   return (
      <main className="w-full max-w-110 px-margin-page">
         <div className="text-center mb-section-gap">
            <h1 className="text-[36px] font-bold text-primary tracking-tight">
               TECHNOLOGY
            </h1>
            <p className="text-[12px] text-on-surface-variant mt-1 uppercase opacity-80 font-semibold">
               Đăng nhập tài khoản
            </p>
         </div>

         <div className="bg-surface border border-outline-variant/30 rounded-xl p-8 shadow-sm">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
               <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-on-surface-variant">
                     Email
                  </label>
                  <div className="relative group">
                     <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                     />
                     <input
                        required
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                           setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-surface-container-lowest border border-outline focus:border-primary focus:ring-1 focus:ring-primary rounded pl-10 pr-4 py-3 text-[14px] outline-none transition-all"
                     />
                  </div>
               </div>

               <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                     <label className="text-[12px] font-semibold text-on-surface-variant">
                        Mật khẩu
                     </label>
                  </div>
                  <div className="relative group">
                     <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors"
                     />
                     <input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              password: e.target.value,
                           })
                        }
                        className="w-full bg-surface-container-lowest border border-outline focus:border-primary focus:ring-1 focus:ring-primary rounded pl-10 pr-10 py-3 text-[14px] outline-none transition-all"
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                     >
                        {showPassword ? (
                           <Eye size={18} />
                        ) : (
                           <EyeOff size={18} />
                        )}
                     </button>
                  </div>
               </div>

               <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full mt-2 bg-primary text-on-primary hover:opacity-90 font-bold py-3 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60"
               >
                  {isLoading ? (
                     "Đang xác thực..."
                  ) : (
                     <>
                        <LogIn size={18} /> Đăng nhập
                     </>
                  )}
               </button>
            </form>

            <div className="flex items-center gap-3 my-5">
               <div className="h-px bg-outline-variant/50 flex-1" />
               <span className="text-[12px] font-semibold text-outline">
                  HOẶC
               </span>
               <div className="h-px bg-outline-variant/50 flex-1" />
            </div>

            <button
               onClick={handleGoogleLogin}
               className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline hover:border-primary bg-surface-container-lowest hover:bg-surface-container rounded-lg transition-colors"
            >
               <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                     fill="#4285F4"
                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                     fill="#34A853"
                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                     fill="#FBBC05"
                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                     fill="#EA4335"
                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
               </svg>
               <span className="text-[13px] font-semibold text-on-surface">
                  Tiếp tục với Google
               </span>
            </button>
         </div>

         <p className="mt-6 text-center text-[14px] text-on-surface-variant">
            Chưa có tài khoản?{" "}
            <Link
               href="/register"
               className="text-primary font-bold hover:underline"
            >
               Đăng ký ngay
            </Link>
         </p>
      </main>
   );
}

// 2. Export component chính và bọc LoginContent bằng thẻ Suspense
export default function LoginPage() {
   return (
      <div className="bg-surface-container-lowest text-on-surface min-h-screen flex items-center justify-center">
         <Suspense
            fallback={
               <div className="animate-pulse">
                  Đang tải giao diện đăng nhập...
               </div>
            }
         >
            <LoginContent />
         </Suspense>
      </div>
   );
}
