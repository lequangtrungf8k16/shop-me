"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
   const [visible, setVisible] = useState(false);

   // Dùng useRef để ghi nhớ tự động xem phần tử nào (window hay thẻ <div>/<main> cụ thể) đang thực sự cuộn
   const scrollContainerRef = useRef<HTMLElement | Window | null>(null);

   useEffect(() => {
      const handleScroll = (e: Event) => {
         const target = e.target;
         let currentScroll = 0;

         // Nếu cuộn toàn trang (window/document)
         if (target === document || target === window) {
            currentScroll = window.scrollY;
            scrollContainerRef.current = window;
         }
         // Nếu cuộn bên trong một component có overflow-y (như <main>, <div>)
         else {
            const element = target as HTMLElement;
            currentScroll = element.scrollTop;
            scrollContainerRef.current = element; // Lưu lại chính xác thẻ đang cuộn
         }

         setVisible(currentScroll > 300);
      };

      // { capture: true } là bắt buộc để "nghe lén" mọi sự kiện cuộn trên trang
      window.addEventListener("scroll", handleScroll, { capture: true });

      return () => {
         window.removeEventListener("scroll", handleScroll, { capture: true });
      };
   }, []);

   const scrollToTop = () => {
      // Dù là trang nào, ta chỉ cần gọi scrollTo trên đúng phần tử đã được lưu lại
      if (scrollContainerRef.current) {
         scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
         // Fallback an toàn
         window.scrollTo({ top: 0, behavior: "smooth" });
      }
   };

   return (
      <button
         onClick={scrollToTop}
         className={`fixed bottom-4 right-4 p-3 rounded-full shadow-xl cursor-pointer transition-all duration-300 z-99 flex items-center justify-center ${
            visible
               ? "opacity-100 translate-y-0"
               : "opacity-0 translate-y-10 pointer-events-none"
         }`}
         style={{ background: "var(--accent, #3b82f6)", color: "#fff" }}
         title="Về đầu trang"
         aria-label="Về đầu trang"
      >
         <ChevronUp size={20} strokeWidth={2.5} />
      </button>
   );
}
