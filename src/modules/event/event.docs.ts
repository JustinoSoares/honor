// src/docs/modules/event.docs.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import {
  CreateEventSchema,
  EventUpdateSchema,
  ResponseEventSchema,
  ResponseBadSchema,
  ResponsePackageSchema,
  CreatePackage,
} from "../../modules/event/event.schema";

export function registerEventDocs(registry: OpenAPIRegistry) {
  // Regista os schemas
  registry.register("CreateEvent", CreateEventSchema);
  registry.register("EventUpdate", EventUpdateSchema);
  registry.register("ResponseEvent", ResponseEventSchema);
  registry.register("ResponseBad", ResponseBadSchema);
  registry.register("ResponsePackage", ResponsePackageSchema);
  registry.register("CreatePackage", CreatePackage);

  // ─── GET /events/list ────────────────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/events/list",
    tags: ["Events"],
    summary: "Lista todos os eventos",
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: "1" }),
        per_page: z.string().optional().openapi({ example: "10" }),
        search: z.string().optional().openapi({ example: "Música" }),
      }),
    },
    responses: {
      200: {
        description: "Lista de eventos retornada com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(ResponseEventSchema),
              meta: z.object({
                total: z.number().openapi({ example: 100 }),
                page: z.number().openapi({ example: 1 }),
                per_page: z.number().openapi({ example: 10 }),
                total_pages: z.number().openapi({ example: 10 }),
              }),
            }),
          },
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

  // ─── GET /events/:id ────────────────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/events/{id}",
    tags: ["Events"],
    summary: "Busca um evento por ID",
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
    },
    responses: {
      200: {
        description: "Evento encontrado com sucesso",
        content: {
          "application/json": { schema: ResponseEventSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // ─── POST /events ────────────────────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/events",
    tags: ["Events"],
    summary: "Cria um novo evento",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: CreateEventSchema },
        },
      },
    },
    responses: {
      201: {
        description: "Evento criado com sucesso",
        content: {
          "application/json": { schema: ResponseEventSchema },
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

  // ─── PATCH /events/:id ───────────────────────────────────────────────────────
  registry.registerPath({
    method: "patch",
    path: "/events/{id}",
    tags: ["Events"],
    summary: "Atualiza um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: EventUpdateSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Evento atualizado com sucesso",
        content: {
          "application/json": { schema: ResponseEventSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // ─── DELETE /events/:id ──────────────────────────────────────────────────────
  registry.registerPath({
    method: "delete",
    path: "/events/{id}",
    tags: ["Events"],
    summary: "Remove um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
    },
    responses: {
      200: {
        description: "Evento removido com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Evento removido com sucesso" }),
            }),
          },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // ─── POST /events/:id/packages ───────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/events/{id}/packages",
    tags: ["Events", "Packages"],
    summary: "Adiciona um pacote a um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: CreatePackage },
        },
      },
    },
    responses: {
      201: {
        description: "Pacote adicionado com sucesso",
        content: {
          "application/json": { schema: ResponsePackageSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // ─── DELETE /events/:id/packages/:packageId ──────────────────────────────────
  registry.registerPath({
    method: "delete",
    path: "/events/{id}/packages/{packageId}",
    tags: ["Events", "Packages"],
    summary: "Remove um pacote de um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
        packageId: z.string().uuid().openapi({ example: "b2c3d4e5-f6a7-..." }),
      }),
    },
    responses: {
      200: {
        description: "Pacote removido com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Pacote removido com sucesso" }),
            }),
          },
        },
      },
      404: {
        description: "Evento ou pacote não encontrado",
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
}