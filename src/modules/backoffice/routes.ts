import * as schema from "./backoffice.schema";
import { validate } from "../../middleware/validate";
import { BackofficeController } from "./backoffice.controller";
import { authentication, authenticationAdmin } from "../../middleware/authorization";
import { Router } from "express";

const backofficeController = new BackofficeController();
const backofficeRouter = Router();

backofficeRouter.post(
  "/category/create",
  authenticationAdmin,
  validate(schema.CreateCategorySchema),
  backofficeController.createCategory,
);

backofficeRouter.get("/category/list", authenticationAdmin, backofficeController.getAllCategories);

backofficeRouter.get(
  "/category/each/:category_id",
  authenticationAdmin,
  backofficeController.getCategoryById,
);

backofficeRouter.put(
  "/category/update/:category_id",
  authenticationAdmin,
  validate(schema.CreateCategorySchema),
  backofficeController.updateCategory,
);

backofficeRouter.patch("/category/toggle", authenticationAdmin, backofficeController.toggleCategory);
backofficeRouter.get("/metrics", authenticationAdmin, backofficeController.getMetrics);

// Plan Routes
backofficeRouter.post(
  "/plan/create",
  authenticationAdmin,
  validate(schema.CreatePlanSchema),
  backofficeController.createPlan,
);

backofficeRouter.get("/plan/list", backofficeController.getAllPlans);

backofficeRouter.get("/plan/each/:id", backofficeController.getPlanById);

backofficeRouter.put(
  "/plan/update/:id",
  authenticationAdmin,
  validate(schema.UpdatePlanSchema),
  backofficeController.updatePlan,
);

backofficeRouter.delete("/plan/delete/:id", authenticationAdmin, backofficeController.deletePlan);

export default backofficeRouter;

