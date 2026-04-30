import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Endereço de email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type LoginData = z.infer<typeof LoginSchema>;

export const ResponseLoginSchema = z.object({
  token: z.string(),
});

export type ResponseLogin = z.infer<typeof ResponseLoginSchema>;

export const ResponseBadSchema = z.object({
  message: z.string(),
  status: z.number(),
});

export type ResponseBad = z.infer<typeof ResponseBadSchema>;
