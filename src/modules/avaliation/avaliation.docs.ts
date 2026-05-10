import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import * as schema from "./avaliation.schema";
import { ResponseBadSchema } from "../event/event.schema";

export function registerAvaliationDocs(registry: OpenAPIRegistry) {
  registry.register("CreateAvaliation", schema.CreateAvaliationSchema);
  registry.register("UpdateAvaliation", schema.UpdateAvaliationSchema);
  registry.register("ResponseAvaliation", schema.ResponseAvaliationSchema);

  registry.registerPath({
    method: "post",
    path: "/avaliation/create",
    tags: ["Avaliations"],
    summary: "Cria uma nova avaliação para um evento",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: schema.CreateAvaliationSchema },
        },
      },
    },
    responses: {
      201: {
        description: "Avaliação criada com sucesso",
        content: {
          "application/json": { schema: schema.ResponseAvaliationSchema },
        },
      },
      400: {
        description: "Dados inválidos ou já avaliado",
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
    path: "/avaliation/event/{event_id}",
    tags: ["Avaliations"],
    summary: "Lista as avaliações de um evento",
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
        description: "Avaliações listadas com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              data: z.array(schema.ResponseAvaliationSchema),
              total: z.number(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "put",
    path: "/avaliation/update/{avaliation_id}",
    tags: ["Avaliations"],
    summary: "Atualiza uma avaliação",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        avaliation_id: z.string().uuid(),
      }),
      body: {
        content: {
          "application/json": { schema: schema.UpdateAvaliationSchema },
        },
      },
    },
    responses: {
      200: {
        description: "Avaliação atualizada com sucesso",
        content: {
          "application/json": { schema: schema.ResponseAvaliationSchema },
        },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/avaliation/delete/{avaliation_id}",
    tags: ["Avaliations"],
    summary: "Exclui uma avaliação",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        avaliation_id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: "Avaliação excluída com sucesso",
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
