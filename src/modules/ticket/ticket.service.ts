import { array, promise } from "zod";
import prisma from "../../database/prisma";
import { encryptDefault } from "../../utils/crypt";
import { generateUserQRCode } from "../../utils/generate_qr";
import * as schema from "./ticket.schema";
import { notify } from "../../utils/notify";


export class TicketService {
  async createTicket(
    data: schema.TicketArray,
    user_id: string,
  ): Promise<{ data: schema.ResponseTicket[] } | { status: number; message: string }> {
    if (Array.isArray(data) && data.length === 0) {
      return {
        status: 400,
        message: "Pelo menos um convite deve ser criado",
      };
    }

    const existUser = await prisma.user.findFirst({
      where: { id: user_id },
    });

    if (!existUser) {
      return {
        status: 404,
        message: "Usuário não encontrado",
      };
    }

    const verifyEvent = await Promise.all(
      data.map(async (inv) => {
        const event = await prisma.event.findFirst({
          where: { id: inv.event_id, available: true },
        });
        return event;
      }),
    );

    if (verifyEvent.includes(null)) {
      return {
        status: 400,
        message: "Evento não encontrado ou não disponível para adição de convites",
      };
    }

    

    const existEvent = await prisma.event.findMany({
      where: { id: data[0].event_id },
    });

    if (!existEvent) {
      return {
        status: 404,
        message: "Evento não encontrado",
      };
    }

  const verifyPackage = await Promise.all(
      data.map(async (inv) => {
        const packageEach = await prisma.packages.findFirst({
          where: { id: inv.package_id, event_id: inv.event_id },
        });
        return packageEach;
      }),
    );

    if (verifyPackage.includes(null)) {
      return {
        status: 400,
        message: "Pacote não encontrado ou pertence a este evento",
      };
    }

    const createTickets = await Promise.all(
      data.map(async (inv) => {
        const packageData = await prisma.packages.findUnique({
          where: { id: inv.package_id, event_id: inv.event_id },
        });

        if (!packageData) {
          return {
            status: 400,
            message: `Pacote não encontrado para este evento`,
          };
        }

        const ticket = await prisma.ticket.create({
          data: {
            package_id: inv.package_id,
            user_id: user_id,
            name: inv.name,
            event_id: inv.event_id,
            package_name: packageData.name,
            package_color: packageData.default_color,
          },
        });
        const qrCodeData = await generateUserQRCode(encryptDefault(ticket.id));

        if (!qrCodeData) {
          return {
            status: 500,
            message: "Erro ao gerar QR Code para o convite",
          };
        }

        const updatedTicket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            qr_code: qrCodeData,
          },
        });

        return {
          event_id: updatedTicket.event_id,
          package_id: updatedTicket.package_id,
          name: updatedTicket.name,
          is_paid: updatedTicket.is_paid,
          is_used: updatedTicket.is_used,
          package_name: updatedTicket.package_name,
          package_color: updatedTicket.package_color,
          user_id: updatedTicket.user_id,
          created_at: updatedTicket.created_at,
          updated_at: updatedTicket.updated_at,
          qr_code: updatedTicket.qr_code,
        };
      }),
    );

    if (createTickets.some((ticket) => "message" in ticket && ticket.status !== 201)) {
      const errorTicket = createTickets.find((ticket) => "message" in ticket && ticket.status !== 201);
      return {
        status: errorTicket?.status || 500,
        message: errorTicket?.message || "Erro ao criar convites",
      };
    }

    const formatTicket = createTickets.map((inv) => ({
      event_id: inv.event_id,
      package_id: inv.package_id,
      name: inv.name,
      is_paid: inv.is_paid,
      is_used: inv.is_used,
      package_name: inv.package_name,
      package_color: inv.package_color,
      user_id: inv.user_id,
      created_at: inv.created_at ? inv.created_at.toISOString() : undefined,
      updated_at: inv.updated_at ? inv.updated_at.toISOString() : undefined,
      qr_code: inv.qr_code,
      user: {
        id: existUser.id,
        name: existUser.name,
        email: existUser.email,
        phone: existUser.phone,
      },
    }));

    // Notifica o utilizador que os tickets foram criados
    const eventTitle = verifyEvent[0]?.title ?? "evento";
    await notify(user_id, `${formatTicket.length} ticket(s) para o evento "${eventTitle}" criado(s) com sucesso.`, {
      type: "ticket_created",
      event_id: data[0].event_id,
      count: formatTicket.length,
    });

    return {
      data: formatTicket,
    } as { data: schema.ResponseTicket[] };
  }

  async getTicketByEventId(
    event_id: string,
    page: number,
    per_page: number,
    search?: string,
  ): Promise<
    | {
        data: schema.ResponseTicket[];
        total: number;
        page: number;
        per_page: number;
      }
    | { status: number; message: string }
  > {
    if (!event_id) {
      return {
        status: 400,
        message: "O ID do evento é obrigatório",
      };
    }
    const skip = (page - 1) * per_page;

    const whereClause = {};
    if (search && search.trim() !== "undefined") {
      Object.assign(whereClause, {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: event_id },
      include: {
        tickets: {
          where: whereClause,
          skip,
          take: per_page,
          include: {
            user: true,
          },
        },
      },
    });

    const ticketResponse =
      user?.tickets.map((ticket) => ({
        event_id: ticket.event_id,
        package_id: ticket.package_id,
        name: ticket.name,
        is_paid: ticket.is_paid,
        is_used: ticket.is_used,
        package_name: ticket.package_name,
        package_color: ticket.package_color,
        user_id: ticket.user_id,
        created_at: ticket.created_at ? ticket.created_at.toISOString() : undefined,
        updated_at: ticket.updated_at ? ticket.updated_at.toISOString() : undefined,
        qr_code: ticket.qr_code,
        user: {
          id: ticket.user.id,
          name: ticket.user.name,
          email: ticket.user.email,
          phone: ticket.user.phone,
        },
      })) || [];

    const totalGuests = await prisma.guest.count({
      where: { event_id },
    });
    return {
      data: ticketResponse,
      total: totalGuests,
      page,
      per_page,
    } as {
      data: schema.ResponseTicket[];
      total: number;
      page: number;
      per_page: number;
    };
  }

  async getTicketsByUserId(
    user_id: string,
    page: number,
    per_page: number,
  ): Promise<
    | { data: schema.ResponseTicket[]; meta: { total: number; page: number; per_page: number } }
    | { status: number; message: string }
  > {
    const tickets = await prisma.ticket.findMany({
      where: { user_id },
      include: {
        user: true,
      },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    const data = tickets.map((ticket) => ({
      event_id: ticket.event_id,
      package_id: ticket.package_id,
      name: ticket.name,
      is_paid: ticket.is_paid,
      is_used: ticket.is_used,
      package_name: ticket.package_name,
      package_color: ticket.package_color,
      user_id: ticket.user_id,
      created_at: ticket.created_at ? ticket.created_at.toISOString() : undefined,
      updated_at: ticket.updated_at ? ticket.updated_at.toISOString() : undefined,
      qr_code: ticket.qr_code,
      user: {
        id: ticket.user.id,
        name: ticket.user.name,
        email: ticket.user.email,
        phone: ticket.user.phone,
      },
    })) as schema.ResponseTicket[];

    return {
      data,
      meta: {
        total: data.length,
        page,
        per_page,
      },
    } as { data: schema.ResponseTicket[]; meta: { total: number; page: number; per_page: number } };
  }

  async getTicketById(
    ticket_id: string,
  ): Promise<schema.ResponseTicket | { status: number; message: string } | null> {
    if (!ticket_id) {
      return {
        status: 400,
        message: "O ID do ticket é obrigatório",
      };
    }

    const tickets = await prisma.ticket.findFirst({
      where: { id: ticket_id },
      include: {
        user: true,
      },
    });

    if (!tickets) {
      return {
        status: 404,
        message: "Ticket não encontrado",
      };
    }

    return {
      event_id: tickets.event_id,
      package_id: tickets.package_id,
      name: tickets.name,
      is_paid: tickets.is_paid,
      is_used: tickets.is_used,
      package_name: tickets.package_name,
      package_color: tickets.package_color,
      user_id: tickets.user_id,
      created_at: tickets.created_at ? tickets.created_at.toISOString() : undefined,
      updated_at: tickets.updated_at ? tickets.updated_at.toISOString() : undefined,
      qr_code: tickets.qr_code,
      user: {
        id: tickets.user.id,
        name: tickets.user.name,
        email: tickets.user.email,
        phone: tickets.user.phone,
      },
    } as schema.ResponseTicket;
  }

  async deleteTicket(ticket_id: string): Promise<{ status: number; message: string }> {
    if (!ticket_id) {
      return {
        status: 400,
        message: "O ID do ticket é obrigatório",
      };
    }
    await prisma.ticket.delete({
      where: { id: ticket_id },
    });
    return {
      status: 200,
      message: "Ticket deletado com sucesso",
    };
  }
}
