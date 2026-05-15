import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import zod from "zod";

extendZodWithOpenApi(zod);

export const UserSchema = zod
  .object({
    name: zod
      .string("O seu nome é obrigatório")
      .min(1, "O seu nome é obrigatório")
      .openapi({ example: "Justino Soares" }),
    email: zod
      .string("O seu email é obrigatório")
      .email("Endereço de email inválido")
      .openapi({ example: "justino@email.com" }),
    phone: zod
      .string("O seu telefone é obrigatório")
      .min(1, "Número de telefone é obrigatório")
      .regex(
        /^\+244\s\d{3}\s\d{3}\s\d{3}$/,
        "Número de telefone deve estar no formato +244 900 000 000",
      )
      .openapi({ example: "+244 900 000 000" }),
    password: zod
      .string("A sua senha é obrigatória")
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .openapi({ example: "senha123" }),
  })
  .openapi("UserCreate");

export type UserCreate = zod.infer<typeof UserSchema>;

export const UserUpdateSchema = zod
  .object({
    name: zod
      .string("O seu nome é obrigatório")
      .min(1, "O seu nome é obrigatório")
      .optional()
      .openapi({ example: "Justino Soares" }),
    email: zod
      .string("O seu email é obrigatório")
      .email("Endereço de email inválido")
      .optional()
      .openapi({ example: "justino@email.com" }),
    phone: zod
      .string("O seu telefone é obrigatório")
      .min(1, "Número de telefone é obrigatório")
      .regex(
        /^\+244\s\d{3}\s\d{3}\s\d{3}$/,
        "Número de telefone deve estar no formato +244 900 000 000",
      )
      .optional()
      .openapi({ example: "+244 900 000 000" }),
  })
  .openapi("UserUpdate");

export type UserUpdate = zod.infer<typeof UserUpdateSchema>;

export const ChangePasswordSchema = zod
  .object({
    old_password: zod
      .string("A senha antiga é obrigatória")
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .openapi({ example: "senhaAntiga123" }),
    new_password: zod
      .string("A nova senha é obrigatória")
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .openapi({ example: "senhaNova123" }),
  })
  .openapi("ChangePassword");

export type ChangePassword = zod.infer<typeof ChangePasswordSchema>;

export const ResponseUserSchema = zod
  .object({
    id: zod.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    name: zod.string().openapi({ example: "Justino Soares" }),
    email: zod.string().openapi({ example: "justino@email.com" }),
    phone: zod.string().openapi({ example: "+244 900 000 000" }),
    role: zod.enum(["USER", "ADMIN", "MANAGER"]).openapi({ example: "USER" }),
    verified: zod.boolean().openapi({ example: false }),
    is_active: zod.boolean().openapi({ example: true }),
    created_at: zod.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
    updated_at: zod.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("ResponseUser");

export type ResponseUser = zod.infer<typeof ResponseUserSchema>;

export const UserListResponseSchema = zod
  .object({
    data: zod.array(ResponseUserSchema),
    meta: zod.object({
      total: zod.number().openapi({ example: 100 }),
      page: zod.number().openapi({ example: 1 }),
      per_page: zod.number().openapi({ example: 10 }),
      total_pages: zod.number().openapi({ example: 10 }),
    }),
  })
  .openapi("UserListResponse");

export const ResponseBadSchema = zod
  .object({
    message: zod.string().openapi({ example: "Erro ao processar a requisição" }),
    status: zod.number().openapi({ example: 400 }),
  })
  .openapi("ResponseBad");

export type UserListResponse = zod.infer<typeof UserListResponseSchema>;
export type ResponseBad = zod.infer<typeof ResponseBadSchema>;
