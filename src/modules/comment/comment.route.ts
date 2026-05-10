import { Router } from "express";
import { CommentController } from "./comment.controller";
import { authentication } from "../../middleware/authorization";
import { validate } from "../../middleware/validate";
import * as schema from "./comment.schema";

const commentRouter = Router();
const controller = new CommentController();

commentRouter.post(
  "/create",
  authentication,
  validate(schema.CreateCommentSchema),
  controller.createComment,
);

commentRouter.get("/event/:event_id", authentication, controller.getCommentsByEvent);

commentRouter.get("/each/:comment_id", authentication, controller.getCommentById);

commentRouter.put(
  "/update/:comment_id",
  authentication,
  validate(schema.UpdateCommentSchema),
  controller.updateComment,
);

commentRouter.delete("/delete/:comment_id", authentication, controller.deleteComment);

export default commentRouter;
