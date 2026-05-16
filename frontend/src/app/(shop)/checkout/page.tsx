"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   Lock,
   CreditCard,
   Landmark,
   Truck,
   CheckCircle,
   ShieldCheck,
   ArrowLeft,
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import axiosInstance from "@/lib/axios";
import type { CheckoutPayload } from "@/types/order.type";
import { toast } from "sonner";

export default function CheckoutPage() {
   const router = useRouter();
   const { items, getTotalPrice, clearCart, getTotalItems } = useCartStore();
   const { user } = useAuthStore();

   // Trạng thái chung
   const [isMounted, setIsMounted] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | VNPAY | CREDIT_CARD

   // Pre-fill từ thông tin user đã đăng nhập
   const [formData, setFormData] = useState({
      fullName: "",
      address: "",
      city: "",
      phone: "",
   });

   // Pre-fill khi user đăng nhập và component mount
   useEffect(() => {
      if (user) {
         setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || user.fullName || "",
            phone: prev.phone || (user as any).phone || "",
         }));
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isMounted]);

   // Xử lý Hydration (tránh lỗi lệch giao diện Server/Client)
   useEffect(() => {
      const timer = setTimeout(() => setIsMounted(true), 0);
      return () => clearTimeout(timer);
   }, []);

   const formatPrice = (price: number) => {
      return new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
      }).format(price);
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
   };

   // Hàm Xử lý Đặt hàng gửi lên Backend
   const handlePlaceOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
         const payload: CheckoutPayload = {
            customerName: formData.fullName,
            customerPhone: formData.phone,
            shippingAddress: `${formData.address}, ${formData.city}`,
            paymentMethod: paymentMethod,
            items: items.map((item) => ({
               productId: item.id,
               quantity: item.quantity,
            })),
         };

         // Gọi API POST /api/orders — response trả về ApiResponse<Order>
         const res = await axiosInstance.post<
            unknown,
            { data: { id: number } }
         >("/orders", payload);

         toast.success(
            "Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại TECHNOLOGY.",
         );
         clearCart();
         // Redirect về trang chi tiết đơn hàng thay vì trang chủ
         router.push(`/orders/${(res as any).data?.id ?? ""}`);
      } catch (error: unknown) {
         const msg =
            typeof error === "object" && error !== null && "message" in error
               ? String((error as { message: string }).message)
               : "Đặt hàng thất bại, vui lòng thử lại.";
         toast.error(msg);
      } finally {
         setIsLoading(false);
      }
   };

   if (!isMounted) return null;

   // Tính toán tiền bạc
   const subTotal = getTotalPrice();
   const tax = subTotal * 0.1;
   const total = subTotal + tax;

   // UI Guard: Chặn thanh toán nếu giỏ hàng trống
   if (items.length === 0) {
      return (
         <div className="grow w-full max-w-container-max mx-auto px-margin-page py-section-gap flex flex-col items-center justify-center min-h-[50vh]">
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-variant text-center max-w-md shadow-sm">
               <ShieldCheck
                  size={64}
                  className="text-outline-variant mx-auto mb-4"
               />
               <h1 className="text-[20px] font-bold text-on-surface mb-2">
                  Không có sản phẩm
               </h1>
               <p className="text-[14px] text-on-surface-variant mb-6">
                  Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh
                  toán.
               </p>
               <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 text-primary font-bold bg-primary/10 px-6 py-3 rounded hover:bg-primary hover:text-on-primary transition-colors"
               >
                  <ArrowLeft size={20} /> Quay lại giỏ hàng
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="grow w-full max-w-container-max mx-auto px-margin-page py-section-gap">
         <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <Lock size={18} className="text-primary" />
            <span className="text-[14px] font-semibold">
               Thanh toán mã hóa bảo mật (Secure Encrypted Checkout)
            </span>
         </div>
         <h1 className="text-[28px] md:text-[32px] font-bold text-on-surface mb-section-gap">
            Giao thức thanh toán
         </h1>

         <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 lg:grid-cols-12 gap-section-gap"
         >
            {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & THANH TOÁN */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-section-gap">
               <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-gutter md:p-section-gap shadow-sm">
                  <h2 className="text-[20px] font-bold text-on-surface mb-4 border-b border-outline-variant/30 pb-2">
                     Thông tin giao hàng
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="col-span-1 md:col-span-2">
                        <label
                           className="block text-[12px] font-semibold text-on-surface-variant mb-1"
                           htmlFor="fullName"
                        >
                           Họ và tên
                        </label>
                        <input
                           required
                           id="fullName"
                           value={formData.fullName}
                           onChange={handleInputChange}
                           className="w-full bg-surface border border-outline-variant/50 rounded p-3 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                           placeholder="Nhập họ và tên đầy đủ"
                           type="text"
                        />
                     </div>
                     <div className="col-span-1 md:col-span-2">
                        <label
                           className="block text-[12px] font-semibold text-on-surface-variant mb-1"
                           htmlFor="address"
                        >
                           Địa chỉ giao hàng
                        </label>
                        <input
                           required
                           id="address"
                           value={formData.address}
                           onChange={handleInputChange}
                           className="w-full bg-surface border border-outline-variant/50 rounded p-3 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                           placeholder="Số nhà, Tên đường, Phường/Xã..."
                           type="text"
                        />
                     </div>
                     <div>
                        <label
                           className="block text-[12px] font-semibold text-on-surface-variant mb-1"
                           htmlFor="city"
                        >
                           Tỉnh / Thành phố
                        </label>
                        <input
                           required
                           id="city"
                           value={formData.city}
                           onChange={handleInputChange}
                           className="w-full bg-surface border border-outline-variant/50 rounded p-3 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                           placeholder="Thành phố"
                           type="text"
                        />
                     </div>
                     <div>
                        <label
                           className="block text-[12px] font-semibold text-on-surface-variant mb-1"
                           htmlFor="phone"
                        >
                           Số điện thoại
                        </label>
                        <input
                           required
                           id="phone"
                           value={formData.phone}
                           onChange={handleInputChange}
                           className="w-full bg-surface border border-outline-variant/50 rounded p-3 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                           placeholder="09xx xxx xxx"
                           type="tel"
                        />
                     </div>
                  </div>
               </section>

               <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-gutter md:p-section-gap shadow-sm">
                  <h2 className="text-[20px] font-bold text-on-surface mb-4 border-b border-outline-variant/30 pb-2">
                     Phương thức thanh toán
                  </h2>
                  <div className="flex flex-col gap-4">
                     <label
                        className={`flex items-start gap-3 p-4 rounded border cursor-pointer transition-colors ${paymentMethod === "CREDIT_CARD" ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface hover:border-primary/50"}`}
                     >
                        <div className="mt-1">
                           <input
                              type="radio"
                              name="paymentMethod"
                              value="CREDIT_CARD"
                              checked={paymentMethod === "CREDIT_CARD"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="text-primary bg-surface border-outline-variant focus:ring-primary"
                           />
                        </div>
                        <div className="grow">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[15px] font-medium text-on-surface">
                                 Thẻ tín dụng / Ghi nợ
                              </span>
                              <CreditCard
                                 size={20}
                                 className="text-on-surface-variant"
                              />
                           </div>
                           {paymentMethod === "CREDIT_CARD" && (
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                 <input
                                    required={paymentMethod === "CREDIT_CARD"}
                                    className="col-span-2 bg-surface-container-lowest border border-outline-variant/50 rounded p-3 text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Số thẻ (Card Number)"
                                    type="text"
                                 />
                                 <input
                                    required={paymentMethod === "CREDIT_CARD"}
                                    className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3 text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="MM/YY"
                                    type="text"
                                 />
                                 <input
                                    required={paymentMethod === "CREDIT_CARD"}
                                    className="bg-surface-container-lowest border border-outline-variant/50 rounded p-3 text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="CVC"
                                    type="text"
                                 />
                              </div>
                           )}
                        </div>
                     </label>

                     <label
                        className={`flex items-center gap-3 p-4 rounded border cursor-pointer transition-colors ${paymentMethod === "VNPAY" ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface hover:border-primary/50"}`}
                     >
                        <input
                           type="radio"
                           name="paymentMethod"
                           value="VNPAY"
                           checked={paymentMethod === "VNPAY"}
                           onChange={(e) => setPaymentMethod(e.target.value)}
                           className="text-primary bg-surface border-outline-variant focus:ring-primary"
                        />
                        <div className="grow flex justify-between items-center">
                           <span className="text-[15px] font-medium text-on-surface">
                              Chuyển khoản / VNPAY
                           </span>
                           <Landmark
                              size={20}
                              className="text-on-surface-variant"
                           />
                        </div>
                     </label>

                     <label
                        className={`flex items-center gap-3 p-4 rounded border cursor-pointer transition-colors ${paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface hover:border-primary/50"}`}
                     >
                        <input
                           type="radio"
                           name="paymentMethod"
                           value="COD"
                           checked={paymentMethod === "COD"}
                           onChange={(e) => setPaymentMethod(e.target.value)}
                           className="text-primary bg-surface border-outline-variant focus:ring-primary"
                        />
                        <div className="grow flex justify-between items-center">
                           <span className="text-[15px] font-medium text-on-surface">
                              Thanh toán khi nhận hàng (COD)
                           </span>
                           <Truck
                              size={20}
                              className="text-on-surface-variant"
                           />
                        </div>
                     </label>
                  </div>
               </section>
            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
            <div className="lg:col-span-5 xl:col-span-4 relative">
               <div className="sticky top-section-gap bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-gutter md:p-section-gap shadow-sm flex flex-col gap-4">
                  <h2 className="text-[20px] font-bold text-on-surface border-b border-outline-variant/30 pb-2">
                     Đơn hàng của bạn
                  </h2>

                  <div className="flex flex-col gap-4 py-2 border-b border-outline-variant/20 max-h-87.5 overflow-y-auto pr-2">
                     {items.map((item) => (
                        <div key={item.id} className="flex gap-4 items-start">
                           <div className="w-16 h-16 rounded bg-surface relative shrink-0 border border-outline-variant/30 overflow-hidden">
                              <Image
                                 src={item.thumbnail}
                                 alt={item.name}
                                 fill
                                 className="object-contain p-1"
                                 sizes="64px"
                              />
                           </div>
                           <div className="grow flex flex-col">
                              <span className="text-[14px] text-on-surface line-clamp-2 leading-tight">
                                 {item.name}
                              </span>
                              <span className="text-[12px] font-semibold text-on-surface-variant mt-1">
                                 SL: {item.quantity}
                              </span>
                           </div>
                           <span className="text-[13px] font-bold text-primary whitespace-nowrap mt-1">
                              {formatPrice(item.price * item.quantity)}
                           </span>
                        </div>
                     ))}
                  </div>

                  <div className="flex flex-col gap-2 py-2 border-b border-outline-variant/20 text-[14px]">
                     <div className="flex justify-between items-center text-on-surface-variant">
                        <span>Tạm tính ({getTotalItems()} sản phẩm)</span>
                        <span className="font-semibold">
                           {formatPrice(subTotal)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-on-surface-variant">
                        <span>Thuế VAT (10%)</span>
                        <span className="font-semibold">
                           {formatPrice(tax)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-on-surface-variant">
                        <span>Phí vận chuyển</span>
                        <span className="font-semibold text-primary">
                           MIỄN PHÍ
                        </span>
                     </div>
                  </div>

                  <div className="flex justify-between items-end pt-2">
                     <span className="text-[18px] font-bold text-on-surface">
                        Tổng cộng
                     </span>
                     <span className="text-[24px] font-bold text-primary leading-none">
                        {formatPrice(total)}
                     </span>
                  </div>

                  <button
                     type="submit"
                     disabled={isLoading}
                     className={`w-full py-4 mt-2 text-on-primary text-[16px] font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 uppercase ${isLoading ? "bg-surface-variant cursor-not-allowed" : "bg-primary hover:bg-primary/90 hover:scale-[0.99] active:scale-95"}`}
                  >
                     {isLoading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                     {!isLoading && <CheckCircle size={20} />}
                  </button>

                  <div className="text-center mt-2 flex items-center justify-center gap-1 text-on-surface-variant text-[12px] font-semibold">
                     <ShieldCheck size={16} />
                     <span>256-BIT SSL ENCRYPTION</span>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
