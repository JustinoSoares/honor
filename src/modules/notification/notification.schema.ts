import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import zod from "zod";

extendZodWithOpenApi(zod);

export const NotificationResponseSchema = zod
  .object({
    id: zod.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    user_id: zod.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    message: zod.string().openapi({ example: "O seu evento 'Show de Verão' foi aprovado!" }),
    read: zod.boolean().openapi({ example: false }),
    read_at: zod.string().datetime().nullable().openapi({ example: "2024-01-01T00:00:00Z" }),
    created_at: zod.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("NotificationResponse");

export type NotificationResponse = zod.infer<typeof NotificationResponseSchema>;

export const NotificationListResponseSchema = zod
  .object({
    data: zod.array(NotificationResponseSchema),
    meta: zod.object({
      total: zod.number().openapi({ example: 100 }),
      page: zod.number().openapi({ example: 1 }),
      per_page: zod.number().openapi({ example: 10 }),
      total_pages: zod.number().openapi({ example: 10 }),
    }),
  })
  .openapi("NotificationListResponse");

export type NotificationListResponse = zod.infer<typeof NotificationListResponseSchema>;
