import { Request, Response } from "express";
import { GalaryService } from "./galary.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "uuid";

const service = new GalaryService();

export class GalaryController {
  constructor() {}

  async create(req: AuthRequest, res: Response) {
    try {
      const result = await service.createGalaryItem(req.body);
      if ("status" in result) {
        return res.status(result.status).json({ message: result.message });
      }
      return res.status(201).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar item na galeria" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { page, per_page } = req.query;
      const result = await service.listGalaryItems(Number(page) || 1, Number(per_page) || 10);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao listar galeria" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!validate(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      const result = await service.getGalaryItemById(id as string);
      if ("status" in result) {
        return res.status(result.status).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar item na galeria" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!validate(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      const result = await service.updateGalaryItem(id as string, req.body);
      if ("status" in result) {
        return res.status(result.status).json({ message: result.message });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar item na galeria" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!validate(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      const result = await service.deleteGalaryItem(id as string);
      return res.status(result.status).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao eliminar item da galeria" });
    }
  }
}
