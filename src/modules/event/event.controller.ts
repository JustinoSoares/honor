import { validate } from "uuid";
import { EventService } from "./event.service";
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";

const service = new EventService();

export class EventController {
  constructor() {}

  async createEvent(req: AuthRequest, res: Response) {
    const user_id = req.userId;
    try {
      if (!user_id || validate(user_id) === false) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const event = await service.createEvent(req.body, user_id);
      if ("status" in event && event.status !== 200) {
        return res.status(event.status).json({ message: event.message });
      }
      return res.status(201).json(event);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível criar o evento. Por favor, tente novamente." });
    }
  }

  async verifyEvent(req: AuthRequest, res: Response) {
    const user_id = req.userId;
    try {
      if (!user_id || validate(user_id) === false) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const { event_id } = req.params;
      const available = await req.body.available;
      const result = await service.verifyEvent(event_id as string, user_id, available);

      if (!result) {
        return res.status(404).json({ message: "Não encontrámos o evento que pretende alterar." });
      }
      if ("status" in result) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message:
          "Não foi possível alterar a disponibilidade do evento. Por favor, tente novamente.",
      });
    }
  }

  async rejectEvent(req: AuthRequest, res: Response) {
    const user_id = req.userId;
    try {
      if (!user_id || validate(user_id) === false) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const { event_id } = req.params;
      const { reason_rejection } = req.body;
      const result = await service.rejectEvent(event_id as string, user_id, reason_rejection);

      if ("status" in result) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível rejeitar o evento. Por favor, tente novamente." });
    }
  }

  async getAllEvents(req: AuthRequest, res: Response) {
    const user_id = req.userId;
    try {
      const { per_page, page, min_price, max_price, start_date, end_date, status_event } =
        req.query;
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | string[] | undefined;
      const categoryList = !category
        ? undefined
        : Array.isArray(category)
          ? category
          : String(category).split(",");

      const statusEventList = !status_event
        ? undefined
        : Array.isArray(status_event)
          ? status_event
          : String(status_event).split(",");

      const events = await service.getAllEvents(
        Number(page) || 1,
        Number(per_page) || 10,
        search ? (search as string) : undefined,
        user_id,
        min_price ? Number(min_price) : undefined,
        max_price ? Number(max_price) : undefined,
        categoryList,
        start_date as string,
        end_date as string,
        statusEventList as string | string[],
      );

      if ("status" in events && events.status !== 200) {
        return res.status(events.status).json({ message: events.message });
      }

      return res.status(200).json(events);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível carregar os eventos. Por favor, tente novamente." });
    }
  }

  async listEventsByUser(req: AuthRequest, res: Response) {
    const user_id = req.userId;
    try {
      if (!user_id || validate(user_id) === false) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const { per_page, page, min_price, max_price, start_date, end_date, status_event } =
        req.query;
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | string[] | undefined;
      const categoryList = !category
        ? undefined
        : Array.isArray(category)
          ? category
          : String(category).split(",");

      const statusEventList = !status_event
        ? undefined
        : Array.isArray(status_event)
          ? status_event
          : String(status_event).split(",");

      const events = await service.listEventsByUser(
        user_id,
        Number(page) || 1,
        Number(per_page) || 10,
        search ? (search as string) : undefined,
        min_price ? Number(min_price) : undefined,
        max_price ? Number(max_price) : undefined,
        categoryList,
        start_date as string,
        end_date as string,
        statusEventList as string | string[],
      );

      if ("status" in events && events.status !== 200) {
        return res.status(events.status).json({ message: events.message });
      }

      return res.status(200).json(events);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível carregar os seus eventos. Por favor, tente novamente.",
      });
    }
  }

  async getEventById(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const event = await service.getEventById(event_id as string);

      if (!event) {
        return res.status(404).json({ message: "Não encontrámos o evento que procura." });
      }

      if ("status" in event && event.status !== 200) {
        return res.status(event.status!).json({ message: event.message });
      }
      return res.status(200).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível carregar os detalhes do evento. Por favor, tente novamente.",
      });
    }
  }

  async updateEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const eventData = req.body;
      const event = await service.updateEvent(event_id as string, eventData, req.userId as string);
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      if ("status" in event && event.status !== 200) {
        return res.status(event.status!).json({ message: event.message });
      }
      return res.status(200).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível guardar as alterações no evento. Por favor, tente novamente.",
      });
    }
  }

  async deleteEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const result = await service.deleteEvent(event_id as string, req.userId as string);
      if (!result) {
        return res.status(404).json({ message: "Não encontrámos o evento que pretende eliminar." });
      }

      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }

      return res.status(result.status!).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível eliminar o evento. Por favor, tente novamente." });
    }
  }

  async addPackageToEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const packageData = req.body;
      const result = await service.addPackageToEvent(
        event_id as string,
        packageData,
        req.userId as string,
      );
      if (!result) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível adicionar o pacote ao evento. Por favor, tente novamente.",
      });
    }
  }

  async editarPackageInEvent(req: AuthRequest, res: Response) {
    const { package_id } = req.params;
    const packageData = req.body;
    try {
      const result = await service.editarPackage(
        package_id as string,
        packageData,
        req.userId as string,
      );
      if (!result) {
        return res
          .status(404)
          .json({ message: "Não encontrámos o pacote ou evento que pretende editar." });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível guardar as alterações no pacote. Por favor, tente novamente.",
      });
    }
  }

  async listPackagesByEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const result = await service.listPackagesByEvent(event_id as string);
      if (!result) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível carregar os pacotes deste evento. Por favor, tente novamente.",
      });
    }
  }

  async getPackageById(req: AuthRequest, res: Response) {
    try {
      const { package_id } = req.params;
      const result = await service.getPackageById(package_id as string);
      if (!result) {
        return res.status(404).json({ message: "Pacote não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível carregar os detalhes do pacote. Por favor, tente novamente.",
      });
    }
  }

  async deletePackage(req: AuthRequest, res: Response) {
    try {
      const { package_id } = req.params;
      const result = await service.deletePackage(package_id as string, req.userId as string);
      if (!result) {
        return res.status(404).json({ message: "Pacote não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(result.status!).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível eliminar o pacote. Por favor, tente novamente." });
    }
  }

  async addMemberToEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const user_id = req.userId;
      if (!user_id || validate(user_id) === false) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const result = await service.addMemberToEvent(event_id as string, req.body, user_id);
      if (!result) {
        return res.status(404).json({ message: "Evento ou usuário não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível adicionar o membro ao evento. Por favor, tente novamente.",
      });
    }
  }

  async removeMemberFromEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id, user_id } = req.params;
      const authed_id = req.userId;

      const result = await service.removeMemberFromEvent(
        event_id as string,
        user_id as string,
        authed_id as string,
      );
      if (!result) {
        return res.status(404).json({ message: "Evento ou usuário não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(result.status!).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível remover o membro do evento. Por favor, tente novamente.",
      });
    }
  }

  async listMembersByEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const { page, per_page } = req.query;

      const result = await service.listMembersByEvent(
        event_id as string,
        req.userId as string,
        Number(page) || 1,
        Number(per_page) || 10,
      );

      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message:
          "Não foi possível carregar a lista de membros do evento. Por favor, tente novamente.",
      });
    }
  }

  async getMemberById(req: AuthRequest, res: Response) {
    try {
      const { member_id } = req.params;

      const result = await service.getMemberById(member_id as string, req.userId as string);

      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível carregar os detalhes do membro. Por favor, tente novamente.",
      });
    }
  }

  async readCode(req: AuthRequest, res: Response) {
    try {
      let { code } = req.body;
      code = String(code);
      const result = await service.readCode(code, req.userId as string);
      if (!result) {
        return res
          .status(404)
          .json({ message: "O código QR lido não corresponde a nenhum convite válido." });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível processar o código QR. Por favor, tente novamente." });
    }
  }

  async historyTicketsByEvent(req: AuthRequest, res: Response) {
    try {
      let { event_id } = req.params;
      event_id = String(event_id);
      const result = await service.historyTicketsByEvent(event_id, req.userId as string);
      if (!result) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível carregar o histórico de entradas. Por favor, tente novamente.",
      });
    }
  }

  async blockEvent(req: AuthRequest, res: Response) {
    const user_id = req.userId;
    try {
      if (!user_id || validate(user_id) === false) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const { event_id } = req.params;
      const { reason } = req.body;
      const result = await service.blockEvent(event_id as string, reason, user_id);

      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao bloquear evento" });
    }
  }

  async unblockEvent(req: AuthRequest, res: Response) {
    const user_id = req.userId;
    try {
      if (!user_id || validate(user_id) === false) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }
      const { event_id } = req.params;
      const result = await service.unblockEvent(event_id as string, user_id);

      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao desbloquear evento" });
    }
  }
}
