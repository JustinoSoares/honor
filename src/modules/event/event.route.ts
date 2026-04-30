import * as schema from "./event.schema";
import { validate } from "../../middleware/validate";
import { EventController } from "./event.controller";
import { authentication } from "../../middleware/authorization";
import { Router } from "express";
const eventController = new EventController();
const eventRouter = Router();

eventRouter.post(
  "/create",
  authentication,
  validate(schema.CreateEventSchema),
  eventController.createEvent,
);


eventRouter.get("/list", authentication, eventController.getAllEvents);
eventRouter.get(
  "/each/:event_id",
  authentication,
  eventController.getEventById,
);
eventRouter.put(
  "/update/:event_id",
  authentication,
  validate(schema.EventUpdateSchema),
  eventController.updateEvent,
);
eventRouter.delete(
  "/delete/:event_id",
  authentication,
  eventController.deleteEvent,
);

export default eventRouter;
