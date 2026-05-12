// src/docs/modules/backoffice.docs.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// ─── Schemas com openapi ──────────────────────────────────────────────────────

const CreateCategorySchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Música" }),
  })
  .openapi("CreateCategory");

const ResponseCategorySchema = z
  .object({
    id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
    name: z.string().openapi({ example: "Música" }),
    active: z.boolean().openapi({ example: true }),
    created_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
    updated_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("ResponseCategory");

const CategoryListResponseSchema = z.array(ResponseCategorySchema).openapi("CategoryListResponse");

const BaseResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Operação realizada com sucesso" }),
    status: z.number().openapi({ example: 200 }),
  })
  .openapi("BaseResponse");

const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Erro ao processar a requisição" }),
    status: z.number().openapi({ example: 400 }),
  })
  .openapi("ErrorResponse");

const AdminMetricsSchema = z
  .object({
    general: z.object({
      total_events: z.number().openapi({ example: 150 }),
      total_users: z.number().openapi({ example: 1200 }),
      monthly_sales_growth: z.array(z.number()).openapi({ example: [10, 20, 15, 30, 25, 40] }),
    }),
    event_management: z.object({
      active_events: z.number().openapi({ example: 45 }),
      pending_events: z.number().openapi({ example: 12 }),
      rejected_events: z.number().openapi({ example: 5 }),
      blocked_events: z.number().openapi({ example: 3 }),
      events_created_today: z.number().openapi({ example: 3 }),
    }),
    user_management: z.object({
      total_users: z.number().openapi({ example: 1200 }),
      total_admins: z.number().openapi({ example: 5 }),
      total_managers: z.number().openapi({ example: 25 }),
      new_users_today: z.number().openapi({ example: 10 }),
    }),
    content_management: z.object({
      total_categories: z.number().openapi({ example: 15 }),
      pending_requests: z.number().openapi({ example: 12 }),
      gallery_images: z.number().openapi({ example: 450 }),
      service_fee: z.number().openapi({ example: 10 }),
    }),
  })
  .openapi("AdminMetrics");

const PlanResponseSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
    name: z.string().openapi({ example: "Plano Gold" }),
    price: z.number().openapi({ example: 99.9 }),
    description: z.string().openapi({ example: "Melhor plano para eventos médios" }),
    details: z.array(z.string()).openapi({ example: ["Acesso VIP", "Suporte 24h"] }),
    created_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
    updated_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("PlanResponse");

const PlanListResponseSchema = z
  .object({
    data: z.array(PlanResponseSchema),
    meta: z.object({
      page: z.number(),
      per_page: z.number(),
      total: z.number(),
      total_pages: z.number(),
    }),
  })
  .openapi("PlanListResponse");

// ─── Registo ──────────────────────────────────────────────────────────────────

export function registerBackofficeDocs(registry: OpenAPIRegistry) {
  registry.register("CreateCategory", CreateCategorySchema);
  registry.register("ResponseCategory", ResponseCategorySchema);
  registry.register("BaseResponse", BaseResponseSchema);
  registry.register("AdminMetrics", AdminMetricsSchema);
  registry.register("PlanResponse", PlanResponseSchema);
  registry.register("PlanListResponse", PlanListResponseSchema);

  // POST /backoffice/category/create
  registry.registerPath({
    method: "post",
    path: "/backoffice/category/create",
    tags: ["Backoffice - Categorias"],
    summary: "Criar categoria",
    description: "Cria uma nova categoria de eventos.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: CreateCategorySchema },
        },
      },
    },
    responses: {
      201: {
        description: "Categoria criada com sucesso",
        content: {
          "application/json": { schema: ResponseCategorySchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // GET /backoffice/category/list
  registry.registerPath({
    method: "get",
    path: "/backoffice/category/list",
    tags: ["Backoffice - Categorias"],
    summary: "Listar categorias",
    description: "Retorna todas as categorias cadastradas.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Lista de categorias",
        content: {
          "application/json": { schema: CategoryListResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // GET /backoffice/category/each/:id
  registry.registerPath({
    method: "get",
    path: "/backoffice/category/each/{category_id}",
    tags: ["Backoffice - Categorias"],
    summary: "Buscar categoria por ID",
    description: "Retorna uma categoria pelo seu ID.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        category_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      }),
    },
    responses: {
      200: {
        description: "Categoria encontrada",
        content: {
          "application/json": { schema: ResponseCategorySchema },
        },
      },
      404: {
        description: "Categoria não encontrada",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // PUT /backoffice/category/update/:id
  registry.registerPath({
    method: "put",
    path: "/backoffice/category/update/{category_id}",
    tags: ["Backoffice - Categorias"],
    summary: "Atualizar categoria",
    description: "Atualiza os dados de uma categoria pelo seu ID.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        category_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      }),
      body: {
        content: {
          "application/json": { schema: CreateCategorySchema },
        },
      },
    },
    responses: {
      200: {
        description: "Categoria atualizada com sucesso",
        content: {
          "application/json": { schema: ResponseCategorySchema },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      404: {
        description: "Categoria não encontrada",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // PATCH /backoffice/category/toggle
  registry.registerPath({
    method: "patch",
    path: "/backoffice/category/toggle",
    tags: ["Backoffice - Categorias"],
    summary: "Ativar/Desativar categoria",
    description: "Alterna o estado activo/inactivo de uma categoria pelo nome.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().openapi({ example: "Música" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Estado da categoria alterado com sucesso",
        content: {
          "application/json": { schema: BaseResponseSchema },
        },
      },
      404: {
        description: "Categoria não encontrada",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // GET /backoffice/metrics
  registry.registerPath({
    method: "get",
    path: "/backoffice/metrics",
    tags: ["Backoffice - Métricas"],
    summary: "Obter métricas do administrador",
    description: "Retorna métricas gerais, de eventos, de usuários e de conteúdo.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Métricas obtidas com sucesso",
        content: {
          "application/json": { schema: AdminMetricsSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // POST /backoffice/plan/create
  registry.registerPath({
    method: "post",
    path: "/backoffice/plan/create",
    tags: ["Backoffice - Planos"],
    summary: "Criar plano",
    description: "Cria um novo plano. Limite de 3 planos no sistema.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().openapi({ example: "Plano Gold" }),
              price: z.number().openapi({ example: 99.9 }),
              description: z.string().openapi({ example: "Melhor plano para eventos médios" }),
              details: z.array(z.string()).openapi({ example: ["Acesso VIP", "Suporte 24h"] }),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Plano criado com sucesso",
        content: {
          "application/json": { schema: PlanResponseSchema },
        },
      },
      400: {
        description: "Dados inválidos ou limite de planos atingido",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // GET /backoffice/plan/list
  registry.registerPath({
    method: "get",
    path: "/backoffice/plan/list",
    tags: ["Backoffice - Planos"],
    summary: "Listar planos",
    description: "Retorna todos os planos cadastrados.",
    responses: {
      200: {
        description: "Lista de planos",
        content: {
          "application/json": { schema: PlanListResponseSchema },
        },
      },
    },
  });

  // GET /backoffice/plan/each/:id
  registry.registerPath({
    method: "get",
    path: "/backoffice/plan/each/{id}",
    tags: ["Backoffice - Planos"],
    summary: "Buscar plano por ID",
    description: "Retorna um plano pelo seu ID.",
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      }),
    },
    responses: {
      200: {
        description: "Plano encontrado",
        content: {
          "application/json": { schema: PlanResponseSchema },
        },
      },
      404: {
        description: "Plano não encontrado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // PUT /backoffice/plan/update/:id
  registry.registerPath({
    method: "put",
    path: "/backoffice/plan/update/{id}",
    tags: ["Backoffice - Planos"],
    summary: "Atualizar plano",
    description: "Atualiza os dados de um plano pelo seu ID.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().optional().openapi({ example: "Plano Premium" }),
              price: z.number().optional().openapi({ example: 149.9 }),
              description: z.string().optional().openapi({ example: "Ainda melhor" }),
              details: z
                .array(z.string())
                .optional()
                .openapi({ example: ["Tudo ilimitado"] }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Plano atualizado com sucesso",
        content: {
          "application/json": { schema: PlanResponseSchema },
        },
      },
      404: {
        description: "Plano não encontrado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // DELETE /backoffice/plan/delete/:id
  registry.registerPath({
    method: "delete",
    path: "/backoffice/plan/delete/{id}",
    tags: ["Backoffice - Planos"],
    summary: "Remover plano",
    description: "Remove um plano pelo seu ID.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      }),
    },
    responses: {
      200: {
        description: "Plano removido com sucesso",
        content: {
          "application/json": { schema: BaseResponseSchema },
        },
      },
      404: {
        description: "Plano não encontrado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // Block user schemas
  const BlockUserResponseSchema = z
    .object({
      id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      name: z.string().openapi({ example: "Justino Soares" }),
      email: z.string().openapi({ example: "justino@email.com" }),
      is_active: z.boolean().openapi({ example: false }),
    })
    .openapi("BlockUserResponse");

  const UnblockUserResponseSchema = z
    .object({
      id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      name: z.string().openapi({ example: "Justino Soares" }),
      email: z.string().openapi({ example: "justino@email.com" }),
      is_active: z.boolean().openapi({ example: true }),
    })
    .openapi("UnblockUserResponse");

  // PATCH /backoffice/user/block/:user_id
  registry.registerPath({
    method: "patch",
    path: "/backoffice/user/block/{user_id}",
    tags: ["Backoffice - Utilizadores"],
    summary: "Bloquear utilizador",
    description: "Bloqueia um utilizador, impedindo-o de fazer login e usar o sistema.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        user_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      }),
    },
    responses: {
      200: {
        description: "Utilizador bloqueado com sucesso",
        content: {
          "application/json": { schema: BlockUserResponseSchema },
        },
      },
      400: {
        description: "Utilizador já está bloqueado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      404: {
        description: "Utilizador não encontrado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // PATCH /backoffice/user/unblock/:user_id
  registry.registerPath({
    method: "patch",
    path: "/backoffice/user/unblock/{user_id}",
    tags: ["Backoffice - Utilizadores"],
    summary: "Desbloquear utilizador",
    description: "Desbloqueia um utilizador, permitindo-lhe voltar a usar o sistema.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        user_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
      }),
    },
    responses: {
      200: {
        description: "Utilizador desbloqueado com sucesso",
        content: {
          "application/json": { schema: UnblockUserResponseSchema },
        },
      },
      400: {
        description: "Utilizador já está ativo",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      404: {
        description: "Utilizador não encontrado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": { schema: ErrorResponseSchema },
        },
      },
    },
  });
}
