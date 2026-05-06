// src/docs/modules/auth.docs.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import * as schema from "../../modules/auth/auth.schema";

export function registerAuthDocs(registry: OpenAPIRegistry) {
  // Regista os schemas
  registry.register("LoginData", schema.LoginSchema);
  registry.register("RegisterData", schema.RegisterSchema);
  registry.register("ResponseLogin", schema.ResponseLoginSchema);
  registry.register("ResponseRefresh", schema.ResponseRefreshSchema);
  registry.register("ResponseBadAuth", schema.ResponseBadSchema);

  // ─── POST /auth/login ─────────────────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "Autentica um utilizador com email e senha",
    request: {
      body: {
        content: {
          "application/json": { schema: schema.LoginSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Login realizado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseLoginSchema },
        },
      },
      401: {
        description: "Email ou senha incorretos",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
    },
  });

  // ─── GET /auth/google ─────────────────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/auth/google",
    tags: ["Auth"],
    summary: "Inicia o fluxo de autenticação com o Google (OAuth2)",
    description:
      "Retorna a URL de autorização do Google. O cliente deve redirecionar o utilizador para essa URL. " +
      "Após a autenticação, o Google redireciona para `/auth/google/callback` automaticamente.",
    responses: {
      200: {
        description: "URL de autorização gerada com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              url: z.string().url().openapi({
                example: "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&state=abc123",
              }),
              state: z.string().openapi({ example: "a3f1c9e2b7d04512" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
    },
  });

  // ─── GET /auth/google/callback ────────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/auth/google/callback",
    tags: ["Auth"],
    summary: "Callback do Google OAuth2 (chamado automaticamente pelo Google)",
    description:
      "Esta rota **não deve ser chamada diretamente pelo cliente**. " +
      "O Google redireciona o utilizador para cá após a autenticação. " +
      "A API valida o `state` (anti-CSRF), troca o `code` por tokens do Google, " +
      "cria ou atualiza o utilizador no banco e redireciona o browser para " +
      "`FRONTEND_URL/auth/callback?accessToken=...&refreshToken=...`.",
    request: {
      query: z.object({
        code: z.string().openapi({
          example: "4/0AY0e-g7...",
          description:
            "Authorization code retornado pelo Google. Válido por poucos segundos e de uso único.",
        }),
        state: z.string().openapi({
          example: "a3f1c9e2b7d04512",
          description:
            "Valor gerado em /auth/google para prevenção de CSRF. Validado e descartado atomicamente via Valkey (GETDEL).",
        }),
        error: z.string().optional().openapi({
          example: "access_denied",
          description: "Presente quando o utilizador nega a permissão no Google.",
        }),
      }),
    },
    responses: {
      302: {
        description: "Redireciona o browser para o frontend com os tokens na query string",
        headers: z.object({
          Location: z.string().openapi({
            example: "https://meufront.com/auth/callback?accessToken=eyJ...&refreshToken=eyJ...",
          }),
        }),
      },
      400: {
        description: "State inválido, expirado ou já utilizado",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
    },
  });

  // ─── POST /auth/refresh ───────────────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/auth/refresh",
    tags: ["Auth"],
    summary: "Renova o access token usando o refresh token",
    description:
      "Implementa rotação de refresh tokens: o token antigo é invalidado no Valkey e um novo par é emitido. " +
      "Se o refresh token não existir no Valkey, a sessão foi revogada e o utilizador deve fazer login novamente.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              refreshToken: z
                .string()
                .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Tokens renovados com sucesso",
        content: {
          "application/json": { schema: schema.ResponseRefreshSchema },
        },
      },
      401: {
        description: "Refresh token inválido, expirado ou revogado",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
    },
  });

  // ─── POST /auth/logout ────────────────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/auth/logout",
    tags: ["Auth"],
    summary: "Encerra a sessão do utilizador",
    description:
      "Revoga o refresh token imediatamente no Valkey e no banco de dados. " +
      "O access token continua válido até expirar (por isso o TTL curto de 15 min é importante).",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              refreshToken: z
                .string()
                .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Logout realizado com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Logout realizado com sucesso" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
    },
  });
}
