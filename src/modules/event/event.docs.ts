// src/docs/modules/event.docs.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import * as schema from "../../modules/event/event.schema";
import * as schemaGuest from "../../modules/guest/guest.schema";

export function registerEventDocs(registry: OpenAPIRegistry) {
  // Regista os schemas
  registry.register("CreateEvent", schema.CreateEventSchema);
  registry.register("EventUpdate", schema.EventUpdateSchema);
  registry.register("ResponseEvent", schema.ResponseEventSchema);
  registry.register("ResponseBad", schema.ResponseBadSchema);
  registry.register("ResponsePackage", schema.ResponsePackageSchema);
  registry.register("CreatePackage", schema.CreatePackage);
  registry.register("ResponseMember", schema.ResponseMemberSchema);
  registry.register("AddMemberToEvent", schema.addMemberToEventSchema);

  // ─── GET /events/list ────────────────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/event/list",
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
              data: z.array(schema.ResponseEventSchema),
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
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
    },
  });

  // ─── GET /event/each/:id ────────────────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/event/each/{event_id}",
    tags: ["Events"],
    summary: "Busca um evento por ID",
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
    },
    responses: {
      200: {
        description: "Evento encontrado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseEventSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // ─── POST /event/create ────────────────────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/event/create",
    tags: ["Events"],
    summary: "Cria um novo evento",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: schema.CreateEventSchema },
        },
      },
    },
    responses: {
      201: {
        description: "Evento criado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseEventSchema },
        },
      },
      400: {
        description: "Dados inválidos",
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

  // ─── PATCH /event/update/:id ───────────────────────────────────────────────────────
  registry.registerPath({
    method: "put",
    path: "/event/update/{event_id}",
    tags: ["Events"],
    summary: "Atualiza um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: schema.EventUpdateSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Evento atualizado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseEventSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // ─── DELETE /event/delete/{event_id} ──────────────────────────────────────────────────────
  registry.registerPath({
    method: "delete",
    path: "/event/delete/{event_id}",
    tags: ["Events"],
    summary: "Remove um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
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

  // ─── POST /event/verify/{event_id} ───────────────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/event/verify/{event_id}",
    tags: ["Events", "Backoffice"],
    summary: "Verifica se um evento existe",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              available: z.boolean().openapi({ example: true }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Evento existe",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Evento existe" }),
            }),
          },
        },
      },
      404: {
        description: "Evento não encontrado",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
    },
  });

  // ─── POST /event/:id/packages ───────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/event/add/package/{event_id}",
    tags: ["Events", "Packages"],
    summary: "Adiciona um pacote a um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: schema.CreatePackage },
        },
      },
    },
    responses: {
      201: {
        description: "Pacote adicionado com sucesso",
        content: {
          "application/json": { schema: schema.ResponsePackageSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // ─── PUT /event/update/package/:event_id
  registry.registerPath({
    method: "put",
    path: "/event/update/package/:event_id",
    tags: ["Events", "Packages"],
    summary: "Edita um pacote de um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: schema.CreatePackage },
        },
      },
    },
    responses: {
      200: {
        description: "Pacote editado com sucesso",
        content: {
          "application/json": { schema: schema.ResponsePackageSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      404: {
        description: "Evento ou pacote não encontrado",
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

  // ─── GET /event/list/package/:event_id ──────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/event/list/package/:event_id",
    tags: ["Events", "Packages"],
    summary: "Lista os pacotes de um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
    },
    responses: {
      200: {
        description: "Pacotes listados com sucesso",
        content: {
          "application/json": { schema: schema.ResponsePackageSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // ─── GET /event/get/package/:package_id ──────────────────────────────────────

  registry.registerPath({
    method: "get",
    path: "/event/get/package/:package_id",
    tags: ["Events", "Packages"],
    summary: "Obtém um pacote por ID",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        package_id: z.string().uuid().openapi({ example: "b2c3d4e5-f6a7-..." }),
      }),
    },
    responses: {
      200: {
        description: "Pacote obtido com sucesso",
        content: {
          "application/json": { schema: schema.ResponsePackageSchema },
        },
      },
      404: {
        description: "Pacote não encontrado",
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

  // ─── DELETE /event/:id/packages/:packageId ──────────────────────────────────
  registry.registerPath({
    method: "delete",
    path: "/events/delete/package/:package_id",
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

  // ─── POST /event/add/member/:event_id"
  registry.registerPath({
    method: "post",
    path: "/event/add/member/:event_id",
    tags: ["Events", "Members"],
    summary: "Adiciona um membro a um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: schema.addMemberToEventSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Membro adicionado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseMemberSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      404: {
        description: "Evento ou usuário não encontrado",
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

  // ─── DELETE /event/remove/member/:event_id/:user_id"
  registry.registerPath({
    method: "delete",
    path: "/event/remove/member/:event_id/:user_id",
    tags: ["Events", "Members"],
    summary: "Remove um membro de um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
        user_id: z.string().uuid().openapi({ example: "c3d4e5f6-a7b8-..." }),
      }),
    },
    responses: {
      200: {
        description: "Membro removido com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Membro removido com sucesso" }),
            }),
          },
        },
      },
      404: {
        description: "Evento ou usuário não encontrado",
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

  // POST event/add/image/:event_id
  registry.registerPath({
    method: "post",
    path: "/event/add/image/:event_id",
    tags: ["Events", "Images"],
    summary: "Adiciona uma imagem a um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: schema.CreateImageSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Imagem adicionada com sucesso",
        content: {
          "application/json": { schema: schema.ResponseImageSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // GET /event/list/image/:event_id
  registry.registerPath({
    method: "get",
    path: "/event/list/image/:event_id",
    tags: ["Events", "Images"],
    summary: "Lista as imagens de um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
    },
    responses: {
      200: {
        description: "Imagens listadas com sucesso",
        content: {
          "application/json": { schema: schema.ResponseImageSchema },
        },
      },
      404: {
        description: "Evento não encontrado",
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

  // GET /event/get/image/:image_id
  registry.registerPath({
    method: "get",
    path: "/event/get/image/:image_id",
    tags: ["Events", "Images"],
    summary: "Obtém uma imagem por ID",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        image_id: z.string().uuid().openapi({ example: "d4e5f6a7-b8c9-..." }),
      }),
    },
    responses: {
      200: {
        description: "Imagem obtida com sucesso",
        content: {
          "application/json": { schema: schema.ResponseImageSchema },
        },
      },
      404: {
        description: "Imagem não encontrada",
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

  // PUT - /event/update/image/:image_id
  registry.registerPath({
    method: "put",
    path: "/event/update/image/:image_id",
    tags: ["Events", "Images"],
    summary: "Atualiza uma imagem por ID",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        image_id: z.string().uuid().openapi({ example: "d4e5f6a7-b8c9-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: schema.CreateImageSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Imagem atualizada com sucesso",
        content: {
          "application/json": { schema: schema.ResponseImageSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      404: {
        description: "Imagem não encontrada",
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

  // DELETE /event/delete/image/:image_id
  registry.registerPath({
    method: "delete",
    path: "/event/delete/image/:image_id",
    tags: ["Events", "Images"],
    summary: "Remove uma imagem por ID",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        image_id: z.string().uuid().openapi({ example: "d4e5f6a7-b8c9-..." }),
      }),
    },
    responses: {
      200: {
        description: "Imagem removida com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Imagem removida com sucesso" }),
            }),
          },
        },
      },
      404: {
        description: "Imagem não encontrada",
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

  // POST /event/read/code
  registry.registerPath({
    method: "post",
    path: "/event/read/code",
    tags: ["Events", "Invitations"],
    summary: "Lê um código por ID",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Código obtido com sucesso",
        content: {
          "application/json": { schema: schema.ResponseBadSchema },
        },
      },
      404: {
        description: "Código não encontrado",
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

  // GET /event/history/:event_id
  registry.registerPath({
    method: "get",
    path: "/event/history/:event_id",
    tags: ["Events", "Invitations"],
    summary: "Obtém o histórico de um evento",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      query: z.object({
        page: z.string().optional().openapi({ example: "1" }),
        per_page: z.string().optional().openapi({ example: "10" }),
        search: z.string().optional().openapi({ example: "Música" }),
        is_paid: z.string().optional().openapi({ example: "true" }),
        is_used: z.string().optional().openapi({ example: "false" }),
      }),
    },
    responses: {
      200: {
        description: "Histórico obtido com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(schemaGuest.ResponseInvitationGuest),
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
      404: {
        description: "Evento não encontrado",
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
}
