import type { NextFunction, Request, Response } from "express";
import * as productService from "./product.service";
import type { ApiResponse } from "../../shared/types/index";

export const getProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query["page"]) || 1;
    const limit = Number(req.query["limit"]) || 12;
    const result = await productService.getAllProducts(page, limit, {
      search: req.query["search"] ? String(req.query["search"]) : undefined,
      categoryId: req.query["categoryId"] ? Number(req.query["categoryId"]) : undefined,
      categorySlug: req.query["category"] ? String(req.query["category"]) : undefined,
      sortBy: (req.query["sortBy"] as any) || "createdAt",
      sortOrder: (req.query["sortOrder"] as any) || "desc",
      minPrice: req.query["minPrice"] ? Number(req.query["minPrice"]) : undefined,
      maxPrice: req.query["maxPrice"] ? Number(req.query["maxPrice"]) : undefined,
    });
    res.status(200).json({ status: "success", message: "Thành công", data: result } as ApiResponse);
  } catch (error) { next(error); }
};

export const getProductBySlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (!slug) { res.status(400).json({ status: "error", message: "Slug không hợp lệ" }); return; }
    const product = await productService.getProductBySlug(slug);
    res.status(200).json({ status: "success", message: "Thành công", data: product } as ApiResponse);
  } catch (error) { next(error); }
};

export const createProductController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json({ status: "success", message: "Đã tạo sản phẩm", data: newProduct } as ApiResponse);
  } catch (error) { next(error); }
};

export const getRelatedProductsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug!).catch(() => null);
    if (!product) { res.json({ status: "success", data: [] }); return; }
    const related = await productService.getRelatedProducts(product.id, product.categoryId);
    res.json({ status: "success", data: related });
  } catch (error) { next(error); }
};
