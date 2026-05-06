import express from "express";
import { TicketController } from "./ticket.controller";
import * as schema from "./ticket.schema";
import { validate } from "../../middleware/validate";

const ticketController = new TicketController();
const ticketRouter = express.Router();

ticketRouter.post("/create", validate(schema.CreateTicketSchema), ticketController.createTicket);
ticketRouter.get("/list/:event_id", ticketController.getTicketByEventId);
ticketRouter.get("/user/:user_id", ticketController.getTicketsByUserId);
ticketRouter.get("/each/:ticket_id", ticketController.getTicketById);
ticketRouter.delete("/delete/:ticket_id", ticketController.deleteTicket);
export default ticketRouter;
