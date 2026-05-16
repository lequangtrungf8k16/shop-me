"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   User,
   Mail,
   Phone,
   Lock,
   EyeOff,
   Eye,
   ArrowRight,
   Cpu,
   Gauge,
   ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function RegisterPage() {
   const router = useRouter();
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      terms: false,
   });

   const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.password !== formData.confirm_password) {
         return toast.error("Mật khẩu xác nhận không khớp!");
      }
      if (!formData.terms) {
         return toast.error("Vui lòng đồng ý với điều khoản dịch vụ!");
      }

      setIsLoading(true);
      try {
         await axiosInstance.post("/auth/register", formData);
         toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
         router.push("/login");
      } catch (error: unknown) {
         const err = error as { message?: string };
         toast.error(err.message || "Đăng ký thất bại");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <main className="min-h-screen flex w-full bg-background">
         {/* CỘT TRÁI - BRANDING */}
         <div className="hidden lg:flex w-1/2 relative bg-surface-container-low overflow-hidden items-center justify-center border-r border-outline-variant/30">
            <div className="absolute inset-0 z-0">
               <Image
                  src="https://picsum.photos/1080/1920?technology"
                  alt="Tech Background"
                  fill
                  className="object-cover opacity-20 grayscale"
               />
               <div className="absolute inset-0 bg-linear-to-r from-background via-background/90 to-background/50"></div>
            </div>

            <div className="relative z-10 p-12 flex flex-col items-start justify-center h-full max-w-lg mx-auto">
               <h1 className="text-[48px] font-bold text-on-surface mb-6 leading-tight">
                  Khởi tạo
                  <br />
                  <span className="text-primary">Tài khoản</span> Hệ thống.
               </h1>
               <p className="text-[16px] text-on-surface-variant mb-12">
                  Truy cập vào mạng lưới thiết bị hiệu năng cao. Quản lý linh
                  kiện, theo dõi đơn hàng và tùy chỉnh cấu hình không giới hạn
                  của TECHNOLOGY.
               </p>

               <div className="space-y-4 w-full">
                  <div className="flex items-center gap-4 bg-surface p-4 rounded border border-outline-variant/50 shadow-sm">
                     <Cpu className="text-primary" size={24} />
                     <span className="text-[14px] font-medium text-on-surface">
                        Lưu trữ cấu hình Build PC tùy chỉnh
                     </span>
                  </div>
                  <div className="flex items-center gap-4 bg-surface p-4 rounded border border-outline-variant/50 shadow-sm">
                     <Gauge className="text-primary" size={24} />
                     <span className="text-[14px] font-medium text-on-surface">
                        Theo dõi đơn hàng thời gian thực
                     </span>
                  </div>
                  <div className="flex items-center gap-4 bg-surface p-4 rounded border border-outline-variant/50 shadow-sm">
                     <ShieldCheck className="text-primary" size={24} />
                     <span className="text-[14px] font-medium text-on-surface">
                        Bảo mật cấp độ doanh nghiệp
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {/* CỘT PHẢI - FORM */}
         <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
            <div className="w-full max-w-md">
               <div className="mb-8 text-center">
                  <h2 className="text-[28px] font-bold text-on-surface mb-2">
                     Đăng ký tài khoản
                  </h2>
                  <p className="text-[14px] text-on-surface-variant">
                     Nhập thông tin bên dưới để thiết lập tài khoản.
                  </p>
               </div>

               <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                     <label className="block text-[12px] font-bold text-on-surface mb-1 uppercase">
                        Họ và tên
                     </label>
                     <div className="relative">
                        <User
                           size={18}
                           className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                        />
                        <input
                           required
                           type="text"
                           placeholder="Nguyễn Văn A"
                           value={formData.fullName}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 fullName: e.target.value,
                              })
                           }
                           className="w-full bg-surface border border-outline-variant rounded text-on-surface pl-10 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-[14px]"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[12px] font-bold text-on-surface mb-1 uppercase">
                        Địa chỉ Email
                     </label>
                     <div className="relative">
                        <Mail
                           size={18}
                           className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                        />
                        <input
                           required
                           type="email"
                           placeholder="email@technology.com"
                           value={formData.email}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 email: e.target.value,
                              })
                           }
                           className="w-full bg-surface border border-outline-variant rounded text-on-surface pl-10 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-[14px]"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[12px] font-bold text-on-surface mb-1 uppercase">
                        Số điện thoại
                     </label>
                     <div className="relative">
                        <Phone
                           size={18}
                           className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                        />
                        <input
                           required
                           type="tel"
                           placeholder="09xx xxx xxx"
                           value={formData.phone}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 phone: e.target.value,
                              })
                           }
                           className="w-full bg-surface border border-outline-variant rounded text-on-surface pl-10 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-[14px]"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[12px] font-bold text-on-surface mb-1 uppercase">
                        Mật khẩu
                     </label>
                     <div className="relative">
                        <Lock
                           size={18}
                           className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
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
                           className="w-full bg-surface border border-outline-variant rounded text-on-surface pl-10 pr-10 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-[14px]"
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

                  <div>
                     <label className="block text-[12px] font-bold text-on-surface mb-1 uppercase">
                        Xác nhận mật khẩu
                     </label>
                     <div className="relative">
                        <Lock
                           size={18}
                           className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                        />
                        <input
                           required
                           type="password"
                           placeholder="••••••••"
                           value={formData.confirm_password}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 confirm_password: e.target.value,
                              })
                           }
                           className="w-full bg-surface border border-outline-variant rounded text-on-surface pl-10 pr-10 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-[14px]"
                        />
                     </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <input
                        type="checkbox"
                        id="terms"
                        checked={formData.terms}
                        onChange={(e) =>
                           setFormData({ ...formData, terms: e.target.checked })
                        }
                        className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                     />
                     <label
                        htmlFor="terms"
                        className="text-[13px] text-on-surface-variant"
                     >
                        Tôi đồng ý với{" "}
                        <Link
                           href="#"
                           className="text-primary font-bold hover:underline"
                        >
                           Điều khoản Dịch vụ
                        </Link>{" "}
                        và{" "}
                        <Link
                           href="#"
                           className="text-primary font-bold hover:underline"
                        >
                           Chính sách Bảo mật
                        </Link>{" "}
                        của TECHNOLOGY.
                     </label>
                  </div>

                  <button
                     disabled={isLoading}
                     type="submit"
                     className="w-full py-3 px-6 bg-primary hover:brightness-110 text-white font-bold rounded flex items-center justify-center gap-2 shadow-md"
                  >
                     {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ TÀI KHOẢN"}
                     {!isLoading && <ArrowRight size={18} />}
                  </button>
               </form>

               <div className="mt-8 text-center pt-6 border-t border-outline-variant/30 text-[14px]">
                  <span className="text-on-surface-variant">
                     Đã có tài khoản?
                  </span>
                  <Link
                     href="/login"
                     className="text-primary font-bold hover:underline ml-2"
                  >
                     Đăng nhập ngay
                  </Link>
               </div>
            </div>
         </div>
      </main>
   );
}
