import { prisma } from "../../config/prisma";

const DEFAULT_SETTINGS = [
   { key: "site_name", value: "TECHNOLOGY", label: "Tên cửa hàng" },
   {
      key: "site_tagline",
      value: "Thiết bị công nghệ hàng đầu",
      label: "Slogan",
   },
   {
      key: "contact_email",
      value: "support@technology.local",
      label: "Email liên hệ",
   },
   { key: "contact_phone", value: "1900 0000", label: "Số điện thoại" },
   { key: "contact_address", value: "Hà Nội, Việt Nam", label: "Địa chỉ" },
   {
      key: "banner_text",
      value: "Miễn phí vận chuyển đơn trên 500.000₫",
      label: "Banner thông báo",
   },
   {
      key: "free_ship_threshold",
      value: "500000",
      label: "Ngưỡng miễn phí ship (₫)",
   },
   { key: "tax_rate", value: "10", label: "Thuế VAT (%)" },
];

// Lấy tất cả settings — tự khởi tạo nếu chưa có
export const getAllSettings = async () => {
   const existing = await prisma.siteSetting.findMany({
      orderBy: { id: "asc" },
   });

   if (existing.length === 0) {
      await prisma.siteSetting.createMany({ data: DEFAULT_SETTINGS });
      return prisma.siteSetting.findMany({ orderBy: { id: "asc" } });
   }

   return existing;
};

// Cập nhật nhiều settings cùng lúc
export const updateSettings = async (
   updates: { key: string; value: string }[],
) => {
   await Promise.all(
      updates.map(({ key, value }) =>
         prisma.siteSetting.upsert({
            where: { key },
            update: { value },
            create: {
               key,
               value,
               label: key.replace(/_/g, " "),
            },
         }),
      ),
   );

   return getAllSettings();
};
