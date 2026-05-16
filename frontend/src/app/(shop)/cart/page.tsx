"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

export default function CartPage() {
   // Lấy state và actions từ Zustand Store
   const {
      items,
      removeFromCart,
      updateQuantity,
      getTotalPrice,
      getTotalItems,
   } = useCartStore();

   // Xử lý Hydration Error của Next.js khi dùng Local Storage
   const [isMounted, setIsMounted] = useState(false);
   useEffect(() => {
      const timer = setTimeout(() => {
         setIsMounted(true);
      }, 0);
      return () => clearTimeout(timer); // Cleanup function
   }, []);

   // Format tiền tệ
   const formatPrice = (price: number) => {
      return new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
      }).format(price);
   };

   if (!isMounted) return null; // Tránh render sai lệch giữa Server và Client lần đầu

   const subTotal = getTotalPrice();
   const tax = subTotal * 0.1; // Giả sử tính thuế 10% VAT
   const total = subTotal + tax;

   return (
      <div className="grow w-full px-margin-page py-section-gap max-w-container-max mx-auto">
         <div className="mb-gutter">
            <h1 className="text-[24px] font-bold text-primary uppercase">
               Giỏ hàng của bạn
            </h1>
            <p className="text-[12px] text-on-surface-variant mt-1">
               {getTotalItems()} sản phẩm trong giỏ
            </p>
         </div>

         {items.length === 0 ? (
            // Giao diện khi giỏ hàng trống
            <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-12 flex flex-col items-center justify-center text-center">
               <ShoppingCart size={64} className="text-outline-variant mb-4" />
               <h2 className="text-[20px] font-bold text-on-surface mb-2">
                  Giỏ hàng trống
               </h2>
               <p className="text-on-surface-variant mb-6 text-[14px]">
                  Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy tiếp tục mua sắm
                  nhé!
               </p>
               <Link
                  href="/"
                  className="bg-primary text-on-primary font-bold px-8 py-3 rounded hover:bg-primary-container transition-colors flex items-center gap-2"
               >
                  TIẾP TỤC MUA SẮM <ArrowRight size={20} />
               </Link>
            </div>
         ) : (
            // Giao diện khi có sản phẩm
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
               {/* Cột trái: Danh sách sản phẩm */}
               <div className="lg:col-span-8 space-y-gutter">
                  {/* Table Header (Desktop only) */}
                  <div className="hidden md:grid grid-cols-12 gap-gutter pb-stack-compact border-b border-surface-variant text-[12px] font-semibold text-on-surface-variant uppercase bg-surface-container-lowest p-gutter rounded-t">
                     <div className="col-span-6">Sản phẩm</div>
                     <div className="col-span-2 text-center">Đơn giá</div>
                     <div className="col-span-2 text-center">Số lượng</div>
                     <div className="col-span-2 text-right">Tổng</div>
                  </div>

                  {/* Render Danh sách Items */}
                  <div className="bg-surface-container-lowest border border-surface-variant rounded-b md:border-t-0 shadow-sm overflow-hidden">
                     {items.map((item, index) => (
                        <div
                           key={item.id}
                           className={`p-gutter grid grid-cols-1 md:grid-cols-12 gap-gutter items-center ${
                              index !== items.length - 1
                                 ? "border-b border-surface-variant"
                                 : ""
                           }`}
                        >
                           <div className="md:col-span-6 flex items-center gap-gutter">
                              <Link
                                 href={`/products/${item.slug}`}
                                 className="w-24 h-24 rounded bg-surface-container-lowest shrink-0 border border-surface-variant overflow-hidden relative"
                              >
                                 <Image
                                    src={item.thumbnail}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-2 hover:scale-105 transition-transform"
                                    sizes="96px"
                                 />
                              </Link>
                              <div className="flex flex-col justify-center">
                                 <Link href={`/products/${item.slug}`}>
                                    <h3 className="text-[16px] font-bold text-on-surface leading-tight hover:text-primary transition-colors line-clamp-2">
                                       {item.name}
                                    </h3>
                                 </Link>
                                 <p className="text-[12px] text-on-surface-variant mt-1">
                                    Kho: {item.stock} sản phẩm
                                 </p>
                              </div>
                           </div>

                           <div className="md:col-span-2 flex justify-between md:block text-center text-[13px] text-on-surface-variant">
                              <span className="md:hidden font-medium text-[14px] text-on-surface">
                                 Đơn giá:
                              </span>
                              {formatPrice(item.price)}
                           </div>

                           <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                              <span className="md:hidden font-medium text-[14px] text-on-surface">
                                 Số lượng:
                              </span>
                              <div className="flex items-center border border-outline-variant rounded h-8 bg-surface">
                                 <button
                                    onClick={() =>
                                       updateQuantity(
                                          item.id,
                                          item.quantity - 1,
                                       )
                                    }
                                    className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                                 >
                                    <Minus size={14} />
                                 </button>
                                 <input
                                    className="w-10 h-full bg-transparent border-none text-center text-[14px] font-medium text-on-surface p-0 focus:ring-0"
                                    type="text"
                                    value={item.quantity}
                                    readOnly
                                 />
                                 <button
                                    onClick={() =>
                                       updateQuantity(
                                          item.id,
                                          item.quantity + 1,
                                       )
                                    }
                                    className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                                 >
                                    <Plus size={14} />
                                 </button>
                              </div>
                           </div>

                           <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                              <div className="text-[16px] font-bold text-primary">
                                 {formatPrice(item.price * item.quantity)}
                              </div>
                              <button
                                 onClick={() => removeFromCart(item.id)}
                                 className="ml-gutter text-outline-variant hover:text-error transition-colors p-1"
                                 title="Xóa sản phẩm"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Cột phải: Tóm tắt đơn hàng (Order Summary) */}
               <div className="lg:col-span-4 relative">
                  <div className="bg-surface-container-lowest rounded-lg p-gutter sticky top-25 shadow-sm border border-surface-variant">
                     <h2 className="text-[20px] font-bold text-on-surface mb-gutter pb-2 border-b border-surface-variant uppercase">
                        Tóm tắt đơn hàng
                     </h2>

                     {/* Mã giảm giá */}
                     <div className="mb-gutter">
                        <label
                           className="block text-[12px] font-semibold text-on-surface-variant mb-1"
                           htmlFor="discount"
                        >
                           Mã giảm giá
                        </label>
                        <div className="flex gap-1">
                           <input
                              className="grow bg-surface border border-outline-variant text-on-surface text-[14px] rounded focus:border-primary focus:ring-1 focus:ring-primary px-3 py-2 transition-colors outline-none"
                              id="discount"
                              placeholder="Nhập mã"
                              type="text"
                           />
                           <button className="bg-surface-variant text-on-surface hover:bg-surface-dim text-[12px] font-bold px-4 py-2 rounded transition-colors uppercase">
                              Áp dụng
                           </button>
                        </div>
                     </div>

                     {/* Tính toán chi phí */}
                     <div className="space-y-2 text-[14px] mb-gutter border-b border-surface-variant pb-gutter">
                        <div className="flex justify-between text-on-surface">
                           <span>Tạm tính ({getTotalItems()} sản phẩm)</span>
                           <span className="font-medium">
                              {formatPrice(subTotal)}
                           </span>
                        </div>
                        <div className="flex justify-between text-on-surface-variant">
                           <span>Phí vận chuyển</span>
                           <span className="text-tertiary">Liên hệ sau</span>
                        </div>
                        <div className="flex justify-between text-on-surface-variant">
                           <span>Thuế VAT (10%)</span>
                           <span className="font-medium">
                              {formatPrice(tax)}
                           </span>
                        </div>
                     </div>

                     {/* Tổng tiền */}
                     <div className="flex justify-between items-end mb-gutter">
                        <span className="text-[16px] font-bold text-on-surface">
                           Tổng tiền
                        </span>
                        <span className="text-[24px] font-bold text-primary leading-none">
                           {formatPrice(total)}
                        </span>
                     </div>

                     {/* Nút thanh toán */}
                     <Link
                        href="/checkout"
                        className="w-full bg-primary text-on-primary hover:brightness-110 text-[16px] font-bold py-3 rounded flex items-center justify-center transition-all uppercase shadow-md"
                     >
                        Tiến hành thanh toán
                     </Link>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
