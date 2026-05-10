import { Router } from "express";
import { AvaliationController } from "./avaliation.controller";
import { authentication } from "../../middleware/authorization";
import { validate } from "../../middleware/validate";
import * as schema from "./avaliation.schema";

const avaliationRouter = Router();
const controller = new AvaliationController();

avaliationRouter.post(
  "/create",
  authentication,
  validate(schema.CreateAvaliationSchema),
  controller.createAvaliation,
);

avaliationRouter.get("/event/:event_id", authentication, controller.getAvaliationsByEvent);

avaliationRouter.put(
  "/update/:avaliation_id",
  authentication,
  validate(schema.UpdateAvaliationSchema),
  controller.updateAvaliation,
);

avaliationRouter.delete("/delete/:avaliation_id", authentication, controller.deleteAvaliation);

export default avaliationRouter;
