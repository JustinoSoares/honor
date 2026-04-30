import prisma from "../../database/prisma";
import { validate } from "uuid";
import * as schema from "./event.schema";

export class EventService {
  constructor() {}

  async createEvent(
    data: schema.EventCreate,
    user_id: string,
  ): Promise<schema.ResponseEvent | { message: string; status: number }> {
    try {
      if (!user_id || !validate(user_id)) {
        console.error("Invalid user ID:", user_id);
        return {
          message: "Usuário não autenticado",
          status: 401,
        };
      }

      const existUser = await prisma.user.findFirst({
        where: { id: user_id },
      });

      if (!existUser) {
        return {
          message: "Usuário não autenticado",
          status: 401,
        };
      }

      const existCategory = await prisma.event_category.findFirst({
        where: { name: data.category },
      });

      if (!existCategory) {
        return {
          message: "Categoria de evento inválida",
          status: 400,
        };
      }

      const event = await prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          date_start: new Date(data.date_start),
          date_end: data.date_end ? new Date(data.date_end) : null,
          location: data.location,
          promoter: data.promoter,
          promoter_nif: data.promoter_nif,
          category: data.category,
          duration: data.duration,
          province: data.province,
          contact: data.contact,
          classification: data.classification,
        },
      });

      const packages = data.packages?.map((pkg) => ({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        priority: pkg.priority,
      }));

      await prisma.packages.createMany({
        data:
          packages?.map((pkg) => ({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            priority: pkg.priority,
            event_id: event.id,
          })) || [],
      });

      await prisma.member.create({
        data: {
          user_id,
          event_id: event.id,
          name: existUser.name,
          permission: "MANAGER",
        },
      });

      const getPackages = await prisma.packages.findMany({
        where: { event_id: event.id },
      });

      const getMembers = await prisma.member.findMany({
        where: { event_id: event.id },
      });

      const dataResponse: schema.ResponseEvent = {
        id: event.id,
        title: event.title,
        description: event.description,
        date_start: event.date_start.toISOString(),
        date_end: event.date_end ? event.date_end.toISOString() : undefined,
        location: event.location,
        promoter: event.promoter,
        promoter_nif: event.promoter_nif,
        category: event.category,
        duration: event.duration || undefined,
        province: event.province,
        available: event.available,
        contact: data.contact as { option: string; option2?: string },
        classification: event.classification as "A" | "B" | "C",
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: getPackages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          priority: pkg.priority,
        })),
        members: getMembers.map((member) => ({
          id: member.id,
          name: member.name,
          user_id: member.user_id,
          permission: member.permission as "MANAGER" | "STAFF",
        })),
      };

      return dataResponse;
    } catch (error) {
      console.error("Error creating event:", error);
      return {
        message: "Erro ao criar evento",
        status: 500,
      };
    }
  }

  async getAllEvents(
    page = 1,
    per_page = 10,
    search = "",
    user_id?: string,
  ): Promise<
    | {
        data: schema.ResponseEvent[];
        meta: {
          total: number;
          page: number;
          per_page: number;
          total_pages: number;
        };
      }
    | { message: string; status: number }
  > {
    const skip = (page - 1) * per_page;

    let whereClause = {};
    if (search && search !== "undefined") {
      whereClause = {
        title: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: { id: user_id },
    });

    if (user_id && !existingUser) {
      return {
        message: "Usuário não autenticado",
        status: 401,
      };
    }

    if ((existingUser && existingUser.role === "USER") || !user_id) {
      whereClause = {
        ...whereClause,
        available: true,
      };
    }

    try {
      const events = await prisma.event.findMany({
        skip,
        take: per_page,
        where: whereClause,
        include: {
          packages: true,
          members: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const totalEvents = await prisma.event.count({
        where: whereClause,
      });

      const dataResponse: schema.ResponseEvent[] = events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date_start: event.date_start.toISOString(),
        date_end: event.date_end ? event.date_end.toISOString() : undefined,
        location: event.location,
        promoter: event.promoter,
        promoter_nif: event.promoter_nif,
        category: event.category,
        duration: event.duration || undefined,
        province: event.province,
        contact: event.contact as { option: string; option2?: string },
        classification: event.classification as "A" | "B" | "C",
        available: event.available,
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: event.packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          priority: pkg.priority,
        })),
        members: event.members.map((member) => ({
          id: member.id,
          name: member.name,
          user_id: member.user_id,
          permission: member.permission as "MANAGER" | "STAFF",
        })),
      }));

      return {
        data: dataResponse,
        meta: {
          total: totalEvents,
          page,
          per_page,
          total_pages: Math.ceil(totalEvents / per_page),
        },
      };
    } catch (error) {
      return {
        message: "Erro ao buscar eventos",
        status: 500,
      };
    }
  }

  async getEventById(
    event_id: string,
    user_id?: string,
  ): Promise<schema.ResponseEvent | { message: string; status: number }> {
    try {
      const event = await prisma.event.findFirst({
        where: { id: event_id },
        include: {
          packages: true,
          members: true,
        },
      });

      if (!event) {
        return {
          message: "Evento não encontrado",
          status: 404,
        };
      }

      if (user_id) {
        const existingUser = await prisma.user.findFirst({
          where: { id: user_id },
        });

        if (!existingUser) {
          return {
            message: "Usuário não autenticado",
            status: 401,
          };
        }

        if (existingUser.role === "USER" && !event.available) {
          return {
            message: "Evento não disponível",
            status: 403,
          };
        }
      } else if (!event.available) {
        return {
          message: "Evento não disponível",
          status: 403,
        };
      }

      const dataResponse: schema.ResponseEvent = {
        id: event.id,
        title: event.title,
        description: event.description,
        date_start: event.date_start.toISOString(),
        date_end: event.date_end ? event.date_end.toISOString() : undefined,
        location: event.location,
        promoter: event.promoter,
        promoter_nif: event.promoter_nif,
        category: event.category,
        duration: event.duration || undefined,
        province: event.province,
        contact: event.contact as { option: string; option2?: string },
        classification: event.classification as "A" | "B" | "C",
        available: event.available,
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: event.packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          priority: pkg.priority,
        })),
        members: event.members.map((member) => ({
          id: member.id,
          name: member.name,
          user_id: member.user_id,
          permission: member.permission as "MANAGER" | "STAFF",
        })),
      };

      return dataResponse;
    } catch (error) {
      return {
        message: "Erro ao buscar evento",
        status: 500,
      };
    }
  }

  async updateEvent(
    event_id: string,
    data: schema.EventUpdate,
  ): Promise<schema.ResponseEvent | { message: string; status: number }> {
    const existingEvent = await prisma.event.findUnique({
      where: { id: event_id },
      include: {
        packages: true,
        members: true,
      },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    const updatedEvent = await prisma.event.update({
      where: { id: event_id },
      data: {
        title: data.title ?? existingEvent.title,
        description: data.description ?? existingEvent.description,
        date_start: data.date_start
          ? new Date(data.date_start)
          : existingEvent.date_start,
        date_end: data.date_end
          ? new Date(data.date_end)
          : existingEvent.date_end,
        location: data.location ?? existingEvent.location,
        promoter: data.promoter ?? existingEvent.promoter,
        promoter_nif: data.promoter_nif ?? existingEvent.promoter_nif,
        category: data.category ?? existingEvent.category,
        duration: data.duration ?? existingEvent.duration,
        province: data.province ?? existingEvent.province,
        contact:
          (data.contact as { option: string; option2?: string }) ??
          existingEvent.contact,
        classification: data.classification ?? existingEvent.classification,
      },
    });

    const dataResponse: schema.ResponseEvent = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      date_start: updatedEvent.date_start.toISOString(),
      date_end: updatedEvent.date_end
        ? updatedEvent.date_end.toISOString()
        : undefined,
      location: updatedEvent.location,
      promoter: updatedEvent.promoter,
      promoter_nif: updatedEvent.promoter_nif,
      category: updatedEvent.category,
      duration: updatedEvent.duration || undefined,
      province: updatedEvent.province,
      contact: updatedEvent.contact as { option: string; option2?: string },
      classification: updatedEvent.classification as "A" | "B" | "C",
      available: updatedEvent.available,
      created_at: updatedEvent.created_at.toISOString(),
      updated_at: updatedEvent.updated_at.toISOString(),
      packages: existingEvent.packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        priority: pkg.priority,
      })),
      members: existingEvent.members.map((member) => ({
        id: member.id,
        name: member.name,
        user_id: member.user_id,
        permission: member.permission as "MANAGER" | "STAFF",
      })),
    };

    return dataResponse;
  }

  async deleteEvent(
    event_id: string,
  ): Promise<{ message: string; status: number }> {
    const existingEvent = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }
    await prisma.event.delete({
      where: { id: event_id },
    });
    return {
      message: "Evento deletado com sucesso",
      status: 200,
    };
  }
}
