"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   Plus,
   Pencil,
   Trash2,
   Tag,
   Loader2,
   X,
   CheckCircle,
   XCircle,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface AdminCategory {
   id: number;
   name: string;
   slug: string;
   description: string | null;
   isActive: boolean;
   parentId: number | null;
   createdAt: string;
   _count: { products: number };
}

function CategoryModal({
   item,
   all,
   onClose,
}: {
   item: AdminCategory | null;
   all: AdminCategory[];
   onClose: () => void;
}) {
   const qc = useQueryClient();
   const isEdit = !!item;
   const [form, setForm] = useState({
      name: item?.name ?? "",
      description: item?.description ?? "",
      isActive: item?.isActive ?? true,
      parentId: item?.parentId ?? ("" as number | ""),
   });

   const mutation = useMutation({
      mutationFn: () =>
         isEdit
            ? axiosInstance.put(`/admin/categories/${item!.id}`, form)
            : axiosInstance.post("/admin/categories", form),
      onSuccess: () => {
         toast.success(isEdit ? "Đã cập nhật danh mục" : "Đã tạo danh mục");
         qc.invalidateQueries({ queryKey: ["admin-categories"] });
         onClose();
      },
      onError: (e: Error) => toast.error(e?.message ?? "Thất bại"),
   });

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
         <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant">
               <h2 className="text-[16px] font-bold text-on-surface">
                  {isEdit ? "Sửa danh mục" : "Thêm danh mục"}
               </h2>
               <button onClick={onClose}>
                  <X size={20} className="text-on-surface-variant" />
               </button>
            </div>
            <div className="px-6 py-4 space-y-4">
               <div>
                  <label className="block text-[12px] font-semibold text-on-surface mb-1">
                     Tên danh mục *
                  </label>
                  <input
                     value={form.name}
                     onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                     }
                     className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-variant text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
               </div>
               <div>
                  <label className="block text-[12px] font-semibold text-on-surface mb-1">
                     Mô tả
                  </label>
                  <textarea
                     value={form.description}
                     onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                     }
                     rows={2}
                     className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-variant text-[13px] text-on-surface focus:outline-none focus:border-primary resize-none"
                  />
               </div>
               <div>
                  <label className="block text-[12px] font-semibold text-on-surface mb-1">
                     Danh mục cha
                  </label>
                  <select
                     value={form.parentId}
                     onChange={(e) =>
                        setForm((f) => ({
                           ...f,
                           parentId: e.target.value
                              ? Number(e.target.value)
                              : "",
                        }))
                     }
                     className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-variant text-[13px] text-on-surface focus:outline-none focus:border-primary"
                  >
                     <option value="">— Không có —</option>
                     {all
                        .filter((c) => c.id !== item?.id)
                        .map((c) => (
                           <option key={c.id} value={c.id}>
                              {c.name}
                           </option>
                        ))}
                  </select>
               </div>
               <label className="flex items-center gap-2 cursor-pointer">
                  <input
                     type="checkbox"
                     checked={form.isActive}
                     onChange={(e) =>
                        setForm((f) => ({ ...f, isActive: e.target.checked }))
                     }
                     className="w-4 h-4 accent-primary"
                  />
                  <span className="text-[13px] font-semibold text-on-surface">
                     Kích hoạt
                  </span>
               </label>
            </div>
            <div className="px-6 py-4 border-t border-surface-variant flex justify-end gap-2">
               <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-surface-variant text-[13px] font-semibold text-on-surface hover:bg-surface-container"
               >
                  Hủy
               </button>
               <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || !form.name}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-bold disabled:opacity-50 hover:opacity-90 flex items-center gap-2"
               >
                  {mutation.isPending && (
                     <Loader2 size={13} className="animate-spin" />
                  )}
                  {isEdit ? "Lưu" : "Tạo"}
               </button>
            </div>
         </div>
      </div>
   );
}

export default function AdminCategoriesPage() {
   const qc = useQueryClient();
   const [modal, setModal] = useState<AdminCategory | null | "new">(null);

   const { data, isLoading } = useQuery<AdminCategory[]>({
      queryKey: ["admin-categories"],
      queryFn: async () => {
         const res = await axiosInstance.get<
            unknown,
            { data: AdminCategory[] }
         >("/admin/categories");
         return res.data;
      },
   });

   const deleteMutation = useMutation({
      mutationFn: (id: number) =>
         axiosInstance.delete(`/admin/categories/${id}`),
      onSuccess: () => {
         toast.success("Đã xóa danh mục");
         qc.invalidateQueries({ queryKey: ["admin-categories"] });
      },
      onError: (e: Error) => toast.error(e?.message ?? "Xóa thất bại"),
   });

   return (
      <div className="space-y-5">
         {modal !== null && (
            <CategoryModal
               item={modal === "new" ? null : modal}
               all={data ?? []}
               onClose={() => setModal(null)}
            />
         )}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2">
                  <Tag size={20} className="text-primary" /> Danh mục
               </h1>
               <p className="text-[12px] text-on-surface-variant mt-0.5">
                  {data?.length ?? 0} danh mục
               </p>
            </div>
            <button
               onClick={() => setModal("new")}
               className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-bold hover:opacity-90"
            >
               <Plus size={16} /> Thêm
            </button>
         </div>

         <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
               <div className="flex items-center justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-primary" />
               </div>
            ) : (
               <table className="w-full text-[13px]">
                  <thead>
                     <tr className="bg-surface-container-low border-b border-surface-variant">
                        {[
                           "Tên danh mục",
                           "Slug",
                           "Sản phẩm",
                           "Trạng thái",
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
                     {(data ?? []).map((cat) => (
                        <tr
                           key={cat.id}
                           className="hover:bg-surface-container-low transition-colors"
                        >
                           <td className="px-4 py-3 font-semibold text-on-surface">
                              {cat.name}
                           </td>
                           <td className="px-4 py-3 text-on-surface-variant font-mono text-[11px]">
                              {cat.slug}
                           </td>
                           <td className="px-4 py-3 text-center font-bold text-on-surface">
                              {cat._count.products}
                           </td>
                           <td className="px-4 py-3">
                              {cat.isActive ? (
                                 <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle size={10} />
                                    Hiển thị
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 text-[11px] font-bold text-error bg-error-container px-2 py-0.5 rounded-full">
                                    <XCircle size={10} />
                                    Ẩn
                                 </span>
                              )}
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                 <button
                                    onClick={() => setModal(cat)}
                                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary"
                                 >
                                    <Pencil size={14} />
                                 </button>
                                 <button
                                    onClick={() => {
                                       if (
                                          confirm(`Xóa danh mục "${cat.name}"?`)
                                       )
                                          deleteMutation.mutate(cat.id);
                                    }}
                                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error"
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
