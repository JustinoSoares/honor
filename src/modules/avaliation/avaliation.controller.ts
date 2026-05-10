import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { AvaliationService } from "./avaliation.service";

const service = new AvaliationService();

export class AvaliationController {
  async createAvaliation(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      if (!user_id) return res.status(401).json({ message: "Não autorizado" });

      const result = await service.createAvaliation(req.body, user_id);

      if ("status" in result && result.status !== 200 && result.status !== 201) {
        return res.status(result.status).json({ message: result.message });
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao criar avaliação" });
    }
  }

  async getAvaliationsByEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const { page, per_page } = req.query;

      const result = await service.getAvaliationsByEvent(
        event_id as string,
        Number(page) || 1,
        Number(per_page) || 10,
      );

      if ("status" in result) {
        return res.status(result.status).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao buscar avaliações" });
    }
  }

  async updateAvaliation(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      if (!user_id) return res.status(401).json({ message: "Não autorizado" });

      const { avaliation_id } = req.params;
      const result = await service.updateAvaliation(avaliation_id as string, req.body, user_id);

      if ("status" in result && result.status !== 200) {
        return res.status(result.status).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao atualizar avaliação" });
    }
  }

  async deleteAvaliation(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      if (!user_id) return res.status(401).json({ message: "Não autorizado" });

      const { avaliation_id } = req.params;
      const result = await service.deleteAvaliation(avaliation_id as string, user_id);

      return res.status(result.status).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao excluir avaliação" });
    }
  }
}
