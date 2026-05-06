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
      const { data } = req.body;
      const user_id = req.userId as string;

      if (!user_id || !validate(user_id)) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const ticket = await service.createTicket(data as schema.CreateTicket, user_id as string);
      if ("message" in ticket && ticket.status !== 201) {
        return res.status(ticket.status).json({ message: ticket.message });
      }
      return res.status(201).json(ticket);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar convidado" });
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
      return res.status(500).json({ message: "Erro ao buscar tickets" });
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
      return res.status(500).json({ message: "Erro ao buscar tickets" });
    }
  }

  async getTicketById(req: AuthRequest, res: Response) {
    try {
      let { ticket_id } = req.params;

      ticket_id = String(ticket_id);

      const ticket = await service.getTicketById(ticket_id);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }

      if ("message" in ticket && ticket.status !== 200) {
        return res.status(ticket.status).json({ message: ticket.message });
      }
      return res.status(200).json(ticket);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar ticket" });
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
      return res.status(500).json({ message: "Erro ao deletar ticket" });
    }
  }
}
