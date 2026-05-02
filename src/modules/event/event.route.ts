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

eventRouter.post(
  "/verify/:event_id",
  authentication, // verify admin
  eventController.verifyEvent,
);

eventRouter.post(
  "/add/package/:event_id",
  authentication,
  validate(schema.CreatePackage),
  eventController.addMemberToEvent,
);

eventRouter.put(
  "/update/package/:event_id",
  authentication,
  validate(schema.CreatePackage),
  eventController.editarPackageInEvent,
);

eventRouter.get(
  "/list/package/:event_id",
  authentication,
  eventController.listPackagesByEvent,
);

eventRouter.get(
  "/get/package/:package_id",
  authentication,
  eventController.getPackageById,
);

eventRouter.delete(
  "/delete/package/:package_id",
  authentication,
  eventController.deletePackage,
);

eventRouter.post(
  "/add/member/:event_id",
  authentication,
  eventController.addMemberToEvent,
);

eventRouter.delete(
  "/remove/member/:event_id/:user_id",
  authentication,
  eventController.removeMemberFromEvent,
);

eventRouter.post(
  "/add/image/:event_id",
  authentication,
  validate(schema.CreateImageSchema),
  eventController.addImageToEvent,
);

eventRouter.get(
  "/list/image/:event_id",
  authentication,
  eventController.listImagesByEvent,
);

eventRouter.get(
  "/get/image/:image_id",
  authentication,
  eventController.getImageById,
);

eventRouter.put(
  "/update/image/:image_id",
  authentication,
  validate(schema.CreateImageSchema),
  eventController.updateImage,
);

eventRouter.delete(
  "/delete/image/:image_id",
  authentication,
  eventController.deleteImage,
);

eventRouter.post(
  "/read/code",
  authentication,
  eventController.readCode,
);

eventRouter.get(
  "/history/:event_id",
  authentication,
  eventController.historyInvitationsByEvent,
);

export default eventRouter;
