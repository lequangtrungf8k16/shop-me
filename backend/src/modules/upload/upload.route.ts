import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../../shared/errors/AppError.js";

const router = Router();

// Thư mục lưu trữ ảnh (lưu ở thư mục gốc của project)
const uploadDir = path.resolve(process.cwd(), "../uploads");
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
   destination: (_req, _file, cb) => {
      cb(null, uploadDir);
   },
   filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
   },
});

const upload = multer({
   storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
   fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
         cb(null, true);
      } else {
         cb(new AppError("Chỉ cho phép tải lên hình ảnh", 400));
      }
   },
});

router.post("/", upload.single("image"), (req, res, next) => {
   try {
      if (!req.file) {
         throw new AppError("Không tìm thấy tệp ảnh", 400);
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
         status: "success",
         data: { url: imageUrl },
      });
   } catch (error) {
      next(error);
   }
});

export default router;
