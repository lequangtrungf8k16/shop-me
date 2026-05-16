"use client";

import { useQuery } from "@tanstack/react-query";
import {
   BarChart3,
   TrendingUp,
   TrendingDown,
   ShoppingBag,
   Users,
   DollarSign,
   Package,
   Loader2,
} from "lucide-react";
import axiosInstance from "@/lib/axios";

interface Summary {
   revenueThisMonth: number;
   revenuePrevMonth: number;
   growth: number;
   ordersThisMonth: number;
   newUsersThisMonth: number;
   totalRevenue: number;
}
interface MonthData {
   label: string;
   revenue: number;
   orders: number;
}
interface TopProduct {
   product:
      | { id: number; name: string; thumbnail: string | null; price: string }
      | undefined;
   totalSold: number;
}

const FMT = (v: number) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(v);

export default function AdminReportsPage() {
   const { data: summary, isLoading: loadSummary } = useQuery<Summary>({
      queryKey: ["admin-report-summary"],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: Summary }>(
            "/admin/reports/summary",
         );
         return res.data;
      },
   });

   const { data: monthly, isLoading: loadMonthly } = useQuery<MonthData[]>({
      queryKey: ["admin-report-monthly"],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: MonthData[] }>(
            "/admin/reports/revenue-by-month",
         );
         return res.data;
      },
   });

   const { data: topProducts } = useQuery<TopProduct[]>({
      queryKey: ["admin-report-top"],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: TopProduct[] }>(
            "/admin/reports/top-products",
         );
         return res.data;
      },
   });

   const maxRevenue = Math.max(...(monthly?.map((m) => m.revenue) ?? [1]));

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2">
               <BarChart3 size={20} className="text-primary" /> Báo cáo doanh
               thu
            </h1>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
               Thống kê 30 ngày gần nhất
            </p>
         </div>

         {/* Summary cards */}
         {loadSummary ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
               {[...Array(6)].map((_, i) => (
                  <div
                     key={i}
                     className="h-24 bg-surface-container-lowest border border-surface-variant rounded-xl animate-pulse"
                  />
               ))}
            </div>
         ) : summary ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
               {[
                  {
                     label: "Doanh thu tháng này",
                     value: FMT(summary.revenueThisMonth),
                     icon: DollarSign,
                     color: "text-primary bg-primary/10",
                  },
                  {
                     label: "Tháng trước",
                     value: FMT(summary.revenuePrevMonth),
                     icon: BarChart3,
                     color: "text-on-surface-variant bg-surface-container",
                  },
                  {
                     label: "Tăng trưởng",
                     value: `${summary.growth > 0 ? "+" : ""}${summary.growth}%`,
                     icon: summary.growth >= 0 ? TrendingUp : TrendingDown,
                     color:
                        summary.growth >= 0
                           ? "text-green-700 bg-green-100"
                           : "text-error bg-error-container",
                  },
                  {
                     label: "Đơn hàng tháng này",
                     value: String(summary.ordersThisMonth),
                     icon: ShoppingBag,
                     color: "text-tertiary bg-tertiary-fixed",
                  },
                  {
                     label: "User mới tháng này",
                     value: String(summary.newUsersThisMonth),
                     icon: Users,
                     color: "text-secondary bg-secondary-container",
                  },
                  {
                     label: "Tổng doanh thu",
                     value: FMT(summary.totalRevenue),
                     icon: TrendingUp,
                     color: "text-green-700 bg-green-50",
                  },
               ].map(({ label, value, icon: Icon, color }) => (
                  <div
                     key={label}
                     className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 shadow-sm"
                  >
                     <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}
                     >
                        <Icon size={18} />
                     </div>
                     <p className="text-[11px] text-on-surface-variant uppercase font-bold mb-0.5">
                        {label}
                     </p>
                     <p className="text-[18px] font-bold text-on-surface leading-tight">
                        {value}
                     </p>
                  </div>
               ))}
            </div>
         ) : null}

         {/* Revenue chart */}
         <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 shadow-sm">
            <h2 className="text-[14px] font-bold text-on-surface mb-5">
               Doanh thu 12 tháng qua
            </h2>
            {loadMonthly ? (
               <div className="flex items-center justify-center h-48">
                  <Loader2 size={24} className="animate-spin text-primary" />
               </div>
            ) : (
               <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
                  {(monthly ?? []).map((m) => {
                     const heightPct =
                        maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                     return (
                        <div
                           key={m.label}
                           className="flex flex-col items-center gap-1.5 min-w-13 flex-1 group"
                        >
                           <div
                              className="relative w-full flex flex-col justify-end"
                              style={{ height: "160px" }}
                           >
                              <div
                                 className="w-full bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-500 relative"
                                 style={{
                                    height: `${Math.max(heightPct, 2)}%`,
                                 }}
                              >
                                 {m.revenue > 0 && (
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-1.5 py-0.5 rounded shadow-sm">
                                       {new Intl.NumberFormat("vi-VN", {
                                          notation: "compact",
                                       }).format(m.revenue)}
                                       ₫
                                    </div>
                                 )}
                              </div>
                           </div>
                           <span className="text-[10px] text-on-surface-variant font-semibold">
                              {m.label}
                           </span>
                           <span className="text-[10px] text-on-surface-variant">
                              {m.orders}đh
                           </span>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Top products */}
         {topProducts && topProducts.length > 0 && (
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 shadow-sm">
               <h2 className="text-[14px] font-bold text-on-surface mb-4">
                  <Package size={16} className="inline mr-2 text-primary" />
                  Top sản phẩm bán chạy
               </h2>
               <div className="space-y-2.5">
                  {topProducts.slice(0, 8).map((item, idx) => {
                     if (!item.product) return null;
                     const maxSold = topProducts[0]?.totalSold ?? 1;
                     const pct = Math.round((item.totalSold / maxSold) * 100);
                     return (
                        <div
                           key={item.product.id}
                           className="flex items-center gap-3"
                        >
                           <span className="w-5 text-[12px] font-bold text-on-surface-variant text-right shrink-0">
                              {idx + 1}
                           </span>
                           <div className="w-8 h-8 rounded-lg bg-surface-container overflow-hidden shrink-0">
                              {item.product.thumbnail ? (
                                 <img
                                    src={item.product.thumbnail}
                                    alt=""
                                    className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <Package
                                    size={14}
                                    className="m-auto mt-1 text-outline"
                                 />
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-on-surface truncate">
                                 {item.product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                    <div
                                       className="h-full bg-primary rounded-full"
                                       style={{ width: `${pct}%` }}
                                    />
                                 </div>
                                 <span className="text-[11px] text-on-surface-variant font-semibold shrink-0">
                                    {item.totalSold} đã bán
                                 </span>
                              </div>
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
