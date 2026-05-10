import prisma from "../../database/prisma";
import { validate } from "uuid";
import * as schema from "./event.schema";
import * as schemaGuest from "../ticket/ticket.schema";
import { isImageByExtension } from "../../utils/verify_image";
import { decryptDefault } from "../../utils/crypt";
import { notify } from "../../utils/notify";

export class EventService {
  constructor() { }

  private async checkPermission(
    user_id: string,
    event_id: string,
    required: "MANAGER" | "STAFF",
  ): Promise<boolean> {
    // 1. Check global ADMIN role first
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) return false;
    if (user.role === "ADMIN") return true;

    const existEvent = await prisma.event.findUnique({ where: { id: event_id } });
    if (!existEvent) return false;

    // Se o evento estiver bloqueado, apenas ADMINs (já verificados acima) têm acesso
    if (existEvent.status_event === "BLOCKED") return false;
    if (existEvent.status_event === "CANCELLED") return false;

    // 2. Check event membership
    const member = await prisma.member.findFirst({
      where: { user_id, event_id },
    });

    if (!member) return false;

    if (required === "MANAGER" && member.permission !== "MANAGER") return false;
    // STAFF requirement is satisfied by both STAFF and MANAGER permissions
    return true;
  }

  async createEvent(
    data: schema.EventCreate,
    user_id: string,
  ): Promise<schema.ResponseEvent | { message: string; status: number }> {
    try {
      if (!user_id || !validate(user_id))
        return {
          message: "Precisa de fazer login para criar um evento.",

          status: 401,
        };

      const existUser = await prisma.user.findFirst({
        where: { id: user_id },
      });

      if (!existUser) {
        return {
          message: "Precisa de fazer login para criar um evento.",

          status: 401,
        };
      }

      const existCategory = await prisma.event_category.findFirst({
        where: { name: data.category },
      });

      if (!existCategory) {
        return {
          message:
            "A categoria de evento selecionada não existe. Escolha uma categoria válida da lista disponível.",

          status: 400,
        };
      }

      const packages = data.packages?.map((pkg) => ({
        name: pkg.name,
        benefits: pkg.benefits as string[],
        price: pkg.price,
        priority: pkg.priority,
        max_tickets: pkg.max_tickets,
      }));

      const names = packages?.map((pkg) => pkg.name) ?? [];
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates && duplicates.length > 0) {
        return {
          message: `Pacotes do mesmo evento não podem ter o mesmo nome, ${duplicates[0]} é um exemplo`,
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
          cover_url: data.cover_url,
          max_guests: data.max_guests,
          promoter: data.promoter,
          promoter_nif: data.promoter_nif,
          category: data.category,
          duration: data.duration,
          province: data.province,
          contact: data.contact,
          classification: data.classification,
        },
      });

      await prisma.packages.createMany({
        data:
          packages?.map((pkg) => ({
            name: pkg.name,
            benefits: pkg.benefits as string[],
            price: pkg.price,
            priority: pkg.priority,
            max_tickets: pkg.max_tickets,
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
        cover_url: event.cover_url || undefined,
        max_guests: event.max_guests || undefined,
        location: event.location,
        promoter: event.promoter,
        promoter_nif: event.promoter_nif,
        category: event.category,
        duration: event.duration || undefined,
        province: event.province,
        available: event.available,
        contact: data.contact as { option: string; option2?: string },
        classification: event.classification as "A" | "B" | "C",
        status_event: event.status_event as
          | "PENDING"
          | "ACTIVE"
          | "BLOCKED"
          | "REJECTED"
          | "CANCELLED"
          | "FINISH",
        reason_rejection: event.reason_rejection,
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: getPackages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          benefits: pkg.benefits as string[],
          price: pkg.price,
          priority: pkg.priority,
          max_tickets: pkg.max_tickets || undefined,
          purchased: pkg.purchased,
        })),
        members: getMembers.map((member) => ({
          id: member.id,
          name: member.name,
          user_id: member.user_id,
          permission: member.permission as "MANAGER" | "STAFF",
        })),
        comments: [],
      };

      // Notifica o criador que o evento foi criado com sucesso
      await notify(
        user_id,
        `O seu evento "${event.title}" foi criado com sucesso e aguarda aprovação.`,
        {
          type: "event_created",
          event_id: event.id,
        },
      );

      return dataResponse;
    } catch (error) {
      console.error("Error creating event:", error);
      return {
        message: "Ocorreu um erro ao criar o evento. Por favor, tente novamente.",
        status: 500,
      };
    }
  }

  async verifyEvent(
    event_id: string,
    user_id: string,
    available: boolean,
  ): Promise<{ message: string; status: number }> {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user || user.role !== "ADMIN") {
      return {
        message: "Não tem permissão para realizar esta operação",
        status: 403,
      };
    }

    if (!validate(event_id) || !validate(user_id)) {
      return {
        message: "ID de evento ou usuário inválido",
        status: 400,
      };
    }
    const existEvent = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!existEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    await prisma.event.update({
      where: { id: event_id },
      data: {
        available: available,
        responsible_id: user_id,
        status_event: available ? "ACTIVE" : "REJECTED",
      },
    });

    // Notifica os membros do evento sobre a alteração de disponibilidade
    const members = await prisma.member.findMany({ where: { event_id } });
    const statusLabel = available ? "disponível ao público" : "indisponível temporariamente";
    await Promise.all(
      members.map((m) =>
        notify(m.user_id, `O evento "${existEvent.title}" está agora ${statusLabel}.`, {
          type: "event_status_changed",
          event_id,
          available,
        }),
      ),
    );

    return {
      message: "Evento atualizado com sucesso",
      status: 200,
    };
  }

  async rejectEvent(
    event_id: string,
    user_id: string,
    reason_rejection: string,
  ): Promise<{ message: string; status: number }> {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user || user.role !== "ADMIN") {
      return {
        message: "Não tem permissão para realizar esta operação",
        status: 403,
      };
    }

    if (!validate(event_id) || !validate(user_id)) {
      return {
        message: "ID de evento ou usuário inválido",
        status: 400,
      };
    }

    const existEvent = await prisma.event.findUnique({
      where: { id: event_id },
      include: { members: { where: { permission: "MANAGER" } } },
    });

    if (!existEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    if (existEvent.status_event !== "PENDING") {
      return {
        message: "Apenas eventos pendentes podem ser rejeitados",
        status: 400,
      };
    }

    await prisma.event.update({
      where: { id: event_id },
      data: {
        status_event: "REJECTED",
        reason_rejection,
        available: false,
        responsible_id: user_id,
      },
    });

    // Notifica o gestor do evento sobre a rejeição
    const manager = existEvent.members[0];
    if (manager) {
      await notify(
        manager.user_id,
        `O seu evento "${existEvent.title}" foi rejeitado. Motivo: ${reason_rejection}`,
        {
          type: "event_rejected",
          event_id,
          reason_rejection,
        },
      );
    }

    return {
      message: "Evento rejeitado com sucesso",
      status: 200,
    };
  }

  async getAllEvents(
    page = 1,
    per_page = 10,
    search?: string | undefined,
    user_id?: string,
    min_price: number | undefined = undefined,
    max_price: number | undefined = undefined,
    category: string | string[] | undefined = undefined,
    start_date?: string,
    end_date?: string,
    status_event?: string | string[],
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
        ...whereClause,
        title: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    if (start_date || end_date) {
      whereClause = {
        ...whereClause,
        created_at: {
          gte: start_date ? new Date(start_date) : undefined,
          lte: end_date ? new Date(end_date) : undefined,
        },
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: { id: user_id },
    });

    if (user_id && !existingUser) {
      return {
        message: "Precisa de fazer login para ver os eventos.",

        status: 401,
      };
    }

    if (existingUser && existingUser.role === "ADMIN") {
      if (status_event) {
        whereClause = {
          ...whereClause,
          status_event: Array.isArray(status_event)
            ? { in: status_event }
            : status_event,
        };
      }
    } else {
      const publicCondition = {
        status_event: "ACTIVE",
      };

      if (user_id) {
        whereClause = {
          ...whereClause,
          OR: [
            publicCondition,
            {
              members: { some: { user_id } },
              status_event: { in: ["PENDING", "REJECTED", "BLOCKED", "FINISH"] },
            },
          ],
        };
      } else {
        whereClause = {
          ...whereClause,
          ...publicCondition,
          available: true,
        };
      }

      if (status_event) {
        const statuses = Array.isArray(status_event) ? status_event : [status_event];
        const allowedStatuses = statuses.filter((s) => s !== "CANCELLED");
        if (allowedStatuses.length > 0) {
          whereClause = {
            ...whereClause,
            status_event: { in: allowedStatuses },
          };
        } else {
          whereClause = {
            ...whereClause,
            status_event: "ACTIVE",
          };
        }
      }
    }

    try {
      const events = await prisma.event.findMany({
        skip,
        take: per_page,
        where: {
          ...whereClause,
          event_category: category
            ? {
              name: Array.isArray(category) ? { in: category } : category,
            }
            : undefined,
          packages:
            min_price !== undefined || max_price !== undefined
              ? {
                some: {
                  price: {
                    gte: min_price ?? undefined,
                    lte: max_price ?? undefined,
                  },
                },
              }
              : undefined,
        },
        include: {
          packages: true,
          event_category: true,
          members: true,
          comments: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const totalEvents = await prisma.event.count({
        where: {
          ...whereClause,
          event_category: category
            ? {
              name: Array.isArray(category)
                ? { in: category, mode: "insensitive" }
                : { equals: category, mode: "insensitive" },
            }
            : undefined,
          packages:
            min_price !== undefined || max_price !== undefined
              ? {
                some: {
                  price: {
                    gte: min_price ?? undefined,
                    lte: max_price ?? undefined,
                  },
                },
              }
              : undefined,
        },
      });

      const dataResponse: schema.ResponseEvent[] = events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date_start: event.date_start.toISOString(),
        date_end: event.date_end ? event.date_end.toISOString() : undefined,
        cover_url: event.cover_url || undefined,
        max_guests: event.max_guests || undefined,
        location: event.location,
        promoter: event.promoter,
        promoter_nif: event.promoter_nif,
        category: event.category,
        duration: event.duration || undefined,
        province: event.province,
        contact: event.contact as { option: string; option2?: string },
        classification: event.classification as "A" | "B" | "C",
        available: event.available,
        status_event: event.status_event as
          | "PENDING"
          | "ACTIVE"
          | "BLOCKED"
          | "REJECTED"
          | "CANCELLED"
          | "FINISH",
        reason_rejection: event.reason_rejection,
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: event.packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          benefits: pkg.benefits as string[],
          price: pkg.price,
          priority: pkg.priority,
          max_tickets: pkg.max_tickets || undefined,
          purchased: pkg.purchased,
        })),
        members: event.members.map((member) => ({
          id: member.id,
          name: member.name,
          user_id: member.user_id,
          permission: member.permission as "MANAGER" | "STAFF",
        })),
        comments: event.comments.map((a) => ({
          id: a.id,
          user_id: a.user_id,
          content: a.content,
          user: { name: a.user.name },
          created_at: a.created_at.toISOString(),
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
      console.error("Error fetching events:", error);
      return {
        message: "Erro ao buscar eventos",
        status: 500,
      };
    }
  }

  async listEventsByUser(
    user_id: string,
    page = 1,
    per_page = 10,
    search?: string | undefined,
    min_price: number | undefined = undefined,
    max_price: number | undefined = undefined,
    category: string | string[] | undefined = undefined,
    start_date?: string,
    end_date?: string,
    status_event?: string | string[],
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
        ...whereClause,
        title: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    if (start_date || end_date) {
      whereClause = {
        ...whereClause,
        created_at: {
          gte: start_date ? new Date(start_date) : undefined,
          lte: end_date ? new Date(end_date) : undefined,
        },
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: { id: user_id },
    });

    if (!existingUser) {
      return {
        message: "Precisa de fazer login para ver os seus eventos.",
        status: 401,
      };
    }

    if (existingUser && existingUser.role === "ADMIN") {
      if (status_event) {
        whereClause = {
          ...whereClause,
          status_event: Array.isArray(status_event)
            ? { in: status_event }
            : status_event,
        };
      }
    } else {
      if (status_event) {
        const statuses = Array.isArray(status_event) ? status_event : [status_event];
        const allowedStatuses = statuses.filter((s) => s !== "CANCELLED");
        if (allowedStatuses.length > 0) {
          whereClause = {
            ...whereClause,
            status_event: { in: allowedStatuses },
          };
        } else {
          whereClause = {
            ...whereClause,
            status_event: "ACTIVE",
          };
        }
      } else {
        whereClause = {
          ...whereClause,
          status_event: { not: "CANCELLED" },
        };
      }
    }

    try {
      const events = await prisma.event.findMany({
        skip,
        take: per_page,
        where: {
          ...whereClause,
          event_category: category
            ? {
              name: Array.isArray(category) ? { in: category } : category,
            }
            : undefined,
          packages:
            min_price !== undefined || max_price !== undefined
              ? {
                some: {
                  price: {
                    gte: min_price ?? undefined,
                    lte: max_price ?? undefined,
                  },
                },
              }
              : undefined,
          members: {
            some: {
              user_id,
            },
          },
        },
        include: {
          packages: true,
          event_category: true,
          members: true,
          comments: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const totalEvents = await prisma.event.count({
        where: {
          ...whereClause,
          event_category: category
            ? {
              name: Array.isArray(category)
                ? { in: category, mode: "insensitive" }
                : { equals: category, mode: "insensitive" },
            }
            : undefined,
          packages:
            min_price !== undefined || max_price !== undefined
              ? {
                some: {
                  price: {
                    gte: min_price ?? undefined,
                    lte: max_price ?? undefined,
                  },
                },
              }
              : undefined,
        },
      });

      const dataResponse: schema.ResponseEvent[] = events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date_start: event.date_start.toISOString(),
        date_end: event.date_end ? event.date_end.toISOString() : undefined,
        cover_url: event.cover_url || undefined,
        max_guests: event.max_guests || undefined,
        location: event.location,
        promoter: event.promoter,
        promoter_nif: event.promoter_nif,
        category: event.category,
        duration: event.duration || undefined,
        province: event.province,
        contact: event.contact as { option: string; option2?: string },
        classification: event.classification as "A" | "B" | "C",
        available: event.available,
        status_event: event.status_event as
          | "PENDING"
          | "ACTIVE"
          | "BLOCKED"
          | "REJECTED"
          | "CANCELLED"
          | "FINISH",
        reason_rejection: event.reason_rejection,
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: event.packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          benefits: pkg.benefits as string[],
          price: pkg.price,
          priority: pkg.priority,
          max_tickets: pkg.max_tickets || undefined,
          purchased: pkg.purchased,
        })),
        members: event.members.map((member) => ({
          id: member.id,
          name: member.name,
          user_id: member.user_id,
          permission: member.permission as "MANAGER" | "STAFF",
        })),
        comments: event.comments.map((a) => ({
          id: a.id,
          user_id: a.user_id,
          content: a.content,
          user: { name: a.user.name },
          created_at: a.created_at.toISOString(),
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
      console.error("Error fetching events:", error);
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
      let whereClause = {};

      const isMember = await prisma.member.findFirst({
        where: {
          event_id,
          user_id,
        },
      });

      const existUser = await prisma.user.findFirst({
        where: { id: user_id },
      });

      if (user_id && !existUser) {
        return {
          message: "Precisa de fazer login para aceder a este evento.",

          status: 401,
        };
      }

      if (existUser && existUser.role === "ADMIN") {
        whereClause = {
          id: event_id,
        };
      } else if (isMember) {
        whereClause = {
          id: event_id,
          status_event: { not: "CANCELLED" },
        };
      } else {
        whereClause = {
          id: event_id,
          available: true,
          status_event: "ACTIVE",
        };
      }
      const event = await prisma.event.findFirst({
        where: {
          ...whereClause,
        },
        include: {
          packages: true,
          members: true,
          comments: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
      });

      if (!event) {
        return {
          message: "Este evento não foi encontrado ou ainda não está disponível ao público.",

          status: 404,
        };
      }

      const dataResponse: schema.ResponseEvent = {
        id: event.id,
        title: event.title,
        description: event.description,
        date_start: event.date_start.toISOString(),
        date_end: event.date_end ? event.date_end.toISOString() : undefined,
        location: event.location,
        cover_url: event.cover_url || undefined,
        max_guests: event.max_guests || undefined,
        promoter: event.promoter,
        promoter_nif: event.promoter_nif,
        category: event.category,
        duration: event.duration || undefined,
        province: event.province,
        contact: event.contact as { option: string; option2?: string },
        classification: event.classification as "A" | "B" | "C",
        available: event.available,
        status_event: event.status_event as
          | "PENDING"
          | "ACTIVE"
          | "BLOCKED"
          | "REJECTED"
          | "CANCELLED"
          | "FINISH",
        reason_rejection: event.reason_rejection,
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: event.packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          benefits: pkg.benefits as string[],
          price: pkg.price,
          priority: pkg.priority,
          max_tickets: pkg.max_tickets || undefined,
          purchased: pkg.purchased,
        })),
        members: event.members.map((member) => ({
          id: member.id,
          name: member.name,
          user_id: member.user_id,
          permission: member.permission as "MANAGER" | "STAFF",
        })),
        comments: event.comments.map((a) => ({
          id: a.id,
          user_id: a.user_id,
          content: a.content,
          user: { name: a.user.name },
          created_at: a.created_at.toISOString(),
        })),
      };

      return dataResponse;
    } catch {
      return {
        message: "Erro ao buscar evento",
        status: 500,
      };
    }
  }

  async updateEvent(
    event_id: string,
    data: schema.EventUpdate,
    user_id: string,
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

    const canUpdate = await this.checkPermission(user_id, event_id, "MANAGER");
    if (!canUpdate) {
      return {
        message:
          "Não tens permissão para atualizar este evento. Apenas o gestor do evento pode fazê-lo.",
        status: 403,
      };
    }

    const updatedEvent = await prisma.event.update({
      where: { id: event_id },
      data: {
        title: data.title ?? existingEvent.title,
        description: data.description ?? existingEvent.description,
        date_start: data.date_start ? new Date(data.date_start) : existingEvent.date_start,
        date_end: data.date_end ? new Date(data.date_end) : existingEvent.date_end,
        cover_url: data.cover_url ? data.cover_url : existingEvent.cover_url,
        max_guests: data.max_guests ? data.max_guests : existingEvent.max_guests,
        location: data.location ?? existingEvent.location,
        promoter: data.promoter ?? existingEvent.promoter,
        promoter_nif: data.promoter_nif ?? existingEvent.promoter_nif,
        category: data.category ?? existingEvent.category,
        duration: data.duration ?? existingEvent.duration,
        province: data.province ?? existingEvent.province,
        contact: (data.contact as { option: string; option2?: string }) ?? existingEvent.contact,
        classification: data.classification ?? existingEvent.classification,
        status_event: data.status_event ?? existingEvent.status_event,
      },
    });

    const dataResponse: schema.ResponseEvent = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      date_start: updatedEvent.date_start.toISOString(),
      date_end: updatedEvent.date_end ? updatedEvent.date_end.toISOString() : undefined,
      location: updatedEvent.location,
      cover_url: updatedEvent.cover_url || undefined,
      max_guests: updatedEvent.max_guests || undefined,
      promoter: updatedEvent.promoter,
      promoter_nif: updatedEvent.promoter_nif,
      category: updatedEvent.category,
      duration: updatedEvent.duration || undefined,
      province: updatedEvent.province,
      contact: updatedEvent.contact as { option: string; option2?: string },
      classification: updatedEvent.classification as "A" | "B" | "C",
      available: updatedEvent.available,
      status_event: updatedEvent.status_event as
        | "PENDING"
        | "ACTIVE"
        | "BLOCKED"
        | "REJECTED"
        | "CANCELLED"
        | "FINISH",
      reason_rejection: updatedEvent.reason_rejection,
      created_at: updatedEvent.created_at.toISOString(),
      updated_at: updatedEvent.updated_at.toISOString(),
      packages: existingEvent.packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        benefits: pkg.benefits as string[],
        price: pkg.price,
        priority: pkg.priority,
        max_tickets: pkg.max_tickets || undefined,
        purchased: pkg.purchased,
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
    user_id: string,
  ): Promise<{ message: string; status: number }> {
    const canDelete = await this.checkPermission(user_id, event_id, "MANAGER");
    if (!canDelete) {
      return {
        message:
          "Não tens permissão para eliminar este evento. Apenas o gestor do evento pode fazê-lo.",
        status: 403,
      };
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    await prisma.event.update({
      where: { id: event_id },
      data: {
        status_event: "CANCELLED",
        available: false,
      },
    });

    return {
      message: "Evento deletado com sucesso",
      status: 200,
    };
  }

  async addPackageToEvent(
    event_id: string,
    data: schema.PackageCreate,
    user_id: string,
  ): Promise<schema.ResponsePackage | { message: string; status: number }> {
    const canAdd = await this.checkPermission(user_id, event_id, "MANAGER");
    if (!canAdd) {
      return {
        message:
          "Não tens permissão para adicionar pacotes a este evento. Apenas o gestor do evento pode fazê-lo.",
        status: 403,
      };
    }

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

    const existPackageWithSameName = existingEvent.packages.some((pkg) => pkg.name === data.name);
    if (existPackageWithSameName) {
      return {
        message: `Pacote com o mesmo nome ${data.name}, favor alterar o nome do pacote`,
        status: 400,
      };
    }

    const newPackage = await prisma.packages.create({
      data: {
        name: data.name,
        benefits: data.benefits,
        price: data.price,
        priority: data.priority,
        event_id,
        max_tickets: data.max_tickets,
      },
    });

    const dataResponse: schema.ResponsePackage = {
      id: newPackage.id,
      name: newPackage.name,
      benefits: newPackage.benefits as string[],
      price: newPackage.price,
      priority: newPackage.priority,
      max_tickets: newPackage.max_tickets || undefined,
      purchased: 0,
    };

    return dataResponse;
  }

  async editarPackage(
    package_id: string,
    data: schema.PackageCreate,
    user_id: string,
  ): Promise<schema.ResponsePackage | { message: string; status: number }> {
    const existingPackage = await prisma.packages.findUnique({
      where: { id: package_id },
    });

    if (!existingPackage) {
      return {
        message: "Pacote não encontrado",
        status: 404,
      };
    }

    const canEdit = await this.checkPermission(user_id, existingPackage.event_id, "MANAGER");
    if (!canEdit) {
      return {
        message:
          "Não tens permissão para editar pacotes deste evento. Apenas o gestor do evento pode fazê-lo.",
        status: 403,
      };
    }

    const existingPackageWithSameName = await prisma.packages.findFirst({
      where: {
        event_id: existingPackage.event_id,
        name: data.name,
        id: { not: package_id },
      },
    });

    if (existingPackageWithSameName) {
      return {
        message: `Pacote com o mesmo nome ${data.name}, favor alterar o nome do pacote`,
        status: 400,
      };
    }

    const updatedPackage = await prisma.packages.update({
      where: { id: package_id },
      data: {
        name: data.name,
        benefits: data.benefits,
        price: data.price,
        priority: data.priority,
        max_tickets: data.max_tickets,
      },
    });

    const dataResponse: schema.ResponsePackage = {
      id: updatedPackage.id,
      name: updatedPackage.name,
      benefits: updatedPackage.benefits as string[],
      price: updatedPackage.price,
      priority: updatedPackage.priority,
      max_tickets: updatedPackage.max_tickets || undefined,
      purchased: updatedPackage.purchased,
    };

    return dataResponse;
  }

  async listPackagesByEvent(
    event_id: string,
    page = 1,
    per_page = 10,
    search = "",
  ): Promise<
    | {
      data: schema.ResponsePackage[];
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

    const existingEvent = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    let whereClause = {};

    if (search && search !== "undefined") {
      whereClause = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const packages = await prisma.packages.findMany({
      where: {
        ...whereClause,
        event_id,
      },
      skip,
      take: per_page,
      orderBy: {
        created_at: "desc",
      },
    });

    const total = await prisma.packages.count({
      where: {
        ...whereClause,
        event_id,
      },
    });

    const dataResponse: schema.ResponsePackage[] = packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      benefits: pkg.benefits as string[],
      price: pkg.price,
      priority: pkg.priority,
      max_tickets: pkg.max_tickets || undefined,
      purchased: pkg.purchased,
    }));

    return {
      data: dataResponse,
      meta: {
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async getPackageById(
    package_id: string,
  ): Promise<schema.ResponsePackage | { message: string; status: number }> {
    const existingPackage = await prisma.packages.findUnique({
      where: { id: package_id },
    });

    if (!existingPackage) {
      return {
        message: "Pacote não encontrado",
        status: 404,
      };
    }

    const dataResponse: schema.ResponsePackage = {
      id: existingPackage.id,
      name: existingPackage.name,
      benefits: existingPackage.benefits as string[],
      price: existingPackage.price,
      priority: existingPackage.priority,
      max_tickets: existingPackage.max_tickets || undefined,
      purchased: existingPackage.purchased,
    };

    return dataResponse;
  }

  async deletePackage(
    package_id: string,
    user_id: string,
  ): Promise<{ message: string; status: number }> {
    const existingPackage = await prisma.packages.findUnique({
      where: { id: package_id },
    });

    if (!existingPackage) {
      return {
        message: "Pacote não encontrado",
        status: 404,
      };
    }

    const canDelete = await this.checkPermission(user_id, existingPackage.event_id, "MANAGER");
    if (!canDelete) {
      return {
        message:
          "Não tens permissão para eliminar pacotes deste evento. Apenas o gestor do evento pode fazê-lo.",
        status: 403,
      };
    }

    await prisma.$transaction([
      prisma.ticket.deleteMany({ where: { package_id: package_id } }),
      prisma.packages.delete({ where: { id: package_id } }),
    ]);

    return {
      message: "Pacote deletado com sucesso",
      status: 200,
    };
  }

  async addMemberToEvent(
    event_id: string,
    data: schema.AddMemberToEvent,
    user_id: string,
  ): Promise<schema.ResponseMember | { message: string; status: number }> {
    const existingEvent = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    const hasPermission = await this.checkPermission(user_id, event_id, "MANAGER");

    if (!hasPermission) {
      return {
        message:
          "Não tens permissão para adicionar membros neste evento. Apenas o gestor do evento pode fazê-lo.",

        status: 403,
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (!existingUser) {
      return {
        message:
          "Não encontramos nenhuma conta com o email '" +
          data.email +
          "'. Verifique se o email está correto.",

        status: 404,
      };
    }

    const existMember = await prisma.member.findFirst({
      where: {
        event_id,
        user_id: existingUser.id,
      },
    });

    if (existMember) {
      return {
        message: "Este utilizador já faz parte da equipa do evento.",

        status: 400,
      };
    }

    const newMember = await prisma.member.create({
      data: {
        name: existingUser.name,
        user_id: existingUser.id,
        event_id,
        permission: data.permission,
      },
    });

    const dataResponse: schema.ResponseMember = {
      id: newMember.id,
      name: newMember.name,
      user_id: newMember.user_id,
      event_id: newMember.event_id,
      permission: newMember.permission as "MANAGER" | "STAFF",
    };

    // Notifica o novo membro que foi adicionado ao evento
    await notify(
      existingUser.id,
      `Foste adicionado como membro do evento "${existingEvent.title}".`,
      {
        type: "member_added",
        event_id,
        permission: data.permission,
      },
    );

    return dataResponse;
  }

  async removeMemberFromEvent(
    event_id: string,
    user_id: string,
    authed_id: string,
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

    const hasPermission = await this.checkPermission(authed_id, event_id, "MANAGER");

    if (!hasPermission) {
      return {
        message:
          "Não tens permissão para remover membros neste evento. Apenas o gestor do evento pode fazê-lo.",

        status: 403,
      };
    }

    const existingMember = await prisma.member.findFirst({
      where: {
        event_id: event_id,
        user_id: user_id,
      },
    });

    if (!existingMember) {
      return {
        message: "Este utilizador não é membro deste evento.",

        status: 404,
      };
    }

    await prisma.member.delete({
      where: { id: existingMember.id },
    });

    // Notifica o membro removido
    await notify(
      existingMember.user_id,
      `A sua participação no evento "${existingEvent.title}" foi removida.`,
      {
        type: "member_removed",
        event_id,
      },
    );

    return {
      message: "Membro removido com sucesso",
      status: 200,
    };
  }

  async listMembersByEvent(
    event_id: string,
    user_id: string,
    page: number = 1,
    per_page: number = 10,
  ): Promise<schema.ResponseMemberList | { message: string; status: number }> {
    const canView = await this.checkPermission(user_id, event_id, "STAFF");
    if (!canView) {
      return {
        message: "Não tens permissão para ver a lista de membros deste evento.",
        status: 403,
      };
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: { event_id },
        skip: (page - 1) * per_page,
        take: per_page,
      }),
      prisma.member.count({
        where: { event_id },
      }),
    ]);

    return {
      data: members.map((member) => ({
        id: member.id,
        name: member.name,
        user_id: member.user_id,
        event_id: member.event_id,
        permission: member.permission as "MANAGER" | "STAFF",
      })),
      meta: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async getMemberById(
    member_id: string,
    user_id: string,
  ): Promise<schema.ResponseMember | { message: string; status: number }> {
    const member = await prisma.member.findUnique({
      where: { id: member_id },
    });

    if (!member) {
      return {
        message: "Membro não encontrado",
        status: 404,
      };
    }

    const canView = await this.checkPermission(user_id, member.event_id, "STAFF");
    if (!canView) {
      return {
        message: "Não tens permissão para ver detalhes deste membro.",
        status: 403,
      };
    }

    return {
      id: member.id,
      name: member.name,
      user_id: member.user_id,
      event_id: member.event_id,
      permission: member.permission as "MANAGER" | "STAFF",
    };
  }

  async addImageToEvent(
    event_id: string,
    data: schema.CreateImage,
    user_id: string,
  ): Promise<schema.ResponseImage | { message: string; status: number }> {
    const canAdd = await this.checkPermission(user_id, event_id, "MANAGER");
    if (!canAdd) {
      return {
        message:
          "Não tens permissão para adicionar imagens a este evento. Apenas o gestor do evento pode fazê-lo.",
        status: 403,
      };
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    if (isImageByExtension(data.url) == false) {
      return {
        message:
          "O formato da URL da imagem não é válido. Use um link que termine em .jpg, .jpeg, .png, .webp ou .gif.",

        status: 400,
      };
    }

    const newImage = await prisma.image.create({
      data: {
        url: data.url,
        priority: data.priority || 0,
        event_id,
      },
    });

    const dataResponse: schema.ResponseImage = {
      id: newImage.id,
      url: newImage.url,
      priority: newImage.priority,
    };

    return dataResponse;
  }

  async listImagesByEvent(
    event_id: string,
    page: number = 1,
    per_page: number = 10,
  ): Promise<
    { data: schema.ResponseImage[]; meta: schema.Meta } | { message: string; status: number }
  > {
    const existingEvent = await prisma.event.findFirst({
      where: { id: event_id },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    const images = await prisma.image.findMany({
      where: { event_id },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    const coutImages = await prisma.image.count({
      where: { event_id },
    });
    const formatImages = images.map((img) => ({
      id: img.id,
      url: img.url,
      priority: img.priority,
    }));

    return {
      data: formatImages,
      meta: {
        page,
        per_page,
        total: formatImages.length,
        total_pages: Math.ceil(coutImages / per_page),
      },
    };
  }

  async getImageById(
    image_id: string,
  ): Promise<schema.ResponseImage | { message: string; status: number }> {
    const existingImage = await prisma.image.findUnique({
      where: { id: image_id },
    });

    if (!existingImage) {
      return {
        message: "Imagem não encontrada",
        status: 404,
      };
    }

    const dataResponse: schema.ResponseImage = {
      id: existingImage.id,
      url: existingImage.url,
      priority: existingImage.priority,
    };

    return dataResponse;
  }

  async updateImage(
    image_id: string,
    data: schema.CreateImage,
    user_id: string,
  ): Promise<schema.ResponseImage | { message: string; status: number }> {
    const existingImage = await prisma.image.findUnique({
      where: { id: image_id },
    });

    if (!existingImage) {
      return {
        message: "Imagem não encontrada",
        status: 404,
      };
    }

    const canUpdate = await this.checkPermission(user_id, existingImage.event_id, "MANAGER");
    if (!canUpdate) {
      return {
        message:
          "Não tens permissão para atualizar imagens deste evento. Apenas o gestor do evento pode fazê-lo.",
        status: 403,
      };
    }

    if (data.url && isImageByExtension(data.url) == false) {
      return {
        message:
          "O formato da URL da imagem não é válido. Use um link que termine em .jpg, .jpeg, .png, .webp ou .gif.",

        status: 400,
      };
    }

    const updatedImage = await prisma.image.update({
      where: { id: image_id },
      data: {
        url: data.url ?? existingImage.url,
        priority: data.priority ?? existingImage.priority,
      },
    });

    const dataResponse: schema.ResponseImage = {
      id: updatedImage.id,
      url: updatedImage.url,
      priority: updatedImage.priority,
    };

    return dataResponse;
  }

  async deleteImage(
    image_id: string,
    user_id: string,
  ): Promise<{ message: string; status: number }> {
    const existingImage = await prisma.image.findUnique({
      where: { id: image_id },
    });

    if (!existingImage) {
      return {
        message: "Imagem não encontrada",
        status: 404,
      };
    }

    const canDelete = await this.checkPermission(user_id, existingImage.event_id, "MANAGER");
    if (!canDelete) {
      return {
        message:
          "Não tens permissão para eliminar imagens deste evento. Apenas o gestor do evento pode fazê-lo.",
        status: 403,
      };
    }

    await prisma.image.delete({
      where: { id: image_id },
    });

    return {
      message: "Imagem deletada com sucesso",
      status: 200,
    };
  }

  async readCode(code: string, user_id: string): Promise<{ message: string; status: number }> {
    if (!code) {
      return {
        message: "Código é obrigatório",
        status: 400,
      };
    }

    const invitation_id = decryptDefault(code);

    if (!invitation_id || !validate(invitation_id)) {
      return {
        message:
          "O código de entrada lido é inválido. Por favor, verifique o QR Code e tente novamente.",

        status: 400,
      };
    }

    const existingTicket = await prisma.ticket.findFirst({
      where: { id: invitation_id },
      include: { event: true },
    });

    if (!existingTicket) {
      return {
        message: "Este convite não existe",
        status: 404,
      };
    }

    if (existingTicket.event.status_event === "BLOCKED") {
      return {
        message: "Este evento está bloqueado. A validação de convites está suspensa.",
        status: 403,
      };
    }

    const canScan = await this.checkPermission(user_id, existingTicket.event_id, "STAFF");
    if (!canScan) {
      return {
        message:
          "Não tens permissão para validar entradas neste evento. Apenas membros da equipa podem fazê-lo.",
        status: 403,
      };
    }

    if (existingTicket.is_used) {
      return {
        message: "Este convite já foi utilizado para entrada no evento.",

        status: 400,
      };
    }

    if (!existingTicket.is_paid) {
      return {
        message: "Este convite ainda não foi pago e não pode ser utilizado para entrada.",

        status: 400,
      };
    }

    await prisma.ticket.update({
      where: { id: invitation_id },
      data: {
        is_used: true,
      },
    });

    return {
      message: "Convite validado com sucesso",
      status: 200,
    };
  }

  async historyTicketsByEvent(
    event_id: string,
    user_id: string,
    page: number = 1,
    per_page: number = 10,
    is_paid?: boolean,
    is_used?: boolean,
  ): Promise<
    | {
      data: schemaGuest.ResponseTicket[];
      meta: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
      };
    }
    | { message: string; status: number }
  > {
    const canView = await this.checkPermission(user_id, event_id, "STAFF");
    if (!canView) {
      return {
        message: "Não tens permissão para ver o histórico de entradas deste evento.",
        status: 403,
      };
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      return {
        message: "Evento não encontrado",
        status: 404,
      };
    }

    const tickets = await prisma.ticket.findMany({
      where: { event_id, is_paid: is_paid ?? true, is_used: is_used ?? false },
      include: {
        package: true,
        user: true,
      },
      skip: (page - 1) * per_page,
      take: per_page,
      orderBy: {
        created_at: "desc",
      },
    });

    const totalTickets = await prisma.ticket.count({
      where: { event_id, is_paid: is_paid ?? true, is_used: is_used ?? false },
    });
    const dataResponse: schemaGuest.ResponseTicket[] = tickets.map((inv) => ({
      ticket_id: inv.id,
      event_id: inv.event_id,
      package_id: inv.package_id,
      name: inv.name,
      is_paid: inv.is_paid,
      is_used: inv.is_used,
      user_id: inv.user_id,
      package_color: inv.package_color || undefined,
      package_name: inv.package_name,
      qr_code: inv.qr_code || undefined,
      created_at: inv.created_at?.toISOString() ?? undefined,
      updated_at: inv.updated_at?.toISOString() ?? undefined,
      user: {
        id: inv.user.id,
        name: inv.user.name,
        email: inv.user.email,
        phone: inv.user.phone ?? "",
      },
    }));

    return {
      data: dataResponse,
      meta: {
        page,
        per_page,
        total: totalTickets,
        total_pages: Math.ceil(totalTickets / per_page),
      },
    };
  }

  async blockEvent(
    event_id: string,
    reason: string,
    user_id: string,
  ): Promise<{ message: string; status: number }> {
    try {
      const user = await prisma.user.findUnique({ where: { id: user_id } });
      if (!user || user.role !== "ADMIN") {
        return { message: "Não autorizado", status: 401 };
      }

      const event = await prisma.event.findUnique({
        where: { id: event_id },
        include: { members: true },
      });

      if (!event) {
        return { message: "Evento não encontrado", status: 404 };
      }

      await prisma.event.update({
        where: { id: event_id },
        data: {
          status_event: "BLOCKED",
          reason_rejection: reason,
          available: false,
        },
      });

      // Notificar membros do evento
      for (const member of event.members) {
        await notify(
          member.user_id,
          `O evento "${event.title}" foi bloqueado. Motivo: ${reason}`,
          { event_id, type: "event_blocked" },
        );
      }

      return { message: "Evento bloqueado com sucesso", status: 200 };
    } catch (error) {
      console.error(error);
      return { message: "Erro ao bloquear evento", status: 500 };
    }
  }

  async unblockEvent(
    event_id: string,
    user_id: string,
  ): Promise<{ message: string; status: number }> {
    try {
      const user = await prisma.user.findUnique({ where: { id: user_id } });
      if (!user || user.role !== "ADMIN") {
        return { message: "Não autorizado", status: 401 };
      }

      const event = await prisma.event.findUnique({
        where: { id: event_id },
        include: { members: true },
      });

      if (!event) {
        return { message: "Evento não encontrado", status: 404 };
      }

      await prisma.event.update({
        where: { id: event_id },
        data: {
          status_event: "ACTIVE",
          available: true,
          reason_rejection: null,
        },
      });

      // Notificar membros do evento
      for (const member of event.members) {
        await notify(member.user_id, `O evento "${event.title}" foi desbloqueado e está ativo.`, {
          event_id,
          type: "event_unblocked",
        });
      }

      return { message: "Evento desbloqueado com sucesso", status: 200 };
    } catch (error) {
      console.error(error);
      return { message: "Erro ao desbloquear evento", status: 500 };
    }
  }
}
