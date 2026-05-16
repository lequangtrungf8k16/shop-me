import { Router } from "express";
import * as productController from "./product.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createProductSchema } from "./product.schema";

const router = Router();

router.get("/", productController.getProductController);
router.post("/", validate(createProductSchema), productController.createProductController);
router.get("/:slug/related", productController.getRelatedProductsController);
router.get("/:slug", productController.getProductBySlugController);

export default router;
