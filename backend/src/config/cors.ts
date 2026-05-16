import cors from "cors";
import { AppError } from "../shared/errors/AppError";

const allowedOrigins = process.env["ALLOWED_ORIGINS"]?.split(",") ?? [
   "http://localhost:3000",
];

export const corsMiddleware = cors({
   origin: (origin, callback) => {
      // Cho phép request không có origin (Postman, Mobile App) hoặc nằm trong whitelist
      if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
      } else {
         callback(new AppError("Not allowed by CORS", 403));
      }
   },
   credentials: true,
});
