import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CreateCommentSchema = z.object({
  event_id: z.string("O ID do evento é obrigatório").uuid("O ID do evento deve ser um UUID"),
  content: z
    .string("O conteúdo do comentário é obrigatório")
    .min(1, "O conteúdo do comentário é obrigatório")
    .openapi({ example: "Evento incrível!" }),
});

export type CreateComment = z.infer<typeof CreateCommentSchema>;

export const UpdateCommentSchema = z.object({
  content: z.string().min(1, "O conteúdo do comentário é obrigatório").optional(),
});

export type UpdateComment = z.infer<typeof UpdateCommentSchema>;

export const ResponseCommentSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    user_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    content: z.string().nullable().openapi({ example: "Evento incrível!" }),
    user: z
      .object({
        name: z.string().openapi({ example: "João Silva" }),
      })
      .optional(),
    created_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
    updated_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("ResponseComment");

export type ResponseComment = z.infer<typeof ResponseCommentSchema>;
