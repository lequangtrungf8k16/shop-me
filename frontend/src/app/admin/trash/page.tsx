"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   Trash2,
   RotateCcw,
   PackageX,
   FileX,
   Loader2,
   AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import Image from "next/image";

interface TrashProduct {
   id: number;
   name: string;
   thumbnail: string | null;
   price: string;
   deletedAt: string;
   category: { name: string };
}
interface TrashArticle {
   id: number;
   title: string;
   thumbnail: string | null;
   deletedAt: string;
   author: { fullName: string };
}
interface TrashData {
   products: TrashProduct[];
   articles: TrashArticle[];
}

const FMT_DATE = (d: string) =>
   new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
const FMT_PRICE = (v: string) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(Number(v));

export default function AdminTrashPage() {
   const qc = useQueryClient();
   const [tab, setTab] = useState<"products" | "articles">("products");

   const { data, isLoading } = useQuery<TrashData>({
      queryKey: ["admin-trash"],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: TrashData }>(
            "/admin/trash",
         );
         return res.data;
      },
   });

   const restoreProduct = useMutation({
      mutationFn: (id: number) =>
         axiosInstance.patch(`/admin/trash/products/${id}/restore`, {}),
      onSuccess: () => {
         toast.success("Đã khôi phục sản phẩm");
         qc.invalidateQueries({ queryKey: ["admin-trash"] });
      },
      onError: (e: Error) => toast.error(e?.message ?? "Thất bại"),
   });

   const deleteProduct = useMutation({
      mutationFn: (id: number) =>
         axiosInstance.delete(`/admin/trash/products/${id}`),
      onSuccess: () => {
         toast.success("Đã xóa vĩnh viễn");
         qc.invalidateQueries({ queryKey: ["admin-trash"] });
      },
      onError: (e: Error) => toast.error(e?.message ?? "Thất bại"),
   });

   const restoreArticle = useMutation({
      mutationFn: (id: number) =>
         axiosInstance.patch(`/admin/trash/articles/${id}/restore`, {}),
      onSuccess: () => {
         toast.success("Đã khôi phục bài viết");
         qc.invalidateQueries({ queryKey: ["admin-trash"] });
      },
      onError: (e: Error) => toast.error(e?.message ?? "Thất bại"),
   });

   const deleteArticle = useMutation({
      mutationFn: (id: number) =>
         axiosInstance.delete(`/admin/trash/articles/${id}`),
      onSuccess: () => {
         toast.success("Đã xóa vĩnh viễn");
         qc.invalidateQueries({ queryKey: ["admin-trash"] });
      },
      onError: (e: Error) => toast.error(e?.message ?? "Thất bại"),
   });

   const productCount = data?.products.length ?? 0;
   const articleCount = data?.articles.length ?? 0;

   return (
      <div className="space-y-5">
         <div>
            <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2">
               <Trash2 size={20} className="text-primary" /> Thùng rác
            </h1>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
               Items bị xóa mềm — có thể khôi phục hoặc xóa vĩnh viễn
            </p>
         </div>

         {/* Warning */}
         <div className="flex items-start gap-3 p-4 bg-error-container/30 border border-error/20 rounded-xl text-[13px] text-on-error-container">
            <AlertTriangle size={16} className="text-error shrink-0 mt-0.5" />
            <p>
               Xóa vĩnh viễn sẽ <strong>không thể hoàn tác</strong>. Hãy chắc
               chắn trước khi thực hiện.
            </p>
         </div>

         {/* Tabs */}
         <div className="flex gap-2">
            {[
               {
                  key: "products",
                  label: "Sản phẩm",
                  icon: PackageX,
                  count: productCount,
               },
               {
                  key: "articles",
                  label: "Bài viết",
                  icon: FileX,
                  count: articleCount,
               },
            ].map(({ key, label, icon: Icon, count }) => (
               <button
                  key={key}
                  onClick={() => setTab(key as typeof tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                     tab === key
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-lowest border border-surface-variant text-on-surface hover:bg-surface-container"
                  }`}
               >
                  <Icon size={15} />
                  {label}
                  <span
                     className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        tab === key
                           ? "bg-on-primary/20 text-on-primary"
                           : "bg-surface-container text-on-surface-variant"
                     }`}
                  >
                     {count}
                  </span>
               </button>
            ))}
         </div>

         {/* Content */}
         <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
               <div className="flex items-center justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-primary" />
               </div>
            ) : tab === "products" ? (
               productCount === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                     <PackageX size={40} className="mb-3 opacity-30" />
                     <p className="text-[14px]">
                        Không có sản phẩm nào trong thùng rác
                     </p>
                  </div>
               ) : (
                  <table className="w-full text-[13px]">
                     <thead>
                        <tr className="bg-surface-container-low border-b border-surface-variant">
                           {[
                              "Sản phẩm",
                              "Danh mục",
                              "Giá",
                              "Ngày xóa",
                              "Thao tác",
                           ].map((h) => (
                              <th
                                 key={h}
                                 className="text-left px-4 py-3 font-semibold text-on-surface-variant"
                              >
                                 {h}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-variant">
                        {data!.products.map((p) => (
                           <tr
                              key={p.id}
                              className="hover:bg-surface-container-low transition-colors opacity-70 hover:opacity-100"
                           >
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-surface-container overflow-hidden shrink-0">
                                       {p.thumbnail ? (
                                          <Image
                                             src={p.thumbnail}
                                             alt={p.name}
                                             width={36}
                                             height={36}
                                             className="w-full h-full object-cover grayscale"
                                          />
                                       ) : (
                                          <PackageX
                                             size={14}
                                             className="m-auto mt-2 text-outline"
                                          />
                                       )}
                                    </div>
                                    <div>
                                       <p className="font-semibold text-on-surface line-through decoration-error/60">
                                          {p.name}
                                       </p>
                                       <p className="text-[11px] text-on-surface-variant">
                                          #{p.id}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant text-[12px]">
                                 {p.category.name}
                              </td>
                              <td className="px-4 py-3 font-semibold text-on-surface-variant">
                                 {FMT_PRICE(p.price)}
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant text-[12px]">
                                 {FMT_DATE(p.deletedAt)}
                              </td>
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-1">
                                    <button
                                       onClick={() =>
                                          restoreProduct.mutate(p.id)
                                       }
                                       disabled={restoreProduct.isPending}
                                       className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
                                    >
                                       <RotateCcw size={13} /> Khôi phục
                                    </button>
                                    <button
                                       onClick={() => {
                                          if (
                                             confirm(
                                                `Xóa vĩnh viễn "${p.name}"?`,
                                             )
                                          )
                                             deleteProduct.mutate(p.id);
                                       }}
                                       className="p-1.5 rounded-lg text-error hover:bg-error-container/30 transition-colors"
                                       title="Xóa vĩnh viễn"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )
            ) : articleCount === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                  <FileX size={40} className="mb-3 opacity-30" />
                  <p className="text-[14px]">
                     Không có bài viết nào trong thùng rác
                  </p>
               </div>
            ) : (
               <table className="w-full text-[13px]">
                  <thead>
                     <tr className="bg-surface-container-low border-b border-surface-variant">
                        {["Bài viết", "Tác giả", "Ngày xóa", "Thao tác"].map(
                           (h) => (
                              <th
                                 key={h}
                                 className="text-left px-4 py-3 font-semibold text-on-surface-variant"
                              >
                                 {h}
                              </th>
                           ),
                        )}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant">
                     {data!.articles.map((a) => (
                        <tr
                           key={a.id}
                           className="hover:bg-surface-container-low transition-colors opacity-70 hover:opacity-100"
                        >
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-9 rounded-lg bg-surface-container overflow-hidden shrink-0">
                                    {a.thumbnail ? (
                                       <Image
                                          src={a.thumbnail}
                                          alt={a.title}
                                          width={48}
                                          height={36}
                                          className="w-full h-full object-cover grayscale"
                                       />
                                    ) : (
                                       <FileX
                                          size={14}
                                          className="m-auto mt-2 text-outline"
                                       />
                                    )}
                                 </div>
                                 <p className="font-semibold text-on-surface line-through decoration-error/60 max-w-xs truncate">
                                    {a.title}
                                 </p>
                              </div>
                           </td>
                           <td className="px-4 py-3 text-on-surface-variant">
                              {a.author.fullName}
                           </td>
                           <td className="px-4 py-3 text-on-surface-variant text-[12px]">
                              {FMT_DATE(a.deletedAt)}
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                 <button
                                    onClick={() => restoreArticle.mutate(a.id)}
                                    disabled={restoreArticle.isPending}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
                                 >
                                    <RotateCcw size={13} /> Khôi phục
                                 </button>
                                 <button
                                    onClick={() => {
                                       if (
                                          confirm(`Xóa vĩnh viễn "${a.title}"?`)
                                       )
                                          deleteArticle.mutate(a.id);
                                    }}
                                    className="p-1.5 rounded-lg text-error hover:bg-error-container/30 transition-colors"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>
      </div>
   );
}
