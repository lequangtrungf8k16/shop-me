"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface SiteSetting {
   id: number;
   key: string;
   value: string;
   label: string;
}

const SETTING_GROUPS = [
   {
      title: "Thông tin cửa hàng",
      keys: ["site_name", "site_tagline", "banner_text"],
   },
   {
      title: "Liên hệ",
      keys: ["contact_email", "contact_phone", "contact_address"],
   },
   {
      title: "Chính sách thanh toán",
      keys: ["free_ship_threshold", "tax_rate"],
   },
];

export default function AdminSettingsPage() {
   const qc = useQueryClient();
   const [formValues, setFormValues] = useState<Record<string, string>>({});
   const [saved, setSaved] = useState(false);

   const { data, isLoading } = useQuery<SiteSetting[]>({
      queryKey: ["admin-settings"],
      queryFn: async () => {
         const res = await axiosInstance.get<unknown, { data: SiteSetting[] }>(
            "/admin/settings",
         );
         return res.data;
      },
   });

   useEffect(() => {
      if (data) {
         const vals: Record<string, string> = {};
         data.forEach((s) => {
            vals[s.key] = s.value;
         });
         const timer = setTimeout(() => setFormValues(vals), 0);
         return () => clearTimeout(timer);
      }
   }, [data]);

   const saveMutation = useMutation({
      mutationFn: () => {
         const updates = Object.entries(formValues).map(([key, value]) => ({
            key,
            value,
         }));
         return axiosInstance.put("/admin/settings", { updates });
      },
      onSuccess: () => {
         toast.success("Đã lưu cài đặt");
         qc.invalidateQueries({ queryKey: ["admin-settings"] });
         setSaved(true);
         setTimeout(() => setSaved(false), 2000);
      },
      onError: (e: Error) => toast.error(e?.message ?? "Lưu thất bại"),
   });

   const getLabelForKey = (key: string) =>
      data?.find((s) => s.key === key)?.label ?? key;

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-[22px] font-bold text-on-surface flex items-center gap-2">
                  <Settings size={20} className="text-primary" /> Cài đặt hệ
                  thống
               </h1>
               <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Cấu hình thông tin cửa hàng
               </p>
            </div>
            <button
               onClick={() => saveMutation.mutate()}
               disabled={saveMutation.isPending || isLoading}
               className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-[13px] font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
               {saveMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
               ) : saved ? (
                  <CheckCircle size={15} />
               ) : (
                  <Save size={15} />
               )}
               {saved ? "Đã lưu!" : "Lưu cài đặt"}
            </button>
         </div>

         {isLoading ? (
            <div className="flex items-center justify-center py-20">
               <Loader2 size={32} className="animate-spin text-primary" />
            </div>
         ) : (
            <div className="space-y-5 max-w-2xl">
               {SETTING_GROUPS.map((group) => (
                  <div
                     key={group.title}
                     className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm"
                  >
                     <div className="px-5 py-3 bg-surface-container-low border-b border-surface-variant">
                        <h2 className="text-[13px] font-bold text-on-surface">
                           {group.title}
                        </h2>
                     </div>
                     <div className="p-5 space-y-4">
                        {group.keys.map((key) => (
                           <div key={key}>
                              <label className="block text-[12px] font-semibold text-on-surface mb-1.5">
                                 {getLabelForKey(key)}
                              </label>
                              <input
                                 value={formValues[key] ?? ""}
                                 onChange={(e) =>
                                    setFormValues((f) => ({
                                       ...f,
                                       [key]: e.target.value,
                                    }))
                                 }
                                 className="w-full px-4 py-2.5 rounded-lg bg-surface-container border border-surface-variant text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
