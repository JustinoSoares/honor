import prisma from "../../database/prisma";
import { validate } from "uuid";
import * as schema from "./backoffice.schema";

export class BackofficeService {
  constructor() {}

  async addCategory(data: schema.CreateCategoryDTO) {
    const existingCategory = await prisma.event_category.findFirst({
      where: { name: data.name },
    });

    if (existingCategory) {
      return {
        message: "Categoria já existe",
        status: 400,
      };
    }

    const category = await prisma.event_category.create({
      data: { name: data.name },
    });

    return {
      id: category.id,
      name: category.name,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
      active: category.active,
    } as schema.ResponseCategoryDTO;
  }

  async getAllCategories(
    page: number = 1,
    per_page: number = 10,
    search?: string,
  ): Promise<
    | {
        data: schema.ResponseCategoryDTO[];
        meta: {
          page: number;
          per_page: number;
          total: number;
          total_pages: number;
        };
      }
    | { message: string; status: number }
  > {
    let whereClause = {};
    if (search && search !== "undefined") {
      whereClause = {
        title: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const categories = await prisma.event_category.findMany({
      where: whereClause,
      skip: (page - 1) * per_page,
      take: per_page,
    });

    const dataResponse = categories.map((category) => ({
      id: category.id,
      name: category.name,
      active: category.active,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
    }));

    const total = await prisma.event_category.count({
      where: whereClause,
    });

    return {
      data: dataResponse,
      meta: {
        page,
        per_page,
        total: total,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async getCategoryById(
    name: string,
  ): Promise<schema.ResponseCategoryDTO | { message: string; status: number }> {
    if (!validate(name)) {
      return {
        message: "Nome de categoria inválido",
        status: 400,
      };
    }

    const category = await prisma.event_category.findUnique({
      where: { name },
    });

    if (!category) {
      return {
        message: "Categoria não encontrada",
        status: 404,
      };
    }

    return {
      id: category.id,
      name: category.name,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
    } as schema.ResponseCategoryDTO;
  }

  async updateCategory(id: string, name: string) {
    if (!validate(id)) {
      return {
        message: "ID de categoria inválido",
        status: 400,
      };
    }

    const category = await prisma.event_category.update({
      where: { id },
      data: { name },
    });

    return {
      id: category.id,
      name: category.name,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
    } as schema.ResponseCategoryDTO;
  }

  async toggleCategory(name: string) {
    const existingCategory = await prisma.event_category.findFirst({
      where: { name },
    });

    if (!existingCategory) {
      return {
        message: "Categoria não encontrada",
        status: 404,
      };
    }

    await prisma.event_category.update({
      where: {
        name: name,
      },
      data: { active: !existingCategory.active },
    });

    return {
      status: 200,
      message: "Categoria atualizada com sucesso",
    };
  }
}
