import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { CommentService } from "./comment.service";

const service = new CommentService();

export class CommentController {
  async createComment(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      if (!user_id) return res.status(401).json({ message: "Não autorizado" });

      const result = await service.createComment(req.body, user_id);

      if ("status" in result && result.status !== 200 && result.status !== 201) {
        return res.status(result.status).json({ message: result.message });
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao criar comentário" });
    }
  }

  async getCommentsByEvent(req: AuthRequest, res: Response) {
    try {
      const { event_id } = req.params;
      const { page, per_page } = req.query;

      const result = await service.getCommentsByEvent(
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
      return res.status(500).json({ message: "Erro interno ao buscar comentários" });
    }
  }

  async getCommentById(req: AuthRequest, res: Response) {
    try {
      const { comment_id } = req.params;
      const result = await service.getCommentById(comment_id as string);

      if ("status" in result) {
        return res.status(result.status).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao buscar comentário" });
    }
  }

  async updateComment(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      if (!user_id) return res.status(401).json({ message: "Não autorizado" });

      const { comment_id } = req.params;
      const result = await service.updateComment(comment_id as string, req.body, user_id);

      if ("status" in result && result.status !== 200) {
        return res.status(result.status).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao atualizar comentário" });
    }
  }

  async deleteComment(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      if (!user_id) return res.status(401).json({ message: "Não autorizado" });

      const { comment_id } = req.params;
      const result = await service.deleteComment(comment_id as string, user_id);

      return res.status(result.status).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno ao excluir comentário" });
    }
  }
}
