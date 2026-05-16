import type { NextFunction, Request, Response } from "express";
import * as articleService from "./article.service";

export const getArticlesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query["page"]) || 1;
    const limit = Number(req.query["limit"]) || 9;
    const search = String(req.query["search"] ?? "");
    const data = await articleService.getPublishedArticles(page, limit, search);
    res.json({ status: "success", data });
  } catch (err) { next(err); }
};

export const getArticleBySlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await articleService.getArticleBySlug(req.params["slug"]!);
    res.json({ status: "success", data });
  } catch (err) { next(err); }
};

export const getRelatedArticlesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await articleService.getArticleBySlug(req.params["slug"]!).catch(() => null);
    if (!article) { res.json({ status: "success", data: [] }); return; }
    const data = await articleService.getRelatedArticles(article.id);
    res.json({ status: "success", data });
  } catch (err) { next(err); }
};

export const createArticleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorId = (req as any).user.id as number;
    const data = await articleService.createArticle(authorId, req.body);
    res.status(201).json({ status: "success", data });
  } catch (err) { next(err); }
};

export const updateArticleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await articleService.updateArticle(Number(req.params["id"]), req.body);
    res.json({ status: "success", data });
  } catch (err) { next(err); }
};

export const deleteArticleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await articleService.deleteArticle(Number(req.params["id"]));
    res.json({ status: "success", message: "Đã xóa bài viết" });
  } catch (err) { next(err); }
};
