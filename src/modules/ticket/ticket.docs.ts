// src/docs/modules/guest.docs.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import * as schema from "./ticket.schema";

export function registerTicketDocs(registry: OpenAPIRegistry) {
  // Regista os schemas
  registry.register("CreateTicketSchema", schema.CreateTicketSchema);
  registry.register("ResponseTicket", schema.ResponseTicket);
  registry.register("TicketGuestSchema", schema.TicketGuestSchema);
  registry.register("ResponseTicket", schema.ResponseTicket);

  // ─── POST /ticket/create ────────────────────────────────────────────────────
  registry.registerPath({
    method: "post",
    path: "/ticket/create",
    tags: ["Tickets"],
    summary: "Cria novos tickets para um evento",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: schema.CreateTicketSchema },
        },
      },
    },
    responses: {
      201: {
        description: "Ticket criado com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(schema.ResponseTicket),
            }),
          },
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
              message: z.string().openapi({ example: "Erro ao criar ticket" }),
            }),
          },
        },
      },
    },
  });

  // ─── GET /ticket/list/:event_id ─────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/ticket/list/{event_id}",
    tags: ["Tickets"],
    summary: "Lista todos os tickets de um evento",
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
        description: "Lista de tickets retornada com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(schema.ResponseTicket),
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
              message: z.string().openapi({ example: "Evento não encontrado" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Erro ao buscar tickets" }),
            }),
          },
        },
      },
    },
  });

  // ─── GET /ticket/user/:user_id
  registry.registerPath({
    method: "get",
    path: "/ticket/user/{user_id}",
    tags: ["Tickets"],
    summary: "Lista todos os tickets de um usuário",
    request: {
      params: z.object({
        user_id: z.string().uuid().openapi({ example: "c3d4e5f6-g7h8-..." }),
      }),
    },
    responses: {
      200: {
        description: "Lista de tickets retornada com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(schema.ResponseTicket),
              meta: z.object({
                total: z.number().openapi({ example: 50 }),
                page: z.number().openapi({ example: 1 }),
                per_page: z.number().openapi({ example: 10 }),
                total_pages: z.number().openapi({ example: 5 }),
              }),
            }),
          },
        },
      },
      404: {
        description: "Usuário não encontrado",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Usuário não encontrado" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Erro ao buscar tickets" }),
            }),
          },
        },
      },
    },
  });

  // ─── GET /ticket/each/:ticket_id ─────────────────────────────────────────────
  registry.registerPath({
    method: "get",
    path: "/ticket/each/{ticket_id}",
    tags: ["Tickets"],
    summary: "Busca um ticket por ID",
    request: {
      params: z.object({
        ticket_id: z.string().uuid().openapi({ example: "b2c3d4e5-f6a7-..." }),
      }),
    },
    responses: {
      200: {
        description: "Ticket encontrado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseTicket },
        },
      },
      404: {
        description: "Ticket não encontrado",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Ticket não encontrado" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Erro ao buscar ticket" }),
            }),
          },
        },
      },
    },
  });

  // ─── DELETE /ticket/delete/:ticket_id ───────────────────────────────────────
  registry.registerPath({
    method: "delete",
    path: "/ticket/delete/{ticket_id}",
    tags: ["Tickets"],
    summary: "Remove um ticket por ID",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        ticket_id: z.string().uuid().openapi({ example: "b2c3d4e5-f6a7-..." }),
      }),
    },
    responses: {
      200: {
        description: "Ticket removido com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Ticket removido com sucesso" }),
            }),
          },
        },
      },
      404: {
        description: "Ticket não encontrado",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Ticket não encontrado" }),
            }),
          },
        },
      },
      500: {
        description: "Erro interno do servidor",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Erro ao deletar ticket" }),
            }),
          },
        },
      },
    },
  });
}
