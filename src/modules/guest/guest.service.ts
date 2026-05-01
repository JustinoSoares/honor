import prisma from "../../database/prisma";
import { generateUserQRCode } from "../../utils/generate_qr";
import * as schema from "./guest.schema";

const baseUrl = process.env.URL_BASE_LINK || "http://localhost:3000/guest";
export class GuestService {
  async createGuest(
    data: schema.CreateGuest,
  ): Promise<schema.ResponseGuest | { status: number; message: string }> {
    if (!data.invitation) {
      return {
        status: 400,
        message: "Pelo menos um convite deve ser criado",
      };
    }

    const existPackages = await prisma.packages.findMany({
      where: {
        id: {
          in: data.invitation.map((inv) => inv.package_id),
        },
      },
    });

    if (existPackages.length !== data.invitation.length) {
      return {
        status: 400,
        message: "Verifique se os pacotes existem e pertencem ao evento",
      };
    }

    const newGuest = await prisma.guest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        event_id: data.event_id,
        debt: 0,
      },
    });

    const createInvitations = await Promise.all(
      data.invitation.map(async (inv) => {
        const packageData = await prisma.packages.findUnique({
          where: { id: inv.package_id },
        });

        if (!packageData) {
          return {
            status: 400,
            message: `Pacote com ID ${inv.package_id} não encontrado`,
          };
        }

        const invitation = await prisma.invitation.create({
          data: {
            package_id: inv.package_id,
            guest_id: newGuest.id,
            name: inv.name,
            event_id: data.event_id,
            package_name: packageData.name,
            package_color: packageData.default_color,
          },
        });

        const updatedInvitation = await prisma.invitation.update({
          where: { id: invitation.id },
          data: {
            qr_code: await generateUserQRCode(invitation.id),
          },
        });

        return {
          event_id: updatedInvitation.event_id,
          package_id: updatedInvitation.package_id,
          name: updatedInvitation.name,
          is_paid: updatedInvitation.is_paid,
          is_used: updatedInvitation.is_used,
          package_name: updatedInvitation.package_name,
          package_color: updatedInvitation.package_color,
          guest_id: updatedInvitation.guest_id,
          created_at: updatedInvitation.created_at,
          updated_at: updatedInvitation.updated_at,
          qr_code: updatedInvitation.qr_code,
        };
      }),
    );

    const formatInvitation = createInvitations.map((inv) => ({
      event_id: inv.event_id,
      package_id: inv.package_id,
      name: inv.name,
      is_paid: inv.is_paid,
      is_used: inv.is_used,
      package_name: inv.package_name,
      package_color: inv.package_color,
      guest_id: inv.guest_id,
      created_at: inv.created_at,
      updated_at: inv.updated_at,
      qr_code: inv.qr_code,
    }));

    return {
      id: newGuest.id,
      name: newGuest.name,
      email: newGuest.email,
      phone: newGuest.phone,
      status: newGuest.status as schema.ResponseGuest["status"],
      link: `${baseUrl}/${newGuest.id}`,
      debt: newGuest.debt,
      event_id: newGuest.event_id,
      invitation: formatInvitation,
    } as schema.ResponseGuest;
  }

  async getGuestsByEventId(
    event_id: string,
    page: number,
    per_page: number,
  ): Promise<
    | {
        data: schema.ResponseGuest[];
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
    const guests = await prisma.guest.findMany({
      where: { event_id },
      include: {
        invitations: {
          include: {
            package: true,
          },
        },
      },
      skip,
      take: per_page,
    });

    const guestResponse = guests.map((guest) => ({
      ...guest,
      invitations: guest.invitations.map((inv) => ({
        ...inv,
        package: inv.package,
      })),
    }));
    const totalGuests = await prisma.guest.count({
      where: { event_id },
    });
    return {
      data: guestResponse,
      total: totalGuests,
      page,
      per_page,
    };
  }

  async getGuestById(
    guest_id: string,
  ): Promise<
    schema.ResponseGuest | { status: number; message: string } | null
  > {
    if (!guest_id) {
      return {
        status: 400,
        message: "O ID do convidado é obrigatório",
      };
    }
    const guest = await prisma.guest.findUnique({
      where: { id: guest_id },
      include: {
        invitations: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!guest) {
      return {
        status: 404,
        message: "Convidado não encontrado",
      };
    }

    return {
      ...guest,
      invitations: guest.invitations.map((inv) => ({
        ...inv,
        package: inv.package,
      })),
    } as schema.ResponseGuest;
  }

  async deleteGuest(
    guest_id: string,
  ): Promise<{ status: number; message: string }> {
    if (!guest_id) {
      return {
        status: 400,
        message: "O ID do convidado é obrigatório",
      };
    }
    await prisma.guest.delete({
      where: { id: guest_id },
    });
    return {
      status: 200,
      message: "Convidado deletado com sucesso",
    };
  }
}
