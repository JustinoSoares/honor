// docs
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  UserSchema,
  ResponseUserSchema,
  UserListResponseSchema,
  UserUpdateSchema,
  ChangePasswordSchema,
  ResponseBadSchema,
} from "./user.schema";

export function registerUserDocs(registry: OpenAPIRegistry) {
  // Regista os schemas
  registry.register("User", UserSchema);
  registry.register("CreateUser", UserSchema);
  registry.register("UserListResponse", UserListResponseSchema);
  registry.register("ResponseUser", ResponseUserSchema);
  registry.register("ChangePassword", ChangePasswordSchema);
  // GET /user
  registry.registerPath({
    method: "get",
    path: "/user/list",
    tags: ["Users"],
    summary: "Lista todos os utilizadores",
    security: [{ bearerAuth: [] }],
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: "1" }),
        per_page: z.string().optional().openapi({ example: "10" }),
        search: z.string().optional().openapi({ example: "Justino" }),
      }),
    },
    responses: {
      200: {
        description: "Lista de utilizadores",
        content: {
          "application/json": { schema: UserListResponseSchema },
        },
      },
      400: { description: "Dados inválidos" },
    },
  });

  // GET /user/:id
  registry.registerPath({
    method: "get",
    path: "/user/each/{user_id}",
    tags: ["Users"],
    summary: "Busca utilizador por ID",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        user_id: z.string().uuid().openapi({ example: "a1b2c3d4-..." }),
      }),
    },
    responses: {
      200: {
        description: "Utilizador encontrado",
        content: {
          "application/json": { schema: ResponseUserSchema },
        },
      },
      404: { description: "Utilizador não encontrado" },
    },
  });

  // GET /user/me
  registry.registerPath({
    method: "get",
    path: "/user/me",
    tags: ["Users"],
    summary: "Busca o utilizador autenticado",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Utilizador encontrado",
        content: {
          "application/json": { schema: ResponseUserSchema },
        },
      },
      404: { description: "Utilizador não encontrado" },
    },
  });

  // POST /users
  registry.registerPath({
    method: "post",
    path: "/user/create",
    tags: ["Users"],
    summary: "Cria um novo utilizador",
    request: {
      body: {
        content: {
          "application/json": { schema: UserSchema },
        },
      },
    },
    responses: {
      201: {
        description: "Utilizador criado",
        content: {
          "application/json": { schema: ResponseUserSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: z.object({ message: z.string() }) },
        },
      },
    },
  });

  registry.registerPath({
    method: "put",
    path: "/user/update/{user_id}",
    tags: ["Users"],
    summary: "Atualiza um utilizador existente",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        user_id: z.string().uuid().openapi({ example: "a1b2c3d4-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: UserUpdateSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Utilizador atualizado",
        content: {
          "application/json": { schema: ResponseUserSchema },
        },
      },
      400: { description: "Dados inválidos" },
      404: { description: "Utilizador não encontrado" },
    },
  });
  registry.registerPath({
    method: "patch",
    path: "/user/change-password",
    tags: ["Users"],
    summary: "Altera a senha do utilizador autenticado",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: ChangePasswordSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Senha alterada com sucesso",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      400: {
        description: "Dados inválidos ou senha antiga incorreta",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      401: { description: "Usuário não autenticado" },
      404: { description: "Usuário não encontrado" },
      500: { description: "Erro interno do servidor" },
    },
  });
}
