import Link from "next/link";

export default function Footer() {
   return (
      <footer className="bg-surface-container-highest border-t border-outline-variant pt-10 pb-6">
         <div className="max-w-container-max mx-auto px-margin-page grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
               <Link href="/">
                  <span className="text-[20px] leading-7 font-bold text-primary tracking-tight mb-4 block">
                     TECHNOLOGY
                  </span>
               </Link>
               <p className="text-[12px] leading-4 text-on-surface-variant mb-4">
                  Hệ thống bán lẻ máy tính, linh kiện, phụ kiện hàng đầu. Mang
                  đến trải nghiệm công nghệ đỉnh cao cho mọi khách hàng.
               </p>
               <div className="flex gap-3">
                  <Link
                     href="https://google.com"
                     className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-colors"
                  >
                     <span className="text-[20px] font-bold  group-hover:text-primary text-red-400">
                        G
                     </span>
                  </Link>
                  <Link
                     href="https://www.facebook.com"
                     className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-colors"
                  >
                     <span className="text-[20px] font-bold text-blue-500 group-hover:text-primary transition-colors">
                        f
                     </span>
                  </Link>
               </div>
            </div>

            <div>
               <h4 className="text-[16px] leading-6 font-semibold text-on-surface mb-4">
                  Về TECHNOLOGY
               </h4>
               <ul className="space-y-2 text-[12px] leading-4 text-on-surface-variant">
                  <li>
                     <Link
                        href="#"
                        className="hover:text-primary transition-colors"
                     >
                        Giới thiệu chung
                     </Link>
                  </li>
                  <li>
                     <Link
                        href="#"
                        className="hover:text-primary transition-colors"
                     >
                        Tuyển dụng
                     </Link>
                  </li>
                  <li>
                     <Link
                        href="#"
                        className="hover:text-primary transition-colors"
                     >
                        Tin tức công nghệ
                     </Link>
                  </li>
                  <li>
                     <Link
                        href="#"
                        className="hover:text-primary transition-colors"
                     >
                        Liên hệ hợp tác
                     </Link>
                  </li>
               </ul>
            </div>

            <div>
               <h4 className="text-[16px] leading-6 font-semibold text-on-surface mb-4">
                  Chính sách
               </h4>
               <ul className="space-y-2 text-[12px] leading-4 text-on-surface-variant">
                  <li>
                     <Link
                        href="#"
                        className="hover:text-primary transition-colors"
                     >
                        Chính sách bảo hành
                     </Link>
                  </li>
                  <li>
                     <Link
                        href="#"
                        className="hover:text-primary transition-colors"
                     >
                        Chính sách đổi trả
                     </Link>
                  </li>
                  <li>
                     <Link
                        href="#"
                        className="hover:text-primary transition-colors"
                     >
                        Chính sách giao hàng
                     </Link>
                  </li>
                  <li>
                     <Link
                        href="#"
                        className="hover:text-primary transition-colors"
                     >
                        Bảo mật thông tin
                     </Link>
                  </li>
               </ul>
            </div>

            <div>
               <h4 className="text-[16px] leading-6 font-semibold text-on-surface mb-4">
                  Tổng đài hỗ trợ
               </h4>
               <div className="text-[12px] leading-4 text-on-surface-variant mb-2">
                  Gọi mua:{" "}
                  <span className="text-primary font-bold">
                     <a href="tel:1800.xxxx">1800.xxxx</a>
                  </span>{" "}
                  (8h00 - 21h00)
               </div>
               <div className="text-[12px] leading-4 text-on-surface-variant mb-2">
                  Bảo hành:{" "}
                  <span className="text-primary font-bold">
                     <a href="tel:1800.xxxx">1800.xxxx</a>
                  </span>{" "}
                  (8h00 - 21h00)
               </div>
               <div className="text-[12px] leading-4 text-on-surface-variant">
                  Email:{" "}
                  <a href="mailto:cskh@techNOLOGY.com">cskh@techNOLOGY.com</a>
               </div>
            </div>
         </div>

         <div className="border-t border-outline-variant/50 pt-6">
            <p className="text-center text-[12px] leading-4 text-on-surface-variant">
               © 2026 TECHNOLOGY SYSTEMS. ALL RIGHTS RESERVED. PRECISION
               ENGINEERED.
            </p>
         </div>
      </footer>
   );
}
