import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import * as schema from "./notification.schema";
import { ResponseBadSchema } from "../user/user.schema";

export function registerNotificationDocs(registry: OpenAPIRegistry) {
  // Regista os schemas
  registry.register("NotificationResponse", schema.NotificationResponseSchema);
  registry.register("NotificationListResponse", schema.NotificationListResponseSchema);

  // ─── GET /notification/me ──────────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/notification/me",
    tags: ["Notification"],
    summary: "Lista as notificações do utilizador autenticado",
    description:
      "Retorna uma lista paginada de notificações em ordem descendente (mais recentes primeiro).",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Lista de notificações retornada com sucesso",
        content: {
          "application/json": { schema: schema.NotificationListResponseSchema },
        },
      },
      401: {
        description: "Não autenticado",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
    },
  });

  // ─── GET /notification/:notification_id ───────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/notification/{notification_id}",
    tags: ["Notification"],
    summary: "Obtém uma notificação específica",
    description: "Retorna os detalhes de uma notificação e marca-a como lida se ainda não estiver.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Notificação retornada com sucesso",
        content: {
          "application/json": { schema: schema.NotificationResponseSchema },
        },
      },
      401: {
        description: "Não autenticado",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      404: {
        description: "Notificação não encontrada",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
    },
  });
}
