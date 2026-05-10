import prisma from "../../database/prisma";
import { validate } from "uuid";
import * as schema from "./comment.schema";

export class CommentService {
  async createComment(
    data: schema.CreateComment,
    user_id: string,
  ): Promise<schema.ResponseComment | { message: string; status: number }> {
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

      const comment = await prisma.comment.create({
        data: {
          event_id: data.event_id,
          user_id,
          content: data.content,
        },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      return {
        id: comment.id,
        event_id: comment.event_id,
        user_id: comment.user_id,
        content: comment.content,
        user: { name: comment.user.name },
        created_at: comment.created_at.toISOString(),
        updated_at: comment.updated_at.toISOString(),
      };
    } catch (error) {
      console.error("Error creating comment:", error);
      return { message: "Erro ao criar comentário", status: 500 };
    }
  }

  async getCommentsByEvent(
    event_id: string,
    page = 1,
    per_page = 10,
  ): Promise<
    { data: schema.ResponseComment[]; total: number } | { message: string; status: number }
  > {
    try {
      if (!validate(event_id)) {
        return { message: "ID do evento inválido", status: 400 };
      }

      const comments = await prisma.comment.findMany({
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

      const total = await prisma.comment.count({ where: { event_id } });

      return {
        data: comments.map((c) => ({
          id: c.id,
          event_id: c.event_id,
          user_id: c.user_id,
          content: c.content,
          user: { name: c.user.name },
          created_at: c.created_at.toISOString(),
          updated_at: c.updated_at.toISOString(),
        })),
        total,
      };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return { message: "Erro ao buscar comentários", status: 500 };
    }
  }

  async getCommentById(
    comment_id: string,
  ): Promise<schema.ResponseComment | { message: string; status: number }> {
    try {
      if (!validate(comment_id)) {
        return { message: "ID do comentário inválido", status: 400 };
      }

      const comment = await prisma.comment.findUnique({
        where: { id: comment_id },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      if (!comment) {
        return { message: "Comentário não encontrado", status: 404 };
      }

      return {
        id: comment.id,
        event_id: comment.event_id,
        user_id: comment.user_id,
        content: comment.content,
        user: { name: comment.user.name },
        created_at: comment.created_at.toISOString(),
        updated_at: comment.updated_at.toISOString(),
      };
    } catch (error) {
      console.error("Error fetching comment:", error);
      return { message: "Erro ao buscar comentário", status: 500 };
    }
  }

  async updateComment(
    comment_id: string,
    data: schema.UpdateComment,
    user_id: string,
  ): Promise<schema.ResponseComment | { message: string; status: number }> {
    try {
      if (!validate(comment_id)) {
        return { message: "ID do comentário inválido", status: 400 };
      }

      const existing = await prisma.comment.findUnique({
        where: { id: comment_id },
      });

      if (!existing) {
        return { message: "Comentário não encontrado", status: 404 };
      }

      if (existing.user_id !== user_id) {
        return { message: "Você não tem permissão para editar este comentário", status: 403 };
      }

      const updated = await prisma.comment.update({
        where: { id: comment_id },
        data: {
          content: data.content ?? existing.content,
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
        content: updated.content,
        user: { name: updated.user.name },
        created_at: updated.created_at.toISOString(),
        updated_at: updated.updated_at.toISOString(),
      };
    } catch (error) {
      console.error("Error updating comment:", error);
      return { message: "Erro ao atualizar comentário", status: 500 };
    }
  }

  async deleteComment(
    comment_id: string,
    user_id: string,
  ): Promise<{ message: string; status: number }> {
    try {
      if (!validate(comment_id)) {
        return { message: "ID do comentário inválido", status: 400 };
      }

      const existing = await prisma.comment.findUnique({
        where: { id: comment_id },
      });

      if (!existing) {
        return { message: "Comentário não encontrado", status: 404 };
      }

      const user = await prisma.user.findUnique({ where: { id: user_id } });
      if (existing.user_id !== user_id && user?.role !== "ADMIN") {
        return { message: "Você não tem permissão para excluir este comentário", status: 403 };
      }

      await prisma.comment.delete({
        where: { id: comment_id },
      });

      return { message: "Comentário excluído com sucesso", status: 200 };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { message: "Erro ao excluir comentário", status: 500 };
    }
  }
}
