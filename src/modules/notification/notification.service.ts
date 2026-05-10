import prisma from "../../database/prisma";
import * as schema from "./notification.schema";

export class NotificationService {
  async getNotificationsByUserId(
    user_id: string,
    page: number = 1,
    per_page: number = 10,
  ): Promise<schema.NotificationListResponse> {
    const skip = (page - 1) * per_page;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { user_id },
        skip,
        take: per_page,
        orderBy: { created_at: "desc" },
      }),
      prisma.notification.count({ where: { user_id } }),
    ]);

    return {
      data: notifications.map((n) => ({
        ...n,
        read_at: n.read_at ? n.read_at.toISOString() : null,
        created_at: n.created_at.toISOString(),
      })),
      meta: {
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async getNotificationById(
    id: string,
    user_id: string,
  ): Promise<schema.NotificationResponse | { message: string; status: number }> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.user_id !== user_id) {
      return {
        message: "Não encontrámos a notificação que procura.",
        status: 404,
      };
    }

    // Se a notificação não foi lida, marcamos como lida ao abrir
    if (!notification.read) {
      const updated = await prisma.notification.update({
        where: { id },
        data: {
          read: true,
          read_at: new Date(),
        },
      });

      return {
        ...updated,
        read_at: updated.read_at ? updated.read_at.toISOString() : null,
        created_at: updated.created_at.toISOString(),
      };
    }

    return {
      ...notification,
      read_at: notification.read_at ? notification.read_at.toISOString() : null,
      created_at: notification.created_at.toISOString(),
    };
  }
}
