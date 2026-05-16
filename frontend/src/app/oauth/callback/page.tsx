"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// 1. Tách logic xử lý URL vào một component con
function CallbackHandler() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const setLogin = useAuthStore((s) => s.login);

   useEffect(() => {
      const accessToken = searchParams.get("access_token");
      const userStr = searchParams.get("user");

      if (!accessToken || !userStr) {
         toast.error("Đăng nhập Google thất bại");
         router.replace("/login");
         return;
      }

      try {
         const user = JSON.parse(decodeURIComponent(userStr)) as {
            id: number;
            fullName: string;
            email: string;
            role: string;
            avatar?: string;
         };
         setLogin(user, accessToken);
         toast.success(`Chào mừng ${user.fullName}!`);
         router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/");
      } catch {
         toast.error("Xử lý đăng nhập thất bại");
         router.replace("/login");
      }
   }, [searchParams, setLogin, router]);

   return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-container-lowest">
         <Loader2 size={40} className="animate-spin text-primary" />
         <p className="text-[14px] font-semibold text-on-surface-variant">
            Đang xử lý đăng nhập Google...
         </p>
      </div>
   );
}

// 2. Component chính bọc Suspense
export default function OAuthCallbackPage() {
   return (
      <Suspense
         fallback={
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-container-lowest">
               <Loader2
                  size={40}
                  className="animate-spin text-primary opacity-50"
               />
               <p className="text-[14px] font-semibold text-on-surface-variant">
                  Đang tải...
               </p>
            </div>
         }
      >
         <CallbackHandler />
      </Suspense>
   );
}
