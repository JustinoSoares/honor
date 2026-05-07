import express from "express";
import { TicketController } from "./ticket.controller";
import * as schema from "./ticket.schema";
import { validate } from "../../middleware/validate";
import { authentication } from "../../middleware/authorization";

const ticketController = new TicketController();
const ticketRouter = express.Router();

ticketRouter.post("/create", authentication, validate(schema.CreateTicketSchema), ticketController.createTicket);
ticketRouter.get("/list/:event_id", authentication, ticketController.getTicketByEventId);
ticketRouter.get("/user/:user_id", authentication, ticketController.getTicketsByUserId);
ticketRouter.get("/each/:ticket_id", authentication, ticketController.getTicketById);
ticketRouter.delete("/delete/:ticket_id", authentication, ticketController.deleteTicket);

export default ticketRouter;