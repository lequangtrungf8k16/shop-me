// src/components/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import axiosInstance from "@/lib/axios";

// Khai báo kiểu dữ liệu nội bộ
interface Category {
   id: number;
   name: string;
   slug: string;
}

export default function Sidebar() {
   const { isSidebarOpen, closeSidebar } = useUIStore();
   const [categories, setCategories] = useState<Category[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   // Tự động kéo dữ liệu từ Backend khi Sidebar được render
   useEffect(() => {
      const fetchCategories = async () => {
         try {
            // Giả định API Backend của đồng chí là /categories
            const res = await axiosInstance.get("/categories");
            // Tùy thuộc cấu trúc JSON Backend trả về, thường là res.data.data
            setCategories(res.data?.data || res.data);
         } catch (error) {
            console.error("❌ Lỗi tải danh mục:", error);
         } finally {
            setIsLoading(false);
         }
      };

      fetchCategories();
   }, []);

   if (!isSidebarOpen) return null;

   return (
      <>
         {/* Overlay (Lớp phủ nền đen) */}
         <div
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
         />

         {/* Drawer (Bảng menu trượt ra) */}
         <aside className="fixed top-0 left-0 bottom-0 w-75 bg-surface-container-lowest z-[70] shadow-xl transform transition-transform duration-300 flex flex-col">
            {/* Header của Sidebar */}
            <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface">
               <h2 className="text-[18px] font-bold text-primary uppercase">
                  Danh mục sản phẩm
               </h2>
               <button
                  onClick={closeSidebar}
                  className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-colors"
               >
                  <X size={24} />
               </button>
            </div>

            {/* Nội dung danh mục */}
            <div className="p-4 overflow-y-auto flex-1">
               {isLoading ? (
                  <div className="flex flex-col gap-3">
                     {[1, 2, 3, 4, 5].map((skeleton) => (
                        <div
                           key={skeleton}
                           className="h-10 bg-surface-variant/50 animate-pulse rounded-md"
                        />
                     ))}
                  </div>
               ) : categories.length > 0 ? (
                  <nav className="flex flex-col gap-1">
                     {categories.map((cat) => (
                        <Link
                           key={cat.id}
                           href={`/category/${cat.slug}`}
                           onClick={closeSidebar} // Click xong tự đóng Sidebar
                           className="flex items-center justify-between p-3 rounded-lg text-[14px] font-semibold text-on-surface hover:bg-primary/10 hover:text-primary transition-all group"
                        >
                           {cat.name}
                           <ChevronRight
                              size={16}
                              className="text-outline group-hover:text-primary transition-colors"
                           />
                        </Link>
                     ))}
                  </nav>
               ) : (
                  <p className="text-center text-on-surface-variant text-[13px] py-10">
                     Chưa có danh mục nào.
                  </p>
               )}
            </div>
         </aside>
      </>
   );
}
