import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import * as schema from "./galary.schema";
import { ResponseBadSchema } from "../event/event.schema";

export function registerGalaryDocs(registry: OpenAPIRegistry) {
  registry.register("CreateGalary", schema.CreateGalarySchema);
  registry.register("ResponseGalary", schema.ResponseGalarySchema);
  registry.register("ResponseGalaryList", schema.ResponseGalaryListSchema);
  registry.register("UpdateGalary", schema.UpdateGalarySchema);

  registry.registerPath({
    method: "post",
    path: "/galary",
    tags: ["Galary"],
    summary: "Adiciona um item à galeria",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: schema.CreateGalarySchema },
        },
      },
    },
    responses: {
      201: {
        description: "Item criado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseGalarySchema },
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
    path: "/galary",
    tags: ["Galary"],
    summary: "Lista itens da galeria",
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: "1" }),
        per_page: z.string().optional().openapi({ example: "10" }),
      }),
    },
    responses: {
      200: {
        description: "Lista retornada com sucesso",
        content: {
          "application/json": { schema: schema.ResponseGalaryListSchema },
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
    path: "/galary/{id}",
    tags: ["Galary"],
    summary: "Busca um item da galeria por ID",
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
    },
    responses: {
      200: {
        description: "Item encontrado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseGalarySchema },
        },
      },
      404: {
        description: "Item não encontrado",
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
    method: "put",
    path: "/galary/{id}",
    tags: ["Galary"],
    summary: "Atualiza um item da galeria",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
      body: {
        content: {
          "application/json": { schema: schema.UpdateGalarySchema },
        },
      },
    },
    responses: {
      200: {
        description: "Item atualizado com sucesso",
        content: {
          "application/json": { schema: schema.ResponseGalarySchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: ResponseBadSchema },
        },
      },
      404: {
        description: "Item não encontrado",
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
    method: "delete",
    path: "/galary/{id}",
    tags: ["Galary"],
    summary: "Remove um item da galeria",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
      }),
    },
    responses: {
      200: {
        description: "Item removido com sucesso",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Item removido com sucesso" }),
            }),
          },
        },
      },
      404: {
        description: "Item não encontrado",
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
