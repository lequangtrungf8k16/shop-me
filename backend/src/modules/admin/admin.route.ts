import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { updateOrderStatus } from "../orders/order.service";

// Services
import * as adminService from "./admin.service";
import * as productsService from "./admin-products.service";
import * as categoriesService from "./admin-categories.service";
import * as ordersService from "./admin-orders.service";
import * as articlesService from "./admin-articles.service";
import * as moderateService from "./admin-moderate.service";
import * as reportsService from "./admin-reports.service";
import * as trashService from "./admin-trash.service";
import * as settingsService from "./admin-settings.service";
import * as contactService from "../contact/contact.service";
import type { ApiResponse } from "../../shared/types/index";
import type { OrderStatus } from "../../generated/prisma/client";

const router = Router();
router.use(authMiddleware);
router.use(adminMiddleware);

const ok = (res: any, data: unknown, message = "Thành công") =>
   res.status(200).json({ status: "success", message, data } as ApiResponse);

const created = (res: any, data: unknown, message = "Đã tạo") =>
   res.status(201).json({ status: "success", message, data } as ApiResponse);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard", async (_req, res, next) => {
   try {
      const data = await adminService.getDashboardStats();
      ok(res, data, "Lấy thống kê thành công");
   } catch (e) {
      next(e);
   }
});

// ─── Users ────────────────────────────────────────────────────────────────────
router.get("/users", async (req, res, next) => {
   try {
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 15;
      const data = await adminService.getAllUsers(page, limit);
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.patch("/users/:id/toggle-status", async (req, res, next) => {
   try {
      const data = await adminService.toggleUserStatus(
         Number(req.params["id"]),
      );
      ok(res, data, `Tài khoản đã được ${data.isActive ? "mở khóa" : "khóa"}`);
   } catch (e) {
      next(e);
   }
});

// ─── Products ─────────────────────────────────────────────────────────────────
router.get("/products", async (req, res, next) => {
   try {
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 15;
      const search = String(req.query["search"] ?? "");
      const categoryId = req.query["categoryId"]
         ? Number(req.query["categoryId"])
         : undefined;
      const data = await productsService.adminGetProducts(
         page,
         limit,
         search,
         categoryId,
      );
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.post("/products", async (req, res, next) => {
   try {
      const data = await productsService.adminCreateProduct(req.body);
      created(res, data, "Đã tạo sản phẩm");
   } catch (e) {
      next(e);
   }
});

router.put("/products/:id", async (req, res, next) => {
   try {
      const data = await productsService.adminUpdateProduct(
         Number(req.params["id"]),
         req.body,
      );
      ok(res, data, "Đã cập nhật sản phẩm");
   } catch (e) {
      next(e);
   }
});

router.delete("/products/:id", async (req, res, next) => {
   try {
      await productsService.adminSoftDeleteProduct(Number(req.params["id"]));
      ok(res, null, "Đã chuyển sản phẩm vào thùng rác");
   } catch (e) {
      next(e);
   }
});

// ─── Categories ───────────────────────────────────────────────────────────────
router.get("/categories", async (_req, res, next) => {
   try {
      const data = await categoriesService.adminGetCategories();
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.post("/categories", async (req, res, next) => {
   try {
      const data = await categoriesService.adminCreateCategory(req.body);
      created(res, data, "Đã tạo danh mục");
   } catch (e) {
      next(e);
   }
});

router.put("/categories/:id", async (req, res, next) => {
   try {
      const data = await categoriesService.adminUpdateCategory(
         Number(req.params["id"]),
         req.body,
      );
      ok(res, data, "Đã cập nhật danh mục");
   } catch (e) {
      next(e);
   }
});

router.delete("/categories/:id", async (req, res, next) => {
   try {
      await categoriesService.adminDeleteCategory(Number(req.params["id"]));
      ok(res, null, "Đã xóa danh mục");
   } catch (e) {
      next(e);
   }
});

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get("/orders", async (req, res, next) => {
   try {
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 15;
      const status = req.query["status"] as string | undefined;
      const search = String(req.query["search"] ?? "");
      const data = await ordersService.adminGetOrders(
         page,
         limit,
         status,
         search,
      );
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.get("/orders/:id", async (req, res, next) => {
   try {
      const data = await ordersService.adminGetOrderDetail(
         Number(req.params["id"]),
      );
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.patch("/orders/:id/status", async (req, res, next) => {
   try {
      const orderId = Number(req.params["id"]);
      const { status } = req.body as { status: string };
      const updated = await updateOrderStatus(orderId, status);

      // Dùng helper ok() cho đồng bộ với các API khác trong file
      ok(res, updated, "Đã cập nhật trạng thái đơn hàng");
   } catch (err) {
      next(err);
   }
});

// ─── Articles ─────────────────────────────────────────────────────────────────
router.get("/articles", async (req, res, next) => {
   try {
      const page = Number(req.query["page"]) || 1;
      const limit = Number(req.query["limit"]) || 15;
      const published =
         req.query["published"] !== undefined
            ? req.query["published"] === "true"
            : undefined;
      const data = await articlesService.adminGetArticles(
         page,
         limit,
         published,
      );
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.patch("/articles/:id/toggle-publish", async (req, res, next) => {
   try {
      const data = await articlesService.adminTogglePublish(
         Number(req.params["id"]),
      );
      ok(res, data, `Bài viết đã ${data.published ? "được publish" : "ẩn"}`);
   } catch (e) {
      next(e);
   }
});

router.put("/articles/:id", async (req, res, next) => {
   try {
      const data = await articlesService.adminUpdateArticle(
         Number(req.params["id"]),
         req.body,
      );
      ok(res, data, "Đã cập nhật bài viết");
   } catch (e) {
      next(e);
   }
});

router.delete("/articles/:id", async (req, res, next) => {
   try {
      await articlesService.adminSoftDeleteArticle(Number(req.params["id"]));
      ok(res, null, "Đã chuyển bài viết vào thùng rác");
   } catch (e) {
      next(e);
   }
});

// ─── Moderate: Reviews & Comments ─────────────────────────────────────────────
router.get("/reviews", async (req, res, next) => {
   try {
      const page = Number(req.query["page"]) || 1;
      const data = await moderateService.adminGetReviews(page);
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.delete("/reviews/:id", async (req, res, next) => {
   try {
      await moderateService.adminDeleteReview(Number(req.params["id"]));
      ok(res, null, "Đã xóa đánh giá");
   } catch (e) {
      next(e);
   }
});

router.get("/comments", async (req, res, next) => {
   try {
      const page = Number(req.query["page"]) || 1;
      const data = await moderateService.adminGetComments(page);
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.delete("/comments/:id", async (req, res, next) => {
   try {
      await moderateService.adminDeleteComment(Number(req.params["id"]));
      ok(res, null, "Đã xóa bình luận");
   } catch (e) {
      next(e);
   }
});

// ─── Reports ──────────────────────────────────────────────────────────────────
router.get("/reports/summary", async (_req, res, next) => {
   try {
      const data = await reportsService.getReportSummary();
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.get("/reports/revenue-by-month", async (_req, res, next) => {
   try {
      const data = await reportsService.getRevenueByMonth();
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.get("/reports/top-products", async (_req, res, next) => {
   try {
      const data = await reportsService.getTopProducts();
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

// ─── Trash ────────────────────────────────────────────────────────────────────
router.get("/trash", async (_req, res, next) => {
   try {
      const data = await trashService.getTrashItems();
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.patch("/trash/products/:id/restore", async (req, res, next) => {
   try {
      await trashService.restoreProduct(Number(req.params["id"]));
      ok(res, null, "Đã khôi phục sản phẩm");
   } catch (e) {
      next(e);
   }
});

router.delete("/trash/products/:id", async (req, res, next) => {
   try {
      await trashService.permanentDeleteProduct(Number(req.params["id"]));
      ok(res, null, "Đã xóa vĩnh viễn sản phẩm");
   } catch (e) {
      next(e);
   }
});

router.patch("/trash/articles/:id/restore", async (req, res, next) => {
   try {
      await trashService.restoreArticle(Number(req.params["id"]));
      ok(res, null, "Đã khôi phục bài viết");
   } catch (e) {
      next(e);
   }
});

router.delete("/trash/articles/:id", async (req, res, next) => {
   try {
      await trashService.permanentDeleteArticle(Number(req.params["id"]));
      ok(res, null, "Đã xóa vĩnh viễn bài viết");
   } catch (e) {
      next(e);
   }
});

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get("/settings", async (_req, res, next) => {
   try {
      const data = await settingsService.getAllSettings();
      ok(res, data);
   } catch (e) {
      next(e);
   }
});

router.put("/settings", async (req, res, next) => {
   try {
      const { updates } = req.body as {
         updates: { key: string; value: string }[];
      };
      const data = await settingsService.updateSettings(updates);
      ok(res, data, "Đã lưu cài đặt");
   } catch (e) {
      next(e);
   }
});

// ─── Messages (Contact Support) ───────────────────────────────────────────────
router.get("/messages", async (req, res, next) => {
   try {
      const page = Number(req.query["page"]) || 1;
      const status = req.query["status"] as string | undefined;
      const data = await contactService.adminGetContactMessages(page, 15, status);
      ok(res, data);
   } catch (e) { next(e); }
});

router.post("/messages/:id/reply", async (req, res, next) => {
   try {
      const { reply } = req.body as { reply: string };
      const data = await contactService.adminReplyContactMessage(Number(req.params["id"]), reply);
      ok(res, data, "Đã gửi phản hồi");
   } catch (e) { next(e); }
});

router.patch("/messages/:id/close", async (req, res, next) => {
   try {
      const data = await contactService.adminCloseContactMessage(Number(req.params["id"]));
      ok(res, data, "Đã đóng ticket");
   } catch (e) { next(e); }
});

export default router;
