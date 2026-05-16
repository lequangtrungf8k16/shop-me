import { Router } from "express";
import * as categoryController from "./category.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createCategorySchema } from "./category.schema";

const router = Router();

router.get("/", categoryController.getAllCategoriesController);
router.post(
   "/",
   validate(createCategorySchema),
   categoryController.createCategoryController,
);

export default router;
