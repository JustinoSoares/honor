import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CreateAvaliationSchema = z.object({
  event_id: z.string("O ID do evento é obrigatório").uuid("O ID do evento deve ser um UUID"),
  rating: z
    .number("A avaliação é obrigatória")
    .int()
    .min(1, "A avaliação mínima é 1")
    .max(5, "A avaliação máxima é 5"),
  comment: z.string().optional().openapi({ example: "Evento incrível!" }),
});

export type CreateAvaliation = z.infer<typeof CreateAvaliationSchema>;

export const UpdateAvaliationSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export type UpdateAvaliation = z.infer<typeof UpdateAvaliationSchema>;

export const ResponseAvaliationSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    user_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    rating: z.number().openapi({ example: 5 }),
    comment: z.string().nullable().openapi({ example: "Evento incrível!" }),
    user: z
      .object({
        name: z.string().openapi({ example: "João Silva" }),
      })
      .optional(),
    created_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
    updated_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("ResponseAvaliation");

export type ResponseAvaliation = z.infer<typeof ResponseAvaliationSchema>;
