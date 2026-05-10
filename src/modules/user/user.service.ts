import { role } from "@prisma/client";
import prisma from "../../database/prisma";
import * as schema from "./user.schema";
import * as bcrypt from "bcrypt";

export class UserService {
  constructor() {}

  async createUser(data: schema.UserCreate) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (existingUser) {
      return {
        message: "Email ou telefone já cadastrado",
        status: 400,
      };
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: await bcrypt.hash(data.password, 10),
      },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as role,
      verified: user.verified,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    } as schema.ResponseUser;
  }

  async getAllusers(
    page = 1,
    per_page = 10,
    search: string = "",
  ): Promise<[schema.ResponseUser[], number]> {
    const skip = (page - 1) * per_page;
    let whereClause = {};

    if (search != "undefined" && search !== "") {
      whereClause = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: per_page,
    });

    const totalUsers = await prisma.user.count({ where: whereClause });

    return [
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as role,
        verified: user.verified,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      })) as schema.ResponseUser[],
      totalUsers as number,
    ];
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        message: "Usuário não encontrado",
        status: 404,
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as role,
      verified: user.verified,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    } as schema.ResponseUser;
  }

  async updateUser(id: string, data: schema.UserUpdate) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        message: "Usuário não encontrado",
        status: 404,
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name ?? user.name,
        email: data.email ?? user.email,
        phone: data.phone ?? user.phone,
      },
    });

    if (data.password) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(data.password, 10) },
      });
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role as role,
      verified: updatedUser.verified,
      created_at: updatedUser.created_at.toISOString(),
      updated_at: updatedUser.updated_at.toISOString(),
    } as schema.ResponseUser;
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        message: "Usuário não encontrado",
        status: 404,
      };
    }

    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { user_id: id } }),
      prisma.ticket.deleteMany({ where: { user_id: id } }),
      prisma.comment.deleteMany({ where: { user_id: id } }),
      prisma.member.deleteMany({ where: { user_id: id } }),
      prisma.event.updateMany({
        where: { responsible_id: id },
        data: { responsible_id: null },
      }),
      prisma.user.delete({ where: { id } }),
    ]);

    return {
      message: "Usuário deletado com sucesso",
      status: 200,
    } as schema.ResponseBad;
  }
}
