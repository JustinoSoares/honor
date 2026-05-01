import { EventService } from "./event.service";
import { Request, Response } from "express";

const service = new EventService();
export class EventController {
  constructor() {}

  async createEvent(req: Request | any, res: Response) {
    const user_id = req.userId;
    try {
      const event = await service.createEvent(req.body, user_id);
      if ("status" in event && event.status !== 200) {
        return res.status(event.status).json({ message: event.message });
      }
      return res.status(201).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar evento" });
    }
  }

  async verifyEvent(req: Request | any, res: Response) {
    const user_id = req.userId;
    try {
      const { event_id } = req.params;
      const available = await req.body.available;
      const result = await service.verifyEvent(
        event_id as string,
        user_id,
        available,
      );

      if (!result) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      if ("status" in result) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao verificar evento" });
    }
  }

  async getAllEvents(req: Request | any, res: Response) {
    const user_id = req.userId;
    try {
      const { per_page, page, search } = req.query;

      const events = await service.getAllEvents(
        Number(page) || 1,
        Number(per_page) || 10,
        search ? String(search) : "",
        user_id,
      );

      if ("status" in events && events.status !== 200) {
        return res.status(events.status).json({ message: events.message });
      }

      return res.status(200).json(events);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar eventos" });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { event_id } = req.params;
      const event = await service.getEventById(event_id as string);

      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }

      if ("status" in event && event.status !== 200) {
        return res.status(event.status!).json({ message: event.message });
      }
      return res.status(200).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar evento" });
    }
  }

  async updateEvent(req: Request | any, res: Response) {
    try {
      const { event_id } = req.params;
      const eventData = req.body;
      const event = await service.updateEvent(event_id as string, eventData);
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      if ("status" in event && event.status !== 200) {
        return res.status(event.status!).json({ message: event.message });
      }
      return res.status(200).json(event);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar evento" });
    }
  }

  async deleteEvent(req: Request | any, res: Response) {
    try {
      const { event_id } = req.params;
      const result = await service.deleteEvent(event_id as string);
      if (!result) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }

      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }

      return res.status(result.status!).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao deletar evento" });
    }
  }

  async addPackageToEvent(req: Request | any, res: Response) {
    try {
      const { event_id } = req.params;
      const packageData = req.body;
      const result = await service.addPackageToEvent(
        event_id as string,
        packageData,
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
      return res
        .status(500)
        .json({ message: "Erro ao adicionar pacote ao evento" });
    }
  }

  async editarPackageInEvent(req: Request | any, res: Response) {
    const { package_id } = req.params;
    const packageData = req.body;
    try {
      const result = await service.editarPackage(
        package_id as string,
        packageData,
      );
      if (!result) {
        return res
          .status(404)
          .json({ message: "Evento ou pacote não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao editar pacote no evento" });
    }
  }

  async listPackagesByEvent(req: Request, res: Response) {
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
      return res
        .status(500)
        .json({ message: "Erro ao listar pacotes do evento" });
    }
  }

  async getPackageById(req: Request, res: Response) {
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
      return res.status(500).json({ message: "Erro ao buscar pacote" });
    }
  }

  async deletePackage(req: Request, res: Response) {
    try {
      const { package_id } = req.params;
      const result = await service.deletePackage(package_id as string);
      if (!result) {
        return res.status(404).json({ message: "Pacote não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(result.status!).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao deletar pacote" });
    }
  }

  async addMemberToEvent(req: Request | any, res: Response) {
    try {
      const { event_id } = req.params;
      const user_id = req.userId;
      const result = await service.addMemberToEvent(
        event_id as string,
        req.body,
        user_id,
      );
      if (!result) {
        return res
          .status(404)
          .json({ message: "Evento ou usuário não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao adicionar membro ao evento" });
    }
  }

  async removeMemberFromEvent(req: Request | any, res: Response) {
    try {
      const { event_id, user_id } = req.params;
      const authed_id = req.userId;
      const result = await service.removeMemberFromEvent(
        event_id as string,
        user_id,
        authed_id,
      );
      if (!result) {
        return res
          .status(404)
          .json({ message: "Evento ou usuário não encontrado" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(result.status!).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao remover membro do evento" });
    }
  }

  async addImageToEvent(req: Request, res: Response) {
    try {
      const { event_id } = req.params;
      const result = await service.addImageToEvent(
        event_id as string,
        req.body,
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
      return res
        .status(500)
        .json({ message: "Erro ao adicionar imagem ao evento" });
    }
  }

  async listImagesByEvent(req: Request, res: Response) {
    try {
      const { event_id } = req.params;
      const { page, per_page } = req.query;
      const result = await service.listImagesByEvent(
        event_id as string,
        parseInt(page as string),
        parseInt(per_page as string),
      );
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao listar imagens do evento" });
    }
  }

  async getImageById(req: Request, res: Response) {
    try {
      const { image_id } = req.params;
      const result = await service.getImageById(image_id as string);
      if (!result) {
        return res.status(404).json({ message: "Imagem não encontrada" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar imagem" });
    }
  }

  async updateImage(req: Request, res: Response) {
    try {
      const { image_id } = req.params;
      const result = await service.updateImage(image_id as string, req.body);
      if (!result) {
        return res.status(404).json({ message: "Imagem não encontrada" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar imagem" });
    }
  }

  async deleteImage(req: Request, res: Response) {
    try {
      const { image_id } = req.params;
      const result = await service.deleteImage(image_id as string);
      if (!result) {
        return res.status(404).json({ message: "Imagem não encontrada" });
      }
      if ("status" in result && result.status !== 200) {
        return res.status(result.status!).json({ message: result.message });
      }
      return res.status(result.status!).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao deletar imagem" });
    }
  }
}
