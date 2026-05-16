"use client";

import { useQuery } from "@tanstack/react-query";
import {
   Users,
   Package,
   ShoppingBag,
   TrendingUp,
   Clock,
   CheckCircle2,
   XCircle,
} from "lucide-react";
import axiosInstance from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────
interface DashboardStats {
   totalUsers: number;
   totalProducts: number;
   totalOrders: number;
   totalRevenue: number | string;
   recentOrders: {
      id: number;
      customerName: string;
      totalAmount: string;
      status: string;
      paymentMethod: string;
      createdAt: string;
   }[];
   ordersByStatus: { status: string; _count: { id: number } }[];
}

const STATUS_LABEL: Record<string, string> = {
   PENDING: "Chờ xác nhận",
   PROCESSING: "Đang xử lý",
   SHIPPED: "Đang giao",
   DELIVERED: "Đã giao",
   CANCELLED: "Đã hủy",
};

const formatPrice = (v: number | string) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(Number(v));

const formatDate = (d: string) =>
   new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
   icon: Icon,
   label,
   value,
   color,
}: {
   icon: React.ElementType;
   label: string;
   value: string;
   color: string;
}) {
   return (
      <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-sm flex items-center gap-4">
         <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}
         >
            <Icon size={22} />
         </div>
         <div>
            <p className="text-[12px] text-on-surface-variant uppercase font-semibold">
               {label}
            </p>
            <p className="text-[22px] font-bold text-on-surface leading-tight">
               {value}
            </p>
         </div>
      </div>
   );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function DashboardPage() {
   const { data, isLoading, isError } = useQuery<DashboardStats>({
      queryKey: ["admin-dashboard"],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: DashboardStats }>(
            "/admin/dashboard",
         );
         return res.data;
      },
      refetchInterval: 30000, // Tự làm mới mỗi 30 giây
   });

   if (isLoading) {
      return (
         <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-surface-container rounded w-48" />
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
               {[...Array(4)].map((_, i) => (
                  <div
                     key={i}
                     className="h-24 bg-surface-container rounded-lg"
                  />
               ))}
            </div>
         </div>
      );
   }

   if (isError || !data) {
      return (
         <div className="text-center py-20">
            <XCircle size={48} className="text-error mx-auto mb-3" />
            <p className="text-on-surface-variant">
               Không thể tải dữ liệu Dashboard.
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-section-gap">
         {/* Page Header */}
         <div>
            <h1 className="text-[24px] font-bold text-on-surface">Dashboard</h1>
            <p className="text-[13px] text-on-surface-variant mt-1">
               Tổng quan hoạt động hệ thống
            </p>
         </div>

         {/* Stat Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
               icon={Users}
               label="Tổng users"
               value={data.totalUsers.toLocaleString("vi-VN")}
               color="bg-tertiary-fixed text-on-tertiary-fixed"
            />
            <StatCard
               icon={Package}
               label="Sản phẩm"
               value={data.totalProducts.toLocaleString("vi-VN")}
               color="bg-secondary-container text-on-secondary-container"
            />
            <StatCard
               icon={ShoppingBag}
               label="Đơn hàng"
               value={data.totalOrders.toLocaleString("vi-VN")}
               color="bg-primary/10 text-primary"
            />
            <StatCard
               icon={TrendingUp}
               label="Doanh thu"
               value={formatPrice(data.totalRevenue)}
               color="bg-green-100 text-green-700"
            />
         </div>

         {/* Bottom Grid */}
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Recent Orders */}
            <div className="xl:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-lg shadow-sm overflow-hidden">
               <div className="px-5 py-4 border-b border-surface-variant flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <h2 className="text-[15px] font-semibold text-on-surface">
                     Đơn hàng gần nhất
                  </h2>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                     <thead>
                        <tr className="bg-surface-container-low border-b border-surface-variant">
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Mã đơn
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Khách hàng
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Tổng tiền
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Trạng thái
                           </th>
                           <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">
                              Ngày đặt
                           </th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-variant">
                        {data.recentOrders.map((order) => (
                           <tr
                              key={order.id}
                              className="hover:bg-surface-container-low transition-colors"
                           >
                              <td className="px-4 py-3 font-bold text-primary">
                                 #{order.id}
                              </td>
                              <td className="px-4 py-3 text-on-surface">
                                 {order.customerName}
                              </td>
                              <td className="px-4 py-3 font-semibold text-on-surface">
                                 {formatPrice(order.totalAmount)}
                              </td>
                              <td className="px-4 py-3">
                                 <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                       order.status === "DELIVERED"
                                          ? "bg-green-100 text-green-700"
                                          : order.status === "CANCELLED"
                                            ? "bg-error-container text-on-error-container"
                                            : "bg-secondary-container text-on-secondary-container"
                                    }`}
                                 >
                                    {STATUS_LABEL[order.status] ?? order.status}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant">
                                 {formatDate(order.createdAt)}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Orders by Status */}
            <div className="xl:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-lg shadow-sm overflow-hidden">
               <div className="px-5 py-4 border-b border-surface-variant flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <h2 className="text-[15px] font-semibold text-on-surface">
                     Theo trạng thái
                  </h2>
               </div>
               <div className="p-4 space-y-3">
                  {data.ordersByStatus.map((item) => {
                     const percent =
                        data.totalOrders > 0
                           ? Math.round(
                                (item._count.id / data.totalOrders) * 100,
                             )
                           : 0;
                     return (
                        <div key={item.status}>
                           <div className="flex justify-between text-[12px] mb-1">
                              <span className="font-semibold text-on-surface">
                                 {STATUS_LABEL[item.status] ?? item.status}
                              </span>
                              <span className="text-on-surface-variant">
                                 {item._count.id} ({percent}%)
                              </span>
                           </div>
                           <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                              <div
                                 className="h-full bg-primary rounded-full transition-all duration-500"
                                 style={{ width: `${percent}%` }}
                              />
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </div>
   );
}
