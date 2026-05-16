import type { NextFunction, Request, Response } from "express";
import * as categoryService from "./category.service";
import type { ApiResponse } from "../../shared/types";

export const createCategoryController = async (
   req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const newCategory = await categoryService.createCategory(req.body);

      const response: ApiResponse = {
         status: "success",
         message: "Danh mục được tạo thành công",
         data: newCategory,
      };

      res.status(201).json(response);
   } catch (error) {
      next(error);
   }
};

export const getAllCategoriesController = async (
   _req: Request,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const categories = await categoryService.getAllCategories();

      const response: ApiResponse = {
         status: "success",
         message: "Lấy danh sách danh mục thành công",
         data: categories,
      };

      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
};
