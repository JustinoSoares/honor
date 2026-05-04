import * as schema from "./backoffice.schema";
import { validate } from "../../middleware/validate";
import { BackofficeController } from "./backoffice.controller";
import { authentication } from "../../middleware/authorization";
import { Router } from "express";

const backofficeController = new BackofficeController();
const backofficeRouter = Router();

backofficeRouter.post(
  "/category/create",
  authentication,
  validate(schema.CreateCategorySchema),
  backofficeController.createCategory,
);

backofficeRouter.get("/category/list", authentication, backofficeController.getAllCategories);

backofficeRouter.get(
  "/category/each/:category_id",
  authentication,
  backofficeController.getCategoryById,
);

backofficeRouter.put(
  "/category/update/:category_id",
  authentication,
  validate(schema.CreateCategorySchema),
  backofficeController.updateCategory,
);

backofficeRouter.patch("/category/toggle", authentication, backofficeController.toggleCategory);

export default backofficeRouter;
