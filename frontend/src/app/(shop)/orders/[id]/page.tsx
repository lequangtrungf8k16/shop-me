import Link from "next/link";
import { CheckCircle2, Package, Truck, Home, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Order } from "@/types/order.type";

// Fetch đơn hàng theo id từ server
async function getOrder(id: string): Promise<Order | null> {
   try {
      const res = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
         { cache: "no-store" },
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as Order;
   } catch {
      return null;
   }
}

const formatPrice = (price: string | number) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(Number(price));

const STATUS_STEPS = [
   { key: "PENDING", label: "Xác nhận", icon: CheckCircle2 },
   { key: "PROCESSING", label: "Đóng gói", icon: Package },
   { key: "SHIPPED", label: "Giao hàng", icon: Truck },
   { key: "DELIVERED", label: "Hoàn tất", icon: Home },
] as const;

export default async function OrderDetailPage(
  props: { params: Promise<{ id: string }> }
) {
   const { id } = await props.params;
   const order = await getOrder(id);
   if (!order) notFound();

   const currentStepIndex = STATUS_STEPS.findIndex(
      (s) => s.key === order.status,
   );

   return (
      <div className="max-w-container-max mx-auto px-margin-page py-section-gap">
         {/* Success Header */}
         <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-8 text-center mb-section-gap shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h1 className="text-[24px] font-bold text-on-surface mb-1">
               Đặt hàng thành công!
            </h1>
            <p className="text-on-surface-variant text-[14px]">
               Mã đơn hàng:{" "}
               <span className="font-bold text-primary">#{order.id}</span>
            </p>
         </div>

         {/* Status Tracker */}
         <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 mb-section-gap shadow-sm">
            <h2 className="text-[16px] font-semibold text-on-surface mb-6">
               Trạng thái đơn hàng
            </h2>
            <div className="relative flex justify-between items-center">
               {/* Connecting line */}
               <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-variant z-0" />
               <div
                  className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
                  style={{
                     width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
               />

               {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIndex;
                  return (
                     <div
                        key={step.key}
                        className="relative z-10 flex flex-col items-center gap-2"
                     >
                        <div
                           className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                              isCompleted
                                 ? "bg-primary border-primary text-on-primary"
                                 : "bg-surface border-surface-variant text-on-surface-variant"
                           }`}
                        >
                           <Icon size={18} />
                        </div>
                        <span
                           className={`text-[11px] font-semibold ${isCompleted ? "text-primary" : "text-on-surface-variant"}`}
                        >
                           {step.label}
                        </span>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Bento Grid Details */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-section-gap">
            {/* Left: Items & Totals */}
            <div className="lg:col-span-7 bg-surface-container-lowest border border-surface-variant rounded-lg shadow-sm overflow-hidden">
               <div className="p-4 border-b border-surface-variant">
                  <h2 className="text-[16px] font-semibold text-on-surface">
                     Sản phẩm đã đặt
                  </h2>
               </div>
               <div className="divide-y divide-surface-variant">
                  {order.orderItems.map((item) => (
                     <div
                        key={item.id}
                        className="p-4 flex justify-between items-center"
                     >
                        <div>
                           <p className="text-[14px] font-medium text-on-surface">
                              Sản phẩm #{item.productId}
                           </p>
                           <p className="text-[12px] text-on-surface-variant mt-0.5">
                              Số lượng: {item.quantity}
                           </p>
                        </div>
                        <span className="text-[14px] font-bold text-primary">
                           {formatPrice(Number(item.price) * item.quantity)}
                        </span>
                     </div>
                  ))}
               </div>

               {/* Totals */}
               <div className="p-4 border-t border-surface-variant bg-surface-container-low space-y-2">
                  <div className="flex justify-between text-[13px] text-on-surface-variant">
                     <span>Tạm tính</span>
                     <span>{formatPrice(Number(order.totalAmount) / 1.1)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-on-surface-variant">
                     <span>Thuế VAT (10%)</span>
                     <span>
                        {formatPrice(
                           Number(order.totalAmount) -
                              Number(order.totalAmount) / 1.1,
                        )}
                     </span>
                  </div>
                  <div className="flex justify-between text-[15px] font-bold text-on-surface pt-2 border-t border-surface-variant">
                     <span>Tổng cộng</span>
                     <span className="text-primary">
                        {formatPrice(order.totalAmount)}
                     </span>
                  </div>
               </div>
            </div>

            {/* Right: Info Cards */}
            <div className="lg:col-span-5 flex flex-col gap-gutter">
               {/* Recipient */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-4 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-on-surface-variant uppercase mb-3">
                     Người nhận
                  </h3>
                  <p className="text-[15px] font-semibold text-on-surface">
                     {order.customerName}
                  </p>
                  <p className="text-[13px] text-on-surface-variant mt-1">
                     {order.customerPhone}
                  </p>
               </div>

               {/* Address */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-4 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-on-surface-variant uppercase mb-3">
                     Địa chỉ giao hàng
                  </h3>
                  <p className="text-[14px] text-on-surface">
                     {order.shippingAddress}
                  </p>
               </div>

               {/* Payment */}
               <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-4 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-on-surface-variant uppercase mb-3">
                     Phương thức thanh toán
                  </h3>
                  <span className="inline-block bg-secondary-container text-on-secondary-container text-[12px] font-bold px-3 py-1 rounded-full">
                     {order.paymentMethod}
                  </span>
               </div>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="flex gap-4">
            <Link
               href="/"
               className="flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-3 rounded hover:bg-primary-container transition-colors"
            >
               <Home size={18} /> Về trang chủ
            </Link>
            <Link
               href="/profile"
               className="flex items-center gap-2 bg-surface-container text-on-surface font-bold px-6 py-3 rounded hover:bg-surface-container-high transition-colors border border-surface-variant"
            >
               <ArrowLeft size={18} /> Xem tất cả đơn hàng
            </Link>
         </div>
      </div>
   );
}
