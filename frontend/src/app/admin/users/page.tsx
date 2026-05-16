"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   Search,
   ShieldCheck,
   User,
   Lock,
   Unlock,
   ChevronLeft,
   ChevronRight,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import type { AdminUser } from "@/types/user.type";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
interface UsersApiResponse {
   users: AdminUser[];
   pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
   };
}

const formatDate = (d: string) =>
   new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   });

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminUsersPage() {
   const queryClient = useQueryClient();
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState("");
   const LIMIT = 10;

   // Fetch danh sách user
   const { data, isLoading } = useQuery<UsersApiResponse>({
      queryKey: ["admin-users", page],
      queryFn: async () => {
         const res = await axiosInstance.get<UsersApiResponse>(
            `/admin/users?page=${page}&limit=${LIMIT}`,
         );
         return res.data;
      },
   });

   // Mutation khóa/mở khóa user
   const toggleMutation = useMutation({
      mutationFn: (userId: number) =>
         axiosInstance.patch(`/admin/users/${userId}/toggle-status`),
      onSuccess: () => {
         toast.success("Cập nhật trạng thái tài khoản thành công");
         queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      },
      onError: () => {
         toast.error("Thao tác thất bại");
      },
   });

   // Filter tìm kiếm phía client (search theo tên/email)
   const filteredUsers =
      data?.users.filter(
         (u) =>
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()),
      ) ?? [];

   return (
      <div className="space-y-section-gap">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-[24px] font-bold text-on-surface">
                  Quản lý Users
               </h1>
               <p className="text-[13px] text-on-surface-variant mt-1">
                  Tổng {data?.pagination.total ?? 0} tài khoản
               </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
               <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
               />
               <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-full pl-9 pr-4 py-2 text-[13px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
               />
            </div>
         </div>

         {/* Table */}
         <div className="bg-surface-container-lowest border border-surface-variant rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
               <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                     <thead>
                        <tr className="bg-surface-container-low border-b border-surface-variant">
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              ID
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Người dùng
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Số điện thoại
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Quyền
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Đơn hàng
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Ngày tạo
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Trạng thái
                           </th>
                           <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">
                              Thao tác
                           </th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-variant">
                        {filteredUsers.map((user) => (
                           <tr
                              key={user.id}
                              className={`hover:bg-surface-container-low transition-colors ${
                                 !user.isActive ? "opacity-60" : ""
                              }`}
                           >
                              <td className="px-4 py-3 font-bold text-on-surface-variant">
                                 #{user.id}
                              </td>
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                       <User
                                          size={14}
                                          className="text-primary"
                                       />
                                    </div>
                                    <div>
                                       <p className="font-semibold text-on-surface">
                                          {user.fullName}
                                       </p>
                                       <p className="text-[11px] text-on-surface-variant">
                                          {user.email}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant">
                                 {user.phone ?? "—"}
                              </td>
                              <td className="px-4 py-3">
                                 <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                       user.role === "ADMIN"
                                          ? "bg-primary text-on-primary"
                                          : "bg-surface-container text-on-surface-variant"
                                    }`}
                                 >
                                    <ShieldCheck size={11} />
                                    {user.role}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-center font-semibold text-on-surface">
                                 {user._count.orders}
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant">
                                 {formatDate(user.createdAt)}
                              </td>
                              <td className="px-4 py-3">
                                 <span
                                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                       user.isActive
                                          ? "bg-green-100 text-green-700"
                                          : "bg-error-container text-on-error-container"
                                    }`}
                                 >
                                    {user.isActive ? "Hoạt động" : "Đã khóa"}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                 <button
                                    onClick={() =>
                                       toggleMutation.mutate(user.id)
                                    }
                                    disabled={
                                       toggleMutation.isPending ||
                                       user.role === "ADMIN"
                                    }
                                    title={
                                       user.role === "ADMIN"
                                          ? "Không thể khóa Admin"
                                          : user.isActive
                                            ? "Khóa tài khoản"
                                            : "Mở khóa tài khoản"
                                    }
                                    className={`p-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                       user.isActive
                                          ? "text-error hover:bg-error-container/30"
                                          : "text-green-600 hover:bg-green-100"
                                    }`}
                                 >
                                    {user.isActive ? (
                                       <Lock size={16} />
                                    ) : (
                                       <Unlock size={16} />
                                    )}
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
               <div className="px-4 py-3 border-t border-surface-variant flex items-center justify-between">
                  <p className="text-[12px] text-on-surface-variant">
                     Trang {data.pagination.page} / {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                     <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded border border-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
                     >
                        <ChevronLeft size={16} />
                     </button>
                     <button
                        onClick={() =>
                           setPage((p) =>
                              Math.min(data.pagination.totalPages, p + 1),
                           )
                        }
                        disabled={page === data.pagination.totalPages}
                        className="p-1.5 rounded border border-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
                     >
                        <ChevronRight size={16} />
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
