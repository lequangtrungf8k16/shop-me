"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VnpayReturnContent() {
   const searchParams = useSearchParams();
   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
   const orderId = searchParams.get("vnp_TxnRef");
   const responseCode = searchParams.get("vnp_ResponseCode");

   useEffect(() => {
      // Giả lập độ trễ ngắn để UI không bị giật
      const timer = setTimeout(() => {
         if (responseCode === "00") {
            setStatus("success");
         } else if (responseCode) {
            setStatus("error");
         }
      }, 500);
      return () => clearTimeout(timer);
   }, [responseCode]);

   if (status === "loading") {
      return (
         <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-on-surface-variant font-medium">Đang xử lý kết quả thanh toán...</p>
         </div>
      );
   }

   return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 max-w-md mx-auto text-center px-4">
         {status === "success" ? (
            <>
               <CheckCircle className="text-green-500" size={64} />
               <h1 className="text-2xl font-bold text-on-surface">Thanh toán thành công!</h1>
               <p className="text-on-surface-variant">
                  Cảm ơn bạn đã mua sắm. Đơn hàng #{orderId} của bạn đã được thanh toán thành công và đang được xử lý.
               </p>
            </>
         ) : (
            <>
               <XCircle className="text-error" size={64} />
               <h1 className="text-2xl font-bold text-error">Thanh toán thất bại</h1>
               <p className="text-on-surface-variant">
                  Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau.
               </p>
            </>
         )}
         
         <div className="flex gap-4 mt-4 w-full">
            <Link
               href={`/orders/${orderId}`}
               className="flex-1 bg-surface-container-high border border-outline-variant/30 text-on-surface py-3 rounded-lg font-semibold hover:bg-surface-container-highest transition-colors"
            >
               Xem đơn hàng
            </Link>
            <Link
               href="/"
               className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
               Về trang chủ
            </Link>
         </div>
      </div>
   );
}

export default function VnpayReturnPage() {
   return (
      <div className="w-full py-section-gap">
         <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
               <Loader2 className="animate-spin text-primary" size={48} />
               <p className="text-on-surface-variant font-medium">Đang tải...</p>
            </div>
         }>
            <VnpayReturnContent />
         </Suspense>
      </div>
   );
}
