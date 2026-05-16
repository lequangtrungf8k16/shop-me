import { ZodError, ZodType } from "zod";
import type { NextFunction, Request, Response } from "express";

// Middleware kiểm tra dữ liệu đầu vào
export const validate = (schema: ZodType) => {
   return async (
      req: Request,
      res: Response,
      next: NextFunction,
   ): Promise<void> => {
      try {
         // So sánh dữ liệu đầu vào
         await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
         });
         //  Dữ liệu hợp lệ cho đi tiếp
         next();
      } catch (error) {
         // Nếu lỗi thì hiển thị lỗi của zod
         if (error instanceof ZodError) {
            res.status(400).json({
               status: "error",
               message: "Dữ liệu đầu vào không hợp lệ",
               // Định dạng cấu trúc hiện lỗi
               errors: error.issues.map((e) => ({
                  field: e.path.join("."),
                  message: e.message,
               })),
            });
            return;
         }
         //  Lỗi khác chuyển cho Error của express
         next(error);
      }
   };
};
