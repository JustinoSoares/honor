import prisma from "../database/prisma";
import { emit } from "../config/socket";

/**
 * Cria uma notificação persistente no banco de dados e envia via Socket.IO
 * para o utilizador em tempo real (se estiver conectado).
 *
 * @param user_id  - ID do utilizador a notificar
 * @param message  - Mensagem legível para o utilizador
 * @param extra    - Dados adicionais opcionais enviados APENAS via socket (não persistidos)
 */
export async function notify(
  user_id: string,
  message: string,
  extra?: Record<string, unknown>,
): Promise<void> {
  try {
    // 1. Persiste no banco de dados
    const notification = await prisma.notification.create({
      data: { user_id, message },
    });

    // 2. Emite em tempo real via Socket.IO para a room do utilizador
    emit(`user:${user_id}`, "notification", {
      id: notification.id,
      message,
      read: false,
      created_at: notification.created_at.toISOString(),
      ...extra,
    });
  } catch (error) {
    // Falha de notificação nunca deve quebrar o fluxo principal
    console.error(`[notify] Erro ao notificar utilizador ${user_id}:`, error);
  }
}
