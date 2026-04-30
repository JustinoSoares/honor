import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z
    .string("O nome da categoria é obrigatório")
    .regex(/^[a-zA-Z_]+$/, "O nome da categoria deve conter apenas letras e underline")
    .min(1, "O nome da categoria é obrigatório"),
});

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;

export const ResponseCategory = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ResponseCategoryDTO = z.infer<typeof ResponseCategory>;

export const BaseResponseCategory = z.object({
  message: z.string(),
  status: z.number(),
});
