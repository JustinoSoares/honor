import prisma from "../../database/prisma";
import { validate } from "uuid";
import * as schema from "./event.schema";
import * as schemaGuest from "../ticket/ticket.schema";
import { isImageByExtension } from "../../utils/verify_image";
import { decryptDefault } from "../../utils/crypt";

export class EventService {
  constructor() {}

  async createEvent(
    data: schema.EventCreate,
    user_id: string,
  ): Promise<schema.ResponseEvent | { message: string; status: number }> {
    try {
      if (!user_id || !validate(user_id))
        return {
          message: "Usuário não autenticado",
          status: 401,
        };

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

      const packages = data.packages?.map((pkg) => ({
        name: pkg.name,
        benefits: pkg.benefits as string[],
        price: pkg.price,
        priority: pkg.priority,
      }));

      await prisma.packages.createMany({
        data:
          packages?.map((pkg) => ({
            name: pkg.name,
            benefits: pkg.benefits as string[],
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
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: getPackages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          benefits: pkg.benefits as string[],
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

  async verifyEvent(
    event_id: string,
    user_id: string,
    available: boolean,
  ): Promise<{ message: string; status: number }> {
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
      },
    });

    return {
      message: "Evento atualizado com sucesso",
      status: 200,
    };
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
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: event.packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          benefits: pkg.benefits as string[],
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
    } catch {
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
        created_at: event.created_at.toISOString(),
        updated_at: event.updated_at.toISOString(),
        packages: event.packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          benefits: pkg.benefits as string[],
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
      created_at: updatedEvent.created_at.toISOString(),
      updated_at: updatedEvent.updated_at.toISOString(),
      packages: existingEvent.packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        benefits: pkg.benefits as string[],
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

  async deleteEvent(event_id: string): Promise<{ message: string; status: number }> {
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

  async addPackageToEvent(
    event_id: string,
    data: schema.PackageCreate,
  ): Promise<schema.ResponsePackage | { message: string; status: number }> {
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

    const newPackage = await prisma.packages.create({
      data: {
        name: data.name,
        benefits: data.benefits,
        price: data.price,
        priority: data.priority,
        event_id,
      },
    });

    const dataResponse: schema.ResponsePackage = {
      id: newPackage.id,
      name: newPackage.name,
      benefits: newPackage.benefits as string[],
      price: newPackage.price,
      priority: newPackage.priority,
    };

    return dataResponse;
  }

  async editarPackage(
    package_id: string,
    data: schema.PackageCreate,
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

    const updatedPackage = await prisma.packages.update({
      where: { id: package_id },
      data: {
        name: data.name,
        benefits: data.benefits,
        price: data.price,
        priority: data.priority,
      },
    });

    const dataResponse: schema.ResponsePackage = {
      id: updatedPackage.id,
      name: updatedPackage.name,
      benefits: updatedPackage.benefits as string[],
      price: updatedPackage.price,
      priority: updatedPackage.priority,
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
    };

    return dataResponse;
  }

  async deletePackage(package_id: string): Promise<{ message: string; status: number }> {
    const existingPackage = await prisma.packages.findUnique({
      where: { id: package_id },
    });

    if (!existingPackage) {
      return {
        message: "Pacote não encontrado",
        status: 404,
      };
    }

    await prisma.packages.delete({
      where: { id: package_id },
    });

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

    const hasPermission = await prisma.member.findFirst({
      where: {
        event_id,
        user_id: user_id,
        permission: "MANAGER",
      },
    });

    if (!hasPermission) {
      return {
        message: "Usuário não tem permissão para adicionar membros",
        status: 403,
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (!existingUser) {
      return {
        message: "Usuário com esse email não encontrado",
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
        message: "Usuário já é membro do evento",
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

    const hasPermission = await prisma.member.findFirst({
      where: {
        event_id,
        user_id: authed_id,
        permission: "MANAGER",
      },
    });

    if (!hasPermission) {
      return {
        message: "Usuário não tem permissão para remover membros",
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
        message: "Membro não encontrado",
        status: 404,
      };
    }

    await prisma.member.delete({
      where: { id: existingMember.id },
    });

    return {
      message: "Membro removido com sucesso",
      status: 200,
    };
  }

  async addImageToEvent(
    event_id: string,
    data: schema.CreateImage,
  ): Promise<schema.ResponseImage | { message: string; status: number }> {
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
        message: "URL deve ser de uma imagem válida",
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

    if (data.url && isImageByExtension(data.url) == false) {
      return {
        message: "URL deve ser de uma imagem válida",
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

  async deleteImage(image_id: string): Promise<{ message: string; status: number }> {
    const existingImage = await prisma.image.findUnique({
      where: { id: image_id },
    });

    if (!existingImage) {
      return {
        message: "Imagem não encontrada",
        status: 404,
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

  async readCode(code: string): Promise<{ message: string; status: number }> {
    if (!code) {
      return {
        message: "Código é obrigatório",
        status: 400,
      };
    }

    const invitation_id = decryptDefault(code);

    if (!invitation_id || !validate(invitation_id)) {
      return {
        message: "Convite inválido",
        status: 400,
      };
    }

    const existingTicket = await prisma.ticket.findFirst({
      where: { id: invitation_id },
    });

    if (!existingTicket) {
      return {
        message: "Este convite não existe",
        status: 404,
      };
    }

    if (existingTicket.is_used) {
      return {
        message: "Este convite já foi utilizado",
        status: 400,
      };
    }

    if (!existingTicket.is_paid) {
      return {
        message: "Convite inválido, valide antes de processeguir",
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
}
