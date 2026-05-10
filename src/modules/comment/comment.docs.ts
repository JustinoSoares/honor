import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import * as schema from "./comment.schema";
import { ResponseBadSchema } from "../event/event.schema";

export function registerCommentDocs(registry: OpenAPIRegistry) {
  registry.register("CreateComment", schema.CreateCommentSchema);
  registry.register("UpdateComment", schema.UpdateCommentSchema);
  registry.register("ResponseComment", schema.ResponseCommentSchema);

  registry.registerPath({
    method: "post",
    path: "/comment/create",
    tags: ["Comments"],
    summary: "Cria um novo comentário para um evento",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: schema.CreateCommentSchema },
        },
      },
    },
    responses: {
      201: {
        description: "Comentário criado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseCommentSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/comment/event/{event_id}",
    tags: ["Comments"],
    summary: "Lista os comentários de um evento",
    request: {
      params: z.object({
        event_id: z.string().uuid(),
      }),
      query: z.object({
        page: z.string().optional(),
        per_page: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: "Comentários listados com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(schema.ResponseCommentSchema),
              total: z.number(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/comment/each/{comment_id}",
    tags: ["Comments"],
    summary: "Obtém um comentário específico",
    request: {
      params: z.object({
        comment_id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "Comentário retornado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseCommentSchema },
        },
      },
    },
  });

  registry.registerPath({
    method: "put",
    path: "/comment/update/{comment_id}",
    tags: ["Comments"],
    summary: "Atualiza um comentário",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        comment_id: z.string().uuid(),
      }),
      body: {
        content: {
          "application/json": { schema: schema.UpdateCommentSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Comentário atualizado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseCommentSchema },
        },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/comment/delete/{comment_id}",
    tags: ["Comments"],
    summary: "Exclui um comentário",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        comment_id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "Comentário excluído com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  });
}
