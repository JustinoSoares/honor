// src/modules/auth/auth.schema.ts  — schemas relevantes para o OpenAPI
// Adapta os que já existirem no teu ficheiro, adiciona os que faltarem

import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// ─── Inputs ───────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email().openapi({ example: "user@email.com" }),
  password: z.string().min(1).openapi({ example: "minhasenha123" }),
});

export const RegisterSchema = z.object({
  name: z.string().min(2).openapi({ example: "João Silva" }),
  email: z.string().email().openapi({ example: "user@email.com" }),
  password: z.string().min(8).openapi({ example: "minhasenha123" }),
  phone: z.string().optional().openapi({ example: "+244923000000" }),
});

export const SendCodeSchema = z.object({
  email: z.string().email().openapi({ example: "user@email.com" }),
});

export const CheckCodeSchema = z.object({
  email: z.string().email().openapi({ example: "user@email.com" }),
  code: z.string().min(6).openapi({ example: "123456" }),
});

// ─── Outputs ──────────────────────────────────────────────────────────────────

export const ResponseLoginSchema = z.object({
  accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  refreshToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
});

export const ResponseRefreshSchema = z.object({
  accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  refreshToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
});

export const ResponseBadSchema = z.object({
  message: z.string().openapi({ example: "Email ou senha incorretos" }),
  status: z.number().optional().openapi({ example: 401 }),
});

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type ResponseRefresh = z.infer<typeof ResponseRefreshSchema>;
export type ResponseBad = z.infer<typeof ResponseBadSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type ResponseLogin = z.infer<typeof ResponseLoginSchema>;
export type SendCodeData = z.infer<typeof SendCodeSchema>;
export type CheckCodeData = z.infer<typeof CheckCodeSchema>;
