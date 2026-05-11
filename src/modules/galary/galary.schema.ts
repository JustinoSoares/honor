import z from "zod";

export const CreateGalarySchema = z.object({
  url: z.string("A URL da imagem é obrigatória").min(1, "A URL da imagem é obrigatória"),
  priority: z.number("A prioridade da imagem deve ser um número inteiro").int().optional(),
});

export type CreateGalary = z.infer<typeof CreateGalarySchema>;

export const ResponseGalarySchema = z.object({
  id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
  url: z.string().openapi({ example: "https://example.com/image.jpg" }),
  priority: z.number().optional().openapi({ example: 1 }),
  created_at: z.string().datetime().optional().openapi({ example: "2024-01-01T00:00:00Z" }),
  updated_at: z.string().datetime().optional().openapi({ example: "2024-01-01T00:00:00Z" }),
});

export type ResponseGalary = z.infer<typeof ResponseGalarySchema>;

export const ResponseGalaryListSchema = z.object({
  data: z.array(ResponseGalarySchema),
  meta: z.object({
    page: z.number().openapi({ example: 1 }),
    per_page: z.number().openapi({ example: 10 }),
    total: z.number().openapi({ example: 100 }),
    total_pages: z.number().openapi({ example: 10 }),
  }),
});

export type ResponseGalaryList = z.infer<typeof ResponseGalaryListSchema>;

export const UpdateGalarySchema = z.object({
  url: z.string().optional(),
  priority: z.number().int().optional(),
});

export type UpdateGalary = z.infer<typeof UpdateGalarySchema>;
