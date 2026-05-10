import prisma from "../../database/prisma";
import { validate } from "uuid";
import * as schema from "./backoffice.schema";

export class BackofficeService {
  constructor() { }

  async addCategory(data: schema.CreateCategoryDTO) {
    const existingCategory = await prisma.event_category.findFirst({
      where: { name: data.name },
    });

    if (existingCategory) {
      return {
        message: "Já existe uma categoria com este nome. Escolha um nome diferente.",

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
    category_id: string,
  ): Promise<schema.ResponseCategoryDTO | { message: string; status: number }> {
    if (!validate(category_id)) {
      return {
        message: "Não encontrámos a categoria que procura. Verifique o nome e tente novamente.",

        status: 400,
      };
    }

    const category = await prisma.event_category.findFirst({
      where: { OR: [{ id: category_id }, { name: { contains: category_id } }] },
    });

    if (!category) {
      return {
        message:
          "Não encontrámos a categoria que procura. Pode ter sido removida ou o nome está errado.",

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
        message:
          "Não foi possível identificar a categoria para atualizar. Verifique e tente novamente.",

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
        message:
          "Não encontrámos a categoria que procura. Pode ter sido removida ou o nome está errado.",

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

  async getAdminMetrics(): Promise<schema.AdminMetricsDTO> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEvents,
      totalUsers,
      activeEvents,
      pendingEvents,
      rejectedEvents,
      eventsCreatedToday,
      totalAdmins,
      totalManagers,
      newUsersToday,
      totalCategories,
      galleryImages,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.user.count(),
      prisma.event.count({ where: { status_event: "ACTIVE" } }),
      prisma.event.count({ where: { status_event: "PENDING" } }),
      prisma.event.count({ where: { status_event: "REJECTED" } }),
      prisma.event.count({ where: { created_at: { gte: today } } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "MANAGER" } }),
      prisma.user.count({ where: { created_at: { gte: today } } }),
      prisma.event_category.count(),
      prisma.image.count(),
    ]);

    return {
      general: {
        total_events: totalEvents,
        total_users: totalUsers,
        monthly_sales_growth: [10, 20, 15, 30, 25, 40], // Mockado
      },
      event_management: {
        active_events: activeEvents,
        pending_events: pendingEvents,
        rejected_events: rejectedEvents,
        events_created_today: eventsCreatedToday,
      },
      user_management: {
        total_users: totalUsers,
        total_admins: totalAdmins,
        total_managers: totalManagers,
        new_users_today: newUsersToday,
      },
      content_management: {
        total_categories: totalCategories,
        pending_requests: pendingEvents,
        gallery_images: galleryImages,
        service_fee: 10,
      },
    };
  }
}
