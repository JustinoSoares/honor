// src/docs/modules/backoffice.docs.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// ─── Schemas com openapi ──────────────────────────────────────────────────────

const CreateCategorySchema = z.object({
  name: z.string().min(1).openapi({ example: 'Música' }),
}).openapi('CreateCategory');

const ResponseCategorySchema = z.object({
  id: z.string().uuid().openapi({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
  name: z.string().openapi({ example: 'Música' }),
  active: z.boolean().openapi({ example: true }),
  created_at: z.string().datetime().openapi({ example: '2024-01-01T00:00:00Z' }),
  updated_at: z.string().datetime().openapi({ example: '2024-01-01T00:00:00Z' }),
}).openapi('ResponseCategory');

const CategoryListResponseSchema = z.array(ResponseCategorySchema).openapi('CategoryListResponse');

const BaseResponseSchema = z.object({
  message: z.string().openapi({ example: 'Operação realizada com sucesso' }),
  status: z.number().openapi({ example: 200 }),
}).openapi('BaseResponse');

const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: 'Erro ao processar a requisição' }),
  status: z.number().openapi({ example: 400 }),
}).openapi('ErrorResponse');

// ─── Registo ──────────────────────────────────────────────────────────────────

export function registerBackofficeDocs(registry: OpenAPIRegistry) {
  registry.register('CreateCategory', CreateCategorySchema);
  registry.register('ResponseCategory', ResponseCategorySchema);
  registry.register('BaseResponse', BaseResponseSchema);

  // POST /backoffice/category/create
  registry.registerPath({
    method: 'post',
    path: '/backoffice/category/create',
    tags: ['Backoffice - Categorias'],
    summary: 'Criar categoria',
    description: 'Cria uma nova categoria de eventos.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': { schema: CreateCategorySchema },
        },
      },
    },
    responses: {
      201: {
        description: 'Categoria criada com sucesso',
        content: {
          'application/json': { schema: ResponseCategorySchema },
        },
      },
      400: {
        description: 'Dados inválidos',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: 'Não autorizado',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // GET /backoffice/category/list
  registry.registerPath({
    method: 'get',
    path: '/backoffice/category/list',
    tags: ['Backoffice - Categorias'],
    summary: 'Listar categorias',
    description: 'Retorna todas as categorias cadastradas.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Lista de categorias',
        content: {
          'application/json': { schema: CategoryListResponseSchema },
        },
      },
      401: {
        description: 'Não autorizado',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // GET /backoffice/category/each/:name
  registry.registerPath({
    method: 'get',
    path: '/backoffice/category/each/{name}',
    tags: ['Backoffice - Categorias'],
    summary: 'Buscar categoria por ID',
    description: 'Retorna uma categoria pelo seu ID.',
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        name: z.string().uuid().openapi({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
      }),
    },
    responses: {
      200: {
        description: 'Categoria encontrada',
        content: {
          'application/json': { schema: ResponseCategorySchema },
        },
      },
      404: {
        description: 'Categoria não encontrada',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: 'Não autorizado',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // PUT /backoffice/category/update/:name
  registry.registerPath({
    method: 'put',
    path: '/backoffice/category/update/{name}',
    tags: ['Backoffice - Categorias'],
    summary: 'Atualizar categoria',
    description: 'Atualiza os dados de uma categoria pelo seu ID.',
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        name: z.string().uuid().openapi({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
      }),
      body: {
        content: {
          'application/json': { schema: CreateCategorySchema },
        },
      },
    },
    responses: {
      200: {
        description: 'Categoria atualizada com sucesso',
        content: {
          'application/json': { schema: ResponseCategorySchema },
        },
      },
      400: {
        description: 'Dados inválidos',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
      404: {
        description: 'Categoria não encontrada',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: 'Não autorizado',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
    },
  });

  // PATCH /backoffice/category/toggle/:category_name
  registry.registerPath({
    method: 'patch',
    path: '/backoffice/category/toggle/{category_name}',
    tags: ['Backoffice - Categorias'],
    summary: 'Ativar/Desativar categoria',
    description: 'Alterna o estado activo/inactivo de uma categoria pelo nome.',
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        category_name: z.string().openapi({ example: 'Música' }),
      }),
    },
    responses: {
      200: {
        description: 'Estado da categoria alterado com sucesso',
        content: {
          'application/json': { schema: BaseResponseSchema },
        },
      },
      404: {
        description: 'Categoria não encontrada',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
      401: {
        description: 'Não autorizado',
        content: {
          'application/json': { schema: ErrorResponseSchema },
        },
      },
    },
  });
}