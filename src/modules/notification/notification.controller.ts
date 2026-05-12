import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { NotificationService } from "./notification.service";

const service = new NotificationService();

export class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      if (!user_id) {
        return res
          .status(401)
          .json({ message: "É necessário fazer login para ver as notificações." });
      }

      const { page, per_page } = req.query;

      const result = await service.getNotificationsByUserId(
        user_id,
        Number(page) || 1,
        Number(per_page) || 10,
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Não foi possível carregar as notificações. Por favor, tente novamente.",
      });
    }
  }

  async getNotificationById(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      if (!user_id) {
        return res
          .status(401)
          .json({ message: "É necessário fazer login para ver a notificação." });
      }

      const { notification_id } = req.params;

      const result = await service.getNotificationById(
        notification_id as string,
        user_id as string,
      );

      if ("status" in result && result.status !== 200) {
        return res.status(result.status).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Não foi possível carregar a notificação. Por favor, tente novamente." });
    }
  }
}
