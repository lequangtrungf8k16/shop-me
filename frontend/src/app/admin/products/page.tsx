"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   Plus,
   Search,
   Pencil,
   Trash2,
   Package,
   ChevronLeft,
   ChevronRight,
   X,
   Loader2,
   Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface AdminProduct {
   id: number;
   name: string;
   slug: string;
   price: string;
   priceDiscount: string | null;
   stock: number;
   thumbnail: string | null;
   images: string[];
   category: { id: number; name: string };
   _count: { reviews: number; orderItems: number };
   createdAt: string;
}
interface ApiList {
   products: AdminProduct[];
   pagination: { total: number; page: number; totalPages: number };
}
interface Category {
   id: number;
   name: string;
}

const formatPrice = (v: string | number) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(Number(v));

// ── Form Modal ──────────────────────────────────────────────────────────────
function ProductModal({
   product,
   categories,
   onClose,
}: {
   product: AdminProduct | null;
   categories: Category[];
   onClose: () => void;
}) {
   const qc = useQueryClient();
   const isEdit = !!product;
   const [form, setForm] = useState({
      name: product?.name ?? "",
      description: "",
      price: product ? Number(product.price) : 0,
      priceDiscount: product?.priceDiscount
         ? Number(product.priceDiscount)
         : ("" as number | ""),
      stock: product?.stock ?? 0,
      thumbnail: product?.thumbnail ?? "",
      images: product?.images ?? [],
      categoryId: product?.category.id ?? categories[0]?.id ?? 0,
   });

   const [uploading, setUploading] = useState(false);

   const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, isThumbnail: boolean, index?: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append("image", file);
      
      setUploading(true);
      try {
         const res = await axiosInstance.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
         }) as any;
         
         const url = res.data?.data?.url;
         if (url) {
            // Because our uploads serve from the backend root, we need the full URL if frontend is separate, but we configured axios so it's fine? Wait.
            // If the frontend is NextJS on port 3000, and image src is "/uploads/...", it will try to fetch from localhost:3000/uploads.
            // We should prefix it with process.env.NEXT_PUBLIC_API_URL but removing /api.
            // Let's create the full URL.
            const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api").replace(/\/api\/?$/, "");
            const fullUrl = `${apiBase}${url}`;

            if (isThumbnail) {
               set("thumbnail", fullUrl);
            } else if (index !== undefined) {
               updateImage(index, fullUrl);
            }
            toast.success("Tải ảnh thành công");
         }
      } catch (err) {
         toast.error("Tải ảnh thất bại");
      } finally {
         setUploading(false);
         e.target.value = ''; // Reset input
      }
   };

   const mutation = useMutation({
      mutationFn: () =>
         isEdit
            ? axiosInstance.put(`/admin/products/${product!.id}`, form)
            : axiosInstance.post("/admin/products", form),
      onSuccess: () => {
         toast.success(isEdit ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm");
         qc.invalidateQueries({ queryKey: ["admin-products"] });
         onClose();
      },
      onError: (e: Error) => toast.error(e?.message ?? "Thao tác thất bại"),
   });

   const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

   const addImage = () => set("images", [...form.images, ""]);
   const updateImage = (index: number, val: string) => {
      const newImages = [...form.images];
      newImages[index] = val;
      set("images", newImages);
   };
   const removeImage = (index: number) => {
      const newImages = form.images.filter((_, i) => i !== index);
      set("images", newImages);
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
         <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant shrink-0">
               <h2 className="text-[16px] font-bold text-on-surface">
                  {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}
               </h2>
               <button
                  onClick={onClose}
                  className="text-on-surface-variant hover:text-on-surface"
               >
                  <X size={20} />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
               <div>
                  <label className="block text-[12px] font-semibold text-on-surface mb-1">
                     Tên sản phẩm *
                  </label>
                  <input
                     type="text"
                     value={form.name}
                     onChange={(e) => set("name", e.target.value)}
                     className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-variant text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
               </div>

               {/* Thumbnail Section */}
               <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="block text-[12px] font-semibold text-on-surface mb-1">
                        Ảnh đại diện (Thumbnail)
                     </label>
                     <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadFile(e, true)}
                        className="w-full text-[13px] text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                     />
                     {uploading && <p className="text-[11px] text-primary mt-1">Đang tải ảnh...</p>}
                  </div>
                  {form.thumbnail && (
                     <div className="w-16 h-16 rounded-lg overflow-hidden border border-surface-variant shrink-0 flex items-center justify-center bg-surface-container-low relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.thumbnail} alt="thumb" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        <button onClick={() => set("thumbnail", "")} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"><X size={16}/></button>
                     </div>
                  )}
               </div>

               {/* Images Section */}
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="block text-[12px] font-semibold text-on-surface">
                        Ảnh chi tiết sản phẩm (Slider)
                     </label>
                     <button
                        onClick={addImage}
                        type="button"
                        className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
                     >
                        <Plus size={12} /> Thêm ô upload
                     </button>
                  </div>
                  <div className="space-y-2">
                     {form.images.map((img, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                           <div className="flex-1 flex items-center">
                              {img ? (
                                 <div className="flex items-center gap-3 w-full bg-surface-container-lowest border border-surface-variant rounded-lg p-2">
                                    <div className="w-12 h-12 rounded overflow-hidden bg-surface-container-low shrink-0">
                                       {/* eslint-disable-next-line @next/next/no-img-element */}
                                       <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                    <span className="text-[11px] text-on-surface-variant truncate flex-1">{img}</span>
                                    <button
                                       onClick={() => removeImage(idx)}
                                       className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              ) : (
                                 <div className="flex-1 flex items-center gap-2">
                                    <input
                                       type="file"
                                       accept="image/*"
                                       onChange={(e) => uploadFile(e, false, idx)}
                                       className="flex-1 text-[13px] text-on-surface file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-surface-variant file:text-on-surface-variant hover:file:bg-surface-variant/80 cursor-pointer"
                                    />
                                    <button
                                       onClick={() => removeImage(idx)}
                                       className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     ))}
                     {form.images.length === 0 && (
                        <p className="text-[12px] text-on-surface-variant italic">Chưa có ảnh chi tiết nào. Bấm "Thêm ô upload" để tải ảnh.</p>
                     )}
                     {uploading && <p className="text-[11px] text-primary mt-1">Đang tải ảnh...</p>}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  {[
                     { label: "Giá (₫) *", key: "price" },
                     { label: "Giá KM (₫)", key: "priceDiscount" },
                     { label: "Tồn kho *", key: "stock" },
                  ].map(({ label, key }) => (
                     <div key={key}>
                        <label className="block text-[12px] font-semibold text-on-surface mb-1">
                           {label}
                        </label>
                        <input
                           type="number"
                           value={form[key as keyof typeof form] as number | ""}
                           onChange={(e) =>
                              set(
                                 key,
                                 e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                              )
                           }
                           className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-variant text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                     </div>
                  ))}
                  <div>
                     <label className="block text-[12px] font-semibold text-on-surface mb-1">
                        Danh mục *
                     </label>
                     <select
                        value={form.categoryId}
                        onChange={(e) =>
                           set("categoryId", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-variant text-[13px] text-on-surface focus:outline-none focus:border-primary"
                     >
                        {categories.map((c) => (
                           <option key={c.id} value={c.id}>
                              {c.name}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>
            </div>
            <div className="px-6 py-4 border-t border-surface-variant flex justify-end gap-2 shrink-0">
               <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-surface-variant text-[13px] font-semibold text-on-surface hover:bg-surface-container"
               >
                  Hủy
               </button>
               <button
                  onClick={() => mutation.mutate()}
                  disabled={
                     mutation.isPending ||
                     !form.name ||
                     !form.price ||
                     !form.categoryId
                  }
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-bold disabled:opacity-50 hover:opacity-90 flex items-center gap-2"
               >
                  {mutation.isPending && (
                     <Loader2 size={14} className="animate-spin" />
                  )}
                  {isEdit ? "Lưu" : "Tạo"}
               </button>
            </div>
         </div>
      </div>
   );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
   const qc = useQueryClient();
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState("");
   const [searchInput, setSearchInput] = useState("");
   const [modal, setModal] = useState<AdminProduct | null | "new">(null);

   const { data, isLoading } = useQuery<ApiList>({
      queryKey: ["admin-products", page, search],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: ApiList }>(
            `/admin/products?page=${page}&limit=15&search=${search}`,
         );
         return res.data;
      },
   });

   const { data: catData } = useQuery<Category[]>({
      queryKey: ["admin-categories-simple"],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: Category[] }>(
            "/admin/categories",
         );
         return res.data;
      },
   });

   const deleteMutation = useMutation({
      mutationFn: (id: number) => axiosInstance.delete(`/admin/products/${id}`),
      onSuccess: () => {
         toast.success("Đã chuyển vào thùng rác");
         qc.invalidateQueries({ queryKey: ["admin-products"] });
      },
      onError: (e: Error) => toast.error(e?.message ?? "Xóa thất bại"),
   });

   const handleSearch = () => {
      setSearch(searchInput);
      setPage(1);
   };

   return (
      <div className="space-y-5">
         {modal !== null && (
            <ProductModal
               product={modal === "new" ? null : modal}
               categories={catData ?? []}
               onClose={() => setModal(null)}
            />
         )}

         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
               <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2">
                  <Package size={20} className="text-primary" /> Sản phẩm
               </h1>
               <p className="text-[12px] text-on-surface-variant mt-0.5">
                  {data?.pagination.total ?? 0} sản phẩm
               </p>
            </div>
            <div className="flex items-center gap-2">
               <div className="relative">
                  <Search
                     size={14}
                     className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                     value={searchInput}
                     onChange={(e) => setSearchInput(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                     placeholder="Tìm sản phẩm..."
                     className="pl-8 pr-3 py-2 rounded-lg bg-surface border border-surface-variant text-[13px] w-52 focus:outline-none focus:border-primary"
                  />
               </div>
               <button
                  onClick={() => setModal("new")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-bold hover:opacity-90"
               >
                  <Plus size={16} /> Thêm
               </button>
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
                              "Sản phẩm",
                              "Danh mục",
                              "Giá",
                              "KM",
                              "Tồn",
                              "Đã bán",
                              "Thao tác",
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
                        {(data?.products ?? []).map((p) => (
                           <tr
                              key={p.id}
                              className="hover:bg-surface-container-low transition-colors"
                           >
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0">
                                       {p.thumbnail ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                             src={p.thumbnail}
                                             alt=""
                                             className="w-full h-full object-cover"
                                          />
                                       ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                             <Package
                                                size={16}
                                                className="text-outline"
                                             />
                                          </div>
                                       )}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="font-semibold text-on-surface truncate max-w-45">
                                          {p.name}
                                       </p>
                                       <p className="text-[11px] text-on-surface-variant">
                                          #{p.id}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 py-3">
                                 <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold">
                                    {p.category.name}
                                 </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-on-surface whitespace-nowrap">
                                 {formatPrice(p.price)}
                              </td>
                              <td className="px-4 py-3 text-primary font-semibold whitespace-nowrap">
                                 {p.priceDiscount
                                    ? formatPrice(p.priceDiscount)
                                    : "—"}
                              </td>
                              <td className="px-4 py-3">
                                 <span
                                    className={`font-bold ${p.stock === 0 ? "text-error" : p.stock < 10 ? "text-secondary" : "text-on-surface"}`}
                                 >
                                    {p.stock}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-on-surface-variant">
                                 {p._count.orderItems}
                              </td>
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-1">
                                    <button
                                       onClick={() => setModal(p)}
                                       className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                                       title="Sửa"
                                    >
                                       <Pencil size={14} />
                                    </button>
                                    <button
                                       onClick={() => {
                                          if (
                                             confirm(
                                                `Chuyển "${p.name}" vào thùng rác?`,
                                             )
                                          )
                                             deleteMutation.mutate(p.id);
                                       }}
                                       className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors"
                                       title="Xóa"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {/* Pagination */}
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
