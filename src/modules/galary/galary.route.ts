import { Router } from "express";
import { GalaryController } from "./galary.controller";
import { authentication, authenticationAdmin } from "../../middleware/authorization";
import { validate } from "../../middleware/validate";
import * as schema from "./galary.schema";

const galaryController = new GalaryController();
const galaryRouter = Router();

galaryRouter.post(
  "/",
  authentication,
  authenticationAdmin,
  validate(schema.CreateGalarySchema),
  galaryController.create,
);

galaryRouter.get("/", galaryController.list);

galaryRouter.get("/:id", galaryController.getById);

galaryRouter.put(
  "/:id",
  authentication,
  authenticationAdmin,
  validate(schema.UpdateGalarySchema),
  galaryController.update,
);

galaryRouter.delete("/:id", authentication, authenticationAdmin, galaryController.delete);

export default galaryRouter;
