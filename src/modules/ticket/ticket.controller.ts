import { TicketService } from "./ticket.service";
import { Response } from "express";
import * as schema from "./ticket.schema";
import { AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "uuid";

const service = new TicketService();

export class TicketController {
  constructor() {}

  async createTicket(req: AuthRequest, res: Response) {
    try {
      const data = req.body.data;

      const user_id = req.userId as string;

      if (!user_id || !validate(user_id)) {
        return res.status(401).json({ message: "É necessário fazer login para comprar tickets." });
      }

      const ticket = await service.createTicket(data as schema.TicketArray, user_id as string);
      if ("message" in ticket && ticket.status !== 201) {
        return res.status(ticket.status).json({ message: ticket.message });
      }
      return res.status(201).json(ticket);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível criar os tickets. Por favor, tente novamente." });
    }
  }

  async getTicketByEventId(req: AuthRequest, res: Response) {
    try {
      let { event_id } = req.params;
      const { page, per_page, search } = req.query;

      event_id = String(event_id);

      const tickets = await service.getTicketByEventId(
        event_id,
        Number(page) || 1,
        Number(per_page) || 10,
        search ? String(search) : "",
      );

      if ("message" in tickets && tickets.status !== 200) {
        return res.status(tickets.status).json({ message: tickets.message });
      }

      return res.status(200).json(tickets);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          message: "Não foi possível carregar os tickets deste evento. Por favor, tente novamente.",
        });
    }
  }

  async getTicketsByUserId(req: AuthRequest, res: Response) {
    try {
      const user_id = req.params.user_id as string;
      const { page, per_page } = req.query;
      const tickets = await service.getTicketsByUserId(
        user_id,
        Number(page) || 1,
        Number(per_page) || 10,
      );

      if ("message" in tickets && tickets.status !== 200) {
        return res.status(tickets.status).json({ message: tickets.message });
      }

      return res.status(200).json(tickets);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          message: "Não foi possível carregar os seus tickets. Por favor, tente novamente.",
        });
    }
  }

  async getTicketById(req: AuthRequest, res: Response) {
    try {
      let { ticket_id } = req.params;

      ticket_id = String(ticket_id);

      const ticket = await service.getTicketById(ticket_id);

      if (!ticket) {
        return res
          .status(404)
          .json({
            message:
              "Não encontrámos o ticket que procura. Confirme o identificador e tente novamente.",
          });
      }

      if ("message" in ticket && ticket.status !== 200) {
        return res.status(ticket.status).json({ message: ticket.message });
      }
      return res.status(200).json(ticket);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          message: "Não foi possível carregar os detalhes do ticket. Por favor, tente novamente.",
        });
    }
  }

  async deleteTicket(req: AuthRequest, res: Response) {
    try {
      let { ticket_id } = req.params;

      ticket_id = String(ticket_id);

      const result = await service.deleteTicket(ticket_id);

      return res.status(result.status).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível cancelar o ticket. Por favor, tente novamente." });
    }
  }
}
