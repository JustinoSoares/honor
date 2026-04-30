import zod from "zod";

export const UserSchema = zod.object({
  name: zod
    .string("O seu nome é obrigatório")
    .min(1, "O seu nome é obrigatório"),
  email: zod
    .string("O seu email é obrigatório")
    .email("Endereço de email inválido"),
  phone: zod
    .string("O seu telefone é obrigatório")
    .min(1, "Número de telefone é obrigatório"),
  password: zod
    .string("A sua senha é obrigatória")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type UserCreate = zod.infer<typeof UserSchema>;

export const UserUpdateSchema = zod.object({
  name: zod
    .string("O seu nome é obrigatório")
    .min(1, "O seu nome é obrigatório")
    .optional(),
  email: zod
    .string("O seu email é obrigatório")
    .email("Endereço de email inválido")
    .optional(),
  phone: zod
    .string("O seu telefone é obrigatório")
    .min(1, "Número de telefone é obrigatório")
    .optional(),
  password: zod
    .string("A sua senha é obrigatória")
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .optional(),
});

export type UserUpdate = zod.infer<typeof UserUpdateSchema>;

export const ResponseUserSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  email: zod.string(),
  phone: zod.string(),
  role: zod.enum(['USER', 'ADMIN', 'MANAGER']),
  created_at: zod.date(),
  updated_at: zod.date(),
});

export type ResponseUser = zod.infer<typeof ResponseUserSchema>;

export const ResponseBadSchema = zod.object({
  message: zod.string(),
  status: zod.number(),
});

export type ResponseBad = zod.infer<typeof ResponseBadSchema>;
