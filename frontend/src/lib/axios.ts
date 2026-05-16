import axios from "axios";

const axiosInstance = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
   timeout: 10000,
   headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR — Tự động gắn JWT vào mọi request cần auth
axiosInstance.interceptors.request.use(
   (config) => {
      // Đọc token từ Zustand persist (lưu trong localStorage với key "technology-auth")
      if (typeof window !== "undefined") {
         try {
            const raw = localStorage.getItem("technology-auth");
            if (raw) {
               const parsed = JSON.parse(raw) as { state?: { token?: string } };
               const token = parsed?.state?.token;
               if (token) {
                  config.headers["Authorization"] = `Bearer ${token}`;
               }
            }
         } catch {
            // Bỏ qua lỗi parse
         }
      }
      return config;
   },
   (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR — Chuẩn hóa lỗi trả về
axiosInstance.interceptors.response.use(
   (response) => response.data,
   (error) => {
      const customError = {
         message: "Có lỗi xảy ra, vui lòng thử lại.",
         status: error.response?.status as number | undefined,
         data: null as unknown,
      };

      if (error.response) {
         customError.message =
            (error.response.data as { message?: string })?.message ??
            customError.message;
         customError.data = error.response.data;

         // Token hết hạn → xóa auth store, redirect về login
         if (error.response.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("technology-auth");
            window.location.href = "/login";
         }
      } else if (error.request) {
         customError.message =
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      }

      return Promise.reject(customError);
   },
);

export default axiosInstance;
