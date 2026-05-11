import * as schema from "./event.schema";
import { validate } from "../../middleware/validate";
import { EventController } from "./event.controller";
import { authentication, authenticationAdmin } from "../../middleware/authorization";
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
eventRouter.get("/list/me", authentication, eventController.listEventsByUser);
eventRouter.get("/each/:event_id", authentication, eventController.getEventById);

eventRouter.put(
  "/update/:event_id",
  authentication,
  validate(schema.EventUpdateSchema),
  eventController.updateEvent,
);
eventRouter.delete("/delete/:event_id", authentication, eventController.deleteEvent);

eventRouter.post(
  "/verify/:event_id",
  authenticationAdmin, // verify admin
  eventController.verifyEvent,
);

eventRouter.post(
  "/reject/:event_id",
  authenticationAdmin,
  validate(schema.RejectEventSchema),
  eventController.rejectEvent,
);

eventRouter.post(
  "/block/:event_id",
  authenticationAdmin,
  validate(schema.BlockEventSchema),
  eventController.blockEvent,
);

eventRouter.post("/unblock/:event_id", authenticationAdmin, eventController.unblockEvent);

eventRouter.post(
  "/add/package/:event_id",
  authentication,
  validate(schema.CreatePackage),
  eventController.addPackageToEvent,
);

eventRouter.put(
  "/update/package/:event_id",
  authentication,
  validate(schema.CreatePackage),
  eventController.editarPackageInEvent,
);

eventRouter.get("/list/package/:event_id", authentication, eventController.listPackagesByEvent);

eventRouter.get("/get/package/:package_id", authentication, eventController.getPackageById);

eventRouter.delete("/delete/package/:package_id", authentication, eventController.deletePackage);

eventRouter.post("/add/member/:event_id", authentication, eventController.addMemberToEvent);

eventRouter.delete(
  "/remove/member/:event_id/:user_id",
  authentication,
  eventController.removeMemberFromEvent,
);

eventRouter.get("/list/member/:event_id", authentication, eventController.listMembersByEvent);

eventRouter.get("/get/member/:member_id", authentication, eventController.getMemberById);



eventRouter.post("/read/code", authentication, eventController.readCode);

eventRouter.get("/history/:event_id", authentication, eventController.historyTicketsByEvent);

export default eventRouter;
