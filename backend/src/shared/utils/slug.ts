import slugify from "slugify";

export const createSlug = (text: string): string => {
   return slugify(text, {
      lower: true, // Chuyển tất cả thành chữ thường
      strict: true, // Giữ lại chữ cái và số
      locale: "en", // Chuyển thành không dấu
      trim: true, // Xóa khoảng trắng đầu, cuối
   });
};
