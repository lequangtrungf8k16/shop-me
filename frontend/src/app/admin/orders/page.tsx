"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   ShoppingBag,
   Search,
   Eye,
   ChevronLeft,
   ChevronRight,
   Loader2,
   X,
   Package,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

type OrderStatus =
   | "PENDING"
   | "PROCESSING"
   | "SHIPPED"
   | "DELIVERED"
   | "CANCELLED";

interface AdminOrder {
   id: number;
   customerName: string;
   customerPhone: string;
   shippingAddress: string;
   totalAmount: string;
   status: OrderStatus;
   paymentMethod: string;
   createdAt: string;
   user: { id: number; fullName: string; email: string } | null;
   _count: { orderItems: number };
}

interface OrderDetail extends AdminOrder {
   orderItems: {
      id: number;
      quantity: number;
      price: string;
      product: {
         id: number;
         name: string;
         thumbnail: string | null;
         slug: string;
      };
   }[];
}

interface ApiList {
   orders: AdminOrder[];
   pagination: { total: number; page: number; totalPages: number };
}

const STATUS: Record<OrderStatus, { label: string; color: string }> = {
   PENDING: {
      label: "Chờ xác nhận",
      color: "bg-secondary-container text-on-secondary-container",
   },
   PROCESSING: {
      label: "Đang đóng gói",
      color: "bg-tertiary-fixed text-on-tertiary-fixed",
   },
   SHIPPED: { label: "Đang giao", color: "bg-primary/10 text-primary" },
   DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-700" },
   CANCELLED: {
      label: "Đã hủy",
      color: "bg-error-container text-on-error-container",
   },
};

const FMT_PRICE = (v: string | number) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(Number(v));

const FMT_DATE = (d: string) =>
   new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });

// ── Detail Modal ─────────────────────────────────────────────────────────────
function OrderDetailModal({
   orderId,
   onClose,
}: {
   orderId: number;
   onClose: () => void;
}) {
   const qc = useQueryClient();
   const { data, isLoading } = useQuery<OrderDetail>({
      queryKey: ["admin-order-detail", orderId],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: OrderDetail }>(
            `/admin/orders/${orderId}`,
         );
         return res.data;
      },
   });

   const statusMutation = useMutation({
      mutationFn: (status: OrderStatus) =>
         axiosInstance.patch(`/admin/orders/${orderId}/status`, { status }),
      onSuccess: () => {
         toast.success("Đã cập nhật trạng thái");
         qc.invalidateQueries({ queryKey: ["admin-orders"] });
         qc.invalidateQueries({ queryKey: ["admin-order-detail", orderId] });
      },
      onError: (e: Error) => toast.error(e?.message ?? "Thất bại"),
   });

   const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
      PENDING: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "CANCELLED"],
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
         <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant shrink-0">
               <h2 className="text-[16px] font-bold text-on-surface">
                  Chi tiết đơn #{orderId}
               </h2>
               <button onClick={onClose}>
                  <X size={20} className="text-on-surface-variant" />
               </button>
            </div>

            {isLoading ? (
               <div className="flex-1 flex items-center justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-primary" />
               </div>
            ) : data ? (
               <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                  {/* Status + actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                     <span
                        className={`text-[12px] font-bold px-3 py-1 rounded-full ${STATUS[data.status].color}`}
                     >
                        {STATUS[data.status].label}
                     </span>
                     {NEXT_STATUS[data.status]?.map((s) => (
                        <button
                           key={s}
                           onClick={() => statusMutation.mutate(s)}
                           disabled={statusMutation.isPending}
                           className={`text-[12px] font-bold px-3 py-1 rounded-full border transition-colors ${
                              s === "CANCELLED"
                                 ? "border-error text-error hover:bg-error-container/30"
                                 : "border-primary text-primary hover:bg-primary/10"
                           } disabled:opacity-50`}
                        >
                           → {STATUS[s].label}
                        </button>
                     ))}
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 text-[13px]">
                     {[
                        { label: "Khách hàng", value: data.customerName },
                        { label: "Điện thoại", value: data.customerPhone },
                        { label: "Thanh toán", value: data.paymentMethod },
                        { label: "Ngày đặt", value: FMT_DATE(data.createdAt) },
                        { label: "Địa chỉ", value: data.shippingAddress },
                        {
                           label: "Tài khoản",
                           value: data.user?.email ?? "Khách vãng lai",
                        },
                     ].map(({ label, value }) => (
                        <div
                           key={label}
                           className="bg-surface-container-low p-3 rounded-lg"
                        >
                           <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-0.5">
                              {label}
                           </p>
                           <p className="font-semibold text-on-surface text-[12px]">
                              {value}
                           </p>
                        </div>
                     ))}
                  </div>

                  {/* Items */}
                  <div>
                     <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">
                        Sản phẩm
                     </p>
                     <div className="space-y-2">
                        {data.orderItems.map((item) => (
                           <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low"
                           >
                              <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0">
                                 {item.product.thumbnail ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                       src={item.product.thumbnail}
                                       alt=""
                                       className="w-full h-full object-cover"
                                    />
                                 ) : (
                                    <Package
                                       size={16}
                                       className="m-auto mt-2 text-outline"
                                    />
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[12px] font-semibold text-on-surface truncate">
                                    {item.product.name}
                                 </p>
                                 <p className="text-[11px] text-on-surface-variant">
                                    x{item.quantity}
                                 </p>
                              </div>
                              <p className="text-[12px] font-bold text-on-surface whitespace-nowrap">
                                 {FMT_PRICE(Number(item.price) * item.quantity)}
                              </p>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-variant">
                     <span className="text-[14px] font-bold text-on-surface">
                        Tổng cộng
                     </span>
                     <span className="text-[18px] font-bold text-primary">
                        {FMT_PRICE(data.totalAmount)}
                     </span>
                  </div>
               </div>
            ) : null}
         </div>
      </div>
   );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
   const [page, setPage] = useState(1);
   const [statusFilter, setStatusFilter] = useState("");
   const [search, setSearch] = useState("");
   const [searchInput, setSearchInput] = useState("");
   const [detailId, setDetailId] = useState<number | null>(null);

   const { data, isLoading } = useQuery<ApiList>({
      queryKey: ["admin-orders", page, statusFilter, search],
      queryFn: async () => {
         const params = new URLSearchParams({
            page: String(page),
            limit: "15",
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(search ? { search } : {}),
         });
         const res = await axiosInstance.get<unknown, { data: ApiList }>(
            `/admin/orders?${params}`,
         );
         return res.data;
      },
   });

   return (
      <div className="space-y-5">
         {detailId && (
            <OrderDetailModal
               orderId={detailId}
               onClose={() => setDetailId(null)}
            />
         )}

         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
               <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2">
                  <ShoppingBag size={20} className="text-primary" /> Đơn hàng
               </h1>
               <p className="text-[12px] text-on-surface-variant mt-0.5">
                  {data?.pagination.total ?? 0} đơn
               </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
               <select
                  value={statusFilter}
                  onChange={(e) => {
                     setStatusFilter(e.target.value);
                     setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg bg-surface border border-surface-variant text-[13px] text-on-surface focus:outline-none focus:border-primary"
               >
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(STATUS).map(([k, v]) => (
                     <option key={k} value={k}>
                        {v.label}
                     </option>
                  ))}
               </select>
               <div className="relative">
                  <Search
                     size={14}
                     className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                     value={searchInput}
                     onChange={(e) => setSearchInput(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           setSearch(searchInput);
                           setPage(1);
                        }
                     }}
                     placeholder="Tên / SĐT..."
                     className="pl-8 pr-3 py-2 rounded-lg bg-surface border border-surface-variant text-[13px] w-44 focus:outline-none focus:border-primary"
                  />
               </div>
            </div>
         </div>

         {/* Table */}
         <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
               <div className="flex items-center justify-center py-16">
                  <Loader2 size={32} className="animate-spin text-primary" />
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                     <thead>
                        <tr className="bg-surface-container-low border-b border-surface-variant">
                           {[
                              "Mã đơn",
                              "Khách hàng",
                              "Sản phẩm",
                              "Tổng tiền",
                              "Thanh toán",
                              "Trạng thái",
                              "Ngày đặt",
                              "",
                           ].map((h) => (
                              <th
                                 key={h}
                                 className="text-left px-4 py-3 font-semibold text-on-surface-variant whitespace-nowrap"
                              >
                                 {h}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-variant">
                        {(data?.orders ?? []).map((o) => (
                           <tr
                              key={o.id}
                              className="hover:bg-surface-container-low transition-colors"
                           >
                              <td className="px-4 py-3 font-bold text-primary">
                                 #{o.id}
                              </td>
                              <td className="px-4 py-3">
                                 <p className="font-semibold text-on-surface">
                                    {o.customerName}
                                 </p>
                                 <p className="text-[11px] text-on-surface-variant">
                                    {o.customerPhone}
                                 </p>
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant text-center">
                                 {o._count.orderItems} sp
                              </td>
                              <td className="px-4 py-3 font-bold text-on-surface whitespace-nowrap">
                                 {FMT_PRICE(o.totalAmount)}
                              </td>
                              <td className="px-4 py-3">
                                 <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                                    {o.paymentMethod}
                                 </span>
                              </td>
                              <td className="px-4 py-3">
                                 <span
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS[o.status].color}`}
                                 >
                                    {STATUS[o.status].label}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap text-[12px]">
                                 {FMT_DATE(o.createdAt)}
                              </td>
                              <td className="px-4 py-3">
                                 <button
                                    onClick={() => setDetailId(o.id)}
                                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                                    title="Xem chi tiết"
                                 >
                                    <Eye size={15} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
            {data && data.pagination.totalPages > 1 && (
               <div className="px-4 py-3 border-t border-surface-variant flex items-center justify-between">
                  <p className="text-[12px] text-on-surface-variant">
                     Trang {data.pagination.page} / {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-1.5">
                     <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
                     >
                        <ChevronLeft size={15} />
                     </button>
                     <button
                        onClick={() =>
                           setPage((p) =>
                              Math.min(data.pagination.totalPages, p + 1),
                           )
                        }
                        disabled={page === data.pagination.totalPages}
                        className="p-1.5 rounded-lg border border-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
                     >
                        <ChevronRight size={15} />
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
