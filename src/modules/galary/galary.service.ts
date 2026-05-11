import prisma from "../../database/prisma";
import * as schema from "./galary.schema";
import { isImageByExtension } from "../../utils/verify_image";
import { Meta } from "../event/event.schema";

export class GalaryService {
  constructor() {}

  async createGalaryItem(
    data: schema.CreateGalary,
  ): Promise<schema.ResponseGalary | { message: string; status: number }> {
    if (isImageByExtension(data.url) == false) {
      return {
        message:
          "O formato da URL da imagem não é válido. Use um link que termine em .jpg, .jpeg, .png, .webp ou .gif.",
        status: 400,
      };
    }

    const newGalaryItem = await prisma.galary.create({
      data: {
        url: data.url,
        priority: data.priority || 0,
      },
    });

    return {
      id: newGalaryItem.id,
      url: newGalaryItem.url,
      priority: newGalaryItem.priority,
      created_at: newGalaryItem.created_at.toISOString(),
      updated_at: newGalaryItem.updated_at.toISOString(),
    };
  }

  async listGalaryItems(
    page: number = 1,
    per_page: number = 10,
  ): Promise<{ data: schema.ResponseGalary[]; meta: Meta }> {
    const [items, total] = await Promise.all([
      prisma.galary.findMany({
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { priority: "desc" },
      }),
      prisma.galary.count(),
    ]);

    const dataResponse: schema.ResponseGalary[] = items.map((item) => ({
      id: item.id,
      url: item.url,
      priority: item.priority,
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
    }));

    return {
      data: dataResponse,
      meta: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async getGalaryItemById(
    id: string,
  ): Promise<schema.ResponseGalary | { message: string; status: number }> {
    const item = await prisma.galary.findUnique({
      where: { id },
    });

    if (!item) {
      return {
        message: "Item da galeria não encontrado",
        status: 404,
      };
    }

    return {
      id: item.id,
      url: item.url,
      priority: item.priority,
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
    };
  }

  async updateGalaryItem(
    id: string,
    data: schema.UpdateGalary,
  ): Promise<schema.ResponseGalary | { message: string; status: number }> {
    const existingItem = await prisma.galary.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return {
        message: "Item da galeria não encontrado",
        status: 404,
      };
    }

    if (data.url && isImageByExtension(data.url) == false) {
      return {
        message:
          "O formato da URL da imagem não é válido. Use um link que termine em .jpg, .jpeg, .png, .webp ou .gif.",
        status: 400,
      };
    }

    const updatedItem = await prisma.galary.update({
      where: { id },
      data: {
        url: data.url ?? existingItem.url,
        priority: data.priority ?? existingItem.priority,
      },
    });

    return {
      id: updatedItem.id,
      url: updatedItem.url,
      priority: updatedItem.priority,
      created_at: updatedItem.created_at.toISOString(),
      updated_at: updatedItem.updated_at.toISOString(),
    };
  }

  async deleteGalaryItem(id: string): Promise<{ message: string; status: number }> {
    const existingItem = await prisma.galary.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return {
        message: "Item da galeria não encontrado",
        status: 404,
      };
    }

    await prisma.galary.delete({
      where: { id },
    });

    return {
      message: "Item da galeria deletado com sucesso",
      status: 200,
    };
  }
}
