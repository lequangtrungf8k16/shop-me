"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
   User,
   Phone,
   Mail,
   Package,
   ShieldCheck,
   Save,
   ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import type { UserProfile } from "@/types/user.type";

// Bản đồ màu/nhãn cho từng trạng thái đơn hàng
const STATUS_CONFIG = {
   PENDING: {
      label: "Chờ xác nhận",
      color: "bg-secondary-container text-on-secondary-container",
   },
   PROCESSING: {
      label: "Đang xử lý",
      color: "bg-tertiary-container text-on-tertiary",
   },
   SHIPPED: {
      label: "Đang giao",
      color: "bg-tertiary-fixed text-on-tertiary-fixed",
   },
   DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-700" },
   CANCELLED: {
      label: "Đã hủy",
      color: "bg-error-container text-on-error-container",
   },
} as const;

const formatPrice = (price: string | number) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(Number(price));

const formatDate = (date: string) =>
   new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   });

export default function ProfilePage() {
   const router = useRouter();
   const queryClient = useQueryClient();
   const { isAuthenticated, user: authUser } = useAuthStore();

   // Kiểm tra đăng nhập — chạy sau khi mount để tránh hydration error
   useEffect(() => {
      if (!isAuthenticated()) {
         router.replace("/login");
      }
   }, [isAuthenticated, router]);

   // Fetch profile từ API (dùng React Query để cache)
   const { data: profile, isLoading } = useQuery<UserProfile>({
      queryKey: ["user-profile"],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: UserProfile }>(
            "/users/profile",
         );
         return res.data;
      },
      enabled: isAuthenticated(),
   });

   // State form cập nhật
   const [formData, setFormData] = useState({
      fullName: "",
      phone: "",
   });

   // Đồng bộ form khi data load xong
   useEffect(() => {
      if (profile) {
         const timer = setTimeout(() =>
            setFormData({
               fullName: profile.fullName,
               phone: profile.phone ?? "",
            }),
         );
         return () => clearTimeout(timer);
      }
   }, [profile]);

   // Mutation cập nhật profile
   const updateMutation = useMutation({
      mutationFn: (data: typeof formData) =>
         axiosInstance.put("/users/profile", data),
      onSuccess: () => {
         toast.success("Cập nhật thông tin thành công!");
         queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      },
      onError: (err: { message?: string }) => {
         toast.error(err.message ?? "Cập nhật thất bại");
      },
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateMutation.mutate(formData);
   };

   if (isLoading || !profile) {
      return (
         <div className="max-w-container-max mx-auto px-margin-page py-section-gap">
            <div className="animate-pulse space-y-4">
               <div className="h-8 bg-surface-container rounded w-48" />
               <div className="h-64 bg-surface-container rounded" />
            </div>
         </div>
      );
   }

   return (
      <div className="max-w-container-max mx-auto px-margin-page py-section-gap">
         {/* Page Header */}
         <div className="mb-section-gap">
            <h1 className="text-[24px] font-bold text-on-surface">
               Tài khoản của tôi
            </h1>
            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mt-1">
               <Link href="/" className="hover:text-primary">
                  Trang chủ
               </Link>
               <ChevronRight size={14} />
               <span>Tài khoản</span>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* LEFT — Sidebar thông tin */}
            <div className="lg:col-span-4 space-y-gutter">
               {/* Avatar Card */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 text-center shadow-sm">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                     <User size={40} className="text-primary" />
                  </div>
                  <h2 className="text-[18px] font-bold text-on-surface">
                     {profile.fullName}
                  </h2>
                  <p className="text-[13px] text-on-surface-variant mt-1">
                     {profile.email}
                  </p>
                  <div className="mt-3 flex justify-center gap-2">
                     <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full ${
                           profile.role === "ADMIN"
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container text-on-surface-variant"
                        }`}
                     >
                        <ShieldCheck size={12} />
                        {profile.role === "ADMIN"
                           ? "Quản trị viên"
                           : "Thành viên"}
                     </span>
                  </div>
               </div>

               {/* Stats Card */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-4 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-on-surface-variant uppercase mb-3">
                     Thống kê
                  </h3>
                  <div className="flex justify-around">
                     <div className="text-center">
                        <p className="text-[24px] font-bold text-primary">
                           {profile.orders.length}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                           Đơn hàng
                        </p>
                     </div>
                     <div className="text-center">
                        <p className="text-[24px] font-bold text-primary">
                           {
                              profile.orders.filter(
                                 (o) => o.status === "DELIVERED",
                              ).length
                           }
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                           Đã nhận
                        </p>
                     </div>
                     <div className="text-center">
                        <p className="text-[24px] font-bold text-primary">
                           {profile.orders.reduce(
                              (sum, o) =>
                                 sum +
                                 o.orderItems.reduce(
                                    (s, i) => s + i.quantity,
                                    0,
                                 ),
                              0,
                           )}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">
                           Sản phẩm
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* RIGHT — Tabs nội dung */}
            <div className="lg:col-span-8 space-y-gutter">
               {/* Form Cập nhật */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-surface-variant">
                     <h2 className="text-[16px] font-semibold text-on-surface">
                        Thông tin cá nhân
                     </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                     <div>
                        <label className="block text-[12px] font-bold text-on-surface-variant uppercase mb-1">
                           Họ và tên
                        </label>
                        <div className="relative">
                           <User
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                           />
                           <input
                              type="text"
                              value={formData.fullName}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    fullName: e.target.value,
                                 })
                              }
                              className="w-full bg-surface border border-outline-variant rounded pl-9 pr-4 py-2.5 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[12px] font-bold text-on-surface-variant uppercase mb-1">
                           Email (không thể thay đổi)
                        </label>
                        <div className="relative">
                           <Mail
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                           />
                           <input
                              type="email"
                              value={profile.email}
                              disabled
                              className="w-full bg-surface-container border border-outline-variant/50 rounded pl-9 pr-4 py-2.5 text-[14px] text-on-surface-variant cursor-not-allowed"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[12px] font-bold text-on-surface-variant uppercase mb-1">
                           Số điện thoại
                        </label>
                        <div className="relative">
                           <Phone
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                           />
                           <input
                              type="tel"
                              placeholder="09xx xxx xxx"
                              value={formData.phone}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                 })
                              }
                              className="w-full bg-surface border border-outline-variant rounded pl-9 pr-4 py-2.5 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                           />
                        </div>
                     </div>

                     <div className="pt-2">
                        <button
                           type="submit"
                           disabled={updateMutation.isPending}
                           className="flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-2.5 rounded hover:bg-primary-container transition-colors disabled:opacity-60"
                        >
                           <Save size={16} />
                           {updateMutation.isPending
                              ? "Đang lưu..."
                              : "Lưu thay đổi"}
                        </button>
                     </div>
                  </form>
               </div>

               {/* Lịch sử đơn hàng */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-surface-variant flex items-center justify-between">
                     <h2 className="text-[16px] font-semibold text-on-surface flex items-center gap-2">
                        <Package size={18} /> Lịch sử đơn hàng
                     </h2>
                     <span className="text-[12px] text-on-surface-variant">
                        {profile.orders.length} đơn gần nhất
                     </span>
                  </div>

                  {profile.orders.length === 0 ? (
                     <div className="p-12 text-center">
                        <Package
                           size={48}
                           className="text-outline-variant mx-auto mb-3"
                        />
                        <p className="text-[14px] text-on-surface-variant">
                           Bạn chưa có đơn hàng nào.
                        </p>
                        <Link
                           href="/"
                           className="mt-4 inline-block text-primary font-bold text-[14px] hover:underline"
                        >
                           Mua sắm ngay →
                        </Link>
                     </div>
                  ) : (
                     <div className="divide-y divide-surface-variant">
                        {profile.orders.map((order) => {
                           const config = STATUS_CONFIG[order.status];
                           return (
                              <Link
                                 key={order.id}
                                 href={`/orders/${order.id}`}
                                 className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors"
                              >
                                 <div>
                                    <p className="text-[14px] font-semibold text-on-surface">
                                       Đơn hàng #{order.id}
                                    </p>
                                    <p className="text-[12px] text-on-surface-variant mt-0.5">
                                       {formatDate(order.createdAt)} ·{" "}
                                       {order.orderItems.reduce(
                                          (s, i) => s + i.quantity,
                                          0,
                                       )}{" "}
                                       sản phẩm
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <span
                                       className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${config.color}`}
                                    >
                                       {config.label}
                                    </span>
                                    <span className="text-[14px] font-bold text-primary">
                                       {formatPrice(order.totalAmount)}
                                    </span>
                                    <ChevronRight
                                       size={16}
                                       className="text-outline"
                                    />
                                 </div>
                              </Link>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
