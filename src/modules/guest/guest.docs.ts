// src/docs/modules/guest.docs.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import * as schema from "../../modules/guest/guest.schema";

export function registerGuestDocs(registry: OpenAPIRegistry) {
  // Regista os schemas
  registry.register("CreateGuest", schema.CreateGuestSchema);
  registry.register("ResponseGuest", schema.ResponseGuestSchema);
  registry.register("InvitationGuest", schema.InvitationGuestSchema);
  registry.register("ResponseInvitationGuest", schema.ResponseInvitationGuest);

  // ─── POST /guest/create ────────────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/guest/create",
    tags: ["Guests"],
    summary: "Cria um novo convidado",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: schema.CreateGuestSchema },
        },
      },
    },
    responses: {
      201: {
        description: "Convidado criado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseGuestSchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Dados inválidos" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Erro ao criar convidado" }),
            }),
          },
        },
      },
    },
  });

  // ─── GET /guest/list/:event_id ─────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/guest/list/{event_id}",
    tags: ["Guests"],
    summary: "Lista todos os convidados de um evento",
    request: {
      params: z.object({
        event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      query: z.object({
        page: z.string().optional().openapi({ example: "1" }),
        per_page: z.string().optional().openapi({ example: "10" }),
        search: z.string().optional().openapi({ example: "João" }),
      }),
    },
    responses: {
      200: {
        description: "Lista de convidados retornada com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(schema.ResponseGuestSchema),
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
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Evento não encontrado" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Erro ao buscar convidados" }),
            }),
          },
        },
      },
    },
  });

  // ─── GET /guest/each/:guest_id ─────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/guest/each/{guest_id}",
    tags: ["Guests"],
    summary: "Busca um convidado por ID",
    request: {
      params: z.object({
        guest_id: z.string().uuid().openapi({ example: "b2c3d4e5-f6a7-..." }),
      }),
    },
    responses: {
      200: {
        description: "Convidado encontrado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseGuestSchema },
        },
      },
      404: {
        description: "Convidado não encontrado",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Convidado não encontrado" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Erro ao buscar convidado" }),
            }),
          },
        },
      },
    },
  });

  // ─── DELETE /guest/delete/:guest_id ───────────────────────────────────────
  registry.registerPath({
    method: "delete",
    path: "/guest/delete/{guest_id}",
    tags: ["Guests"],
    summary: "Remove um convidado",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        guest_id: z.string().uuid().openapi({ example: "b2c3d4e5-f6a7-..." }),
      }),
    },
    responses: {
      200: {
        description: "Convidado removido com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Convidado removido com sucesso" }),
            }),
          },
        },
      },
      404: {
        description: "Convidado não encontrado",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Convidado não encontrado" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Erro ao deletar convidado" }),
            }),
          },
        },
      },
    },
  });
}