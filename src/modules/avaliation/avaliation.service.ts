import prisma from "../../database/prisma";
import { validate } from "uuid";
import * as schema from "./avaliation.schema";

export class AvaliationService {
  async createAvaliation(
    data: schema.CreateAvaliation,
    user_id: string,
  ): Promise<schema.ResponseAvaliation | { message: string; status: number }> {
    try {
      if (!user_id || !validate(user_id)) {
        return { message: "Usuário não autenticado", status: 401 };
      }

      const existEvent = await prisma.event.findUnique({
        where: { id: data.event_id },
      });

      if (!existEvent) {
        return { message: "Evento não encontrado", status: 404 };
      }

      // Opcional: Verificar se o usuário já avaliou o evento
      const existingAvaliation = await prisma.avaliation.findFirst({
        where: { event_id: data.event_id, user_id },
      });

      if (existingAvaliation) {
        return { message: "Você já avaliou este evento", status: 400 };
      }

      const avaliation = await prisma.avaliation.create({
        data: {
          event_id: data.event_id,
          user_id,
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      return {
        id: avaliation.id,
        event_id: avaliation.event_id,
        user_id: avaliation.user_id,
        rating: avaliation.rating,
        comment: avaliation.comment,
        user: { name: avaliation.user.name },
        created_at: avaliation.created_at.toISOString(),
        updated_at: avaliation.updated_at.toISOString(),
      };
    } catch (error) {
      console.error("Error creating avaliation:", error);
      return { message: "Erro ao criar avaliação", status: 500 };
    }
  }

  async getAvaliationsByEvent(
    event_id: string,
    page = 1,
    per_page = 10,
  ): Promise<
    { data: schema.ResponseAvaliation[]; total: number } | { message: string; status: number }
  > {
    try {
      if (!validate(event_id)) {
        return { message: "ID do evento inválido", status: 400 };
      }

      const avaliations = await prisma.avaliation.findMany({
        where: { event_id },
        include: {
          user: {
            select: { name: true },
          },
        },
        skip: (page - 1) * per_page,
        take: per_page,
        orderBy: { created_at: "desc" },
      });

      const total = await prisma.avaliation.count({ where: { event_id } });

      return {
        data: avaliations.map((a) => ({
          id: a.id,
          event_id: a.event_id,
          user_id: a.user_id,
          rating: a.rating,
          comment: a.comment,
          user: { name: a.user.name },
          created_at: a.created_at.toISOString(),
          updated_at: a.updated_at.toISOString(),
        })),
        total,
      };
    } catch (error) {
      console.error("Error fetching avaliations:", error);
      return { message: "Erro ao buscar avaliações", status: 500 };
    }
  }

  async updateAvaliation(
    avaliation_id: string,
    data: schema.UpdateAvaliation,
    user_id: string,
  ): Promise<schema.ResponseAvaliation | { message: string; status: number }> {
    try {
      if (!validate(avaliation_id)) {
        return { message: "ID da avaliação inválido", status: 400 };
      }

      const existing = await prisma.avaliation.findUnique({
        where: { id: avaliation_id },
      });

      if (!existing) {
        return { message: "Avaliação não encontrada", status: 404 };
      }

      if (existing.user_id !== user_id) {
        return { message: "Você não tem permissão para editar esta avaliação", status: 403 };
      }

      const updated = await prisma.avaliation.update({
        where: { id: avaliation_id },
        data: {
          rating: data.rating ?? existing.rating,
          comment: data.comment ?? existing.comment,
        },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      return {
        id: updated.id,
        event_id: updated.event_id,
        user_id: updated.user_id,
        rating: updated.rating,
        comment: updated.comment,
        user: { name: updated.user.name },
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString(),
      };
    } catch (error) {
      console.error("Error updating avaliation:", error);
      return { message: "Erro ao atualizar avaliação", status: 500 };
    }
  }

  async deleteAvaliation(
    avaliation_id: string,
    user_id: string,
  ): Promise<{ message: string; status: number }> {
    try {
      if (!validate(avaliation_id)) {
        return { message: "ID da avaliação inválido", status: 400 };
      }

      const existing = await prisma.avaliation.findUnique({
        where: { id: avaliation_id },
      });

      if (!existing) {
        return { message: "Avaliação não encontrada", status: 404 };
      }

      // Permitir que o dono da avaliação ou um ADMIN delete
      const user = await prisma.user.findUnique({ where: { id: user_id } });
      if (existing.user_id !== user_id && user?.role !== "ADMIN") {
        return { message: "Você não tem permissão para excluir esta avaliação", status: 403 };
      }

      await prisma.avaliation.delete({
        where: { id: avaliation_id },
      });

      return { message: "Avaliação excluída com sucesso", status: 200 };
    } catch (error) {
      console.error("Error deleting avaliation:", error);
      return { message: "Erro ao excluir avaliação", status: 500 };
    }
  }
}
