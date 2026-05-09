import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server;

export function initSocket(httpServer: HttpServer): void {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("user:identify", (userId: string) => {
      socket.join(`user:${userId}`);
      socket.emit("user:ready", { userId });
    });

    socket.on("ticket:watch", (ticketId: string) => socket.join(`ticket:${ticketId}`));
    socket.on("ticket:unwatch", (ticketId: string) => socket.leave(`ticket:${ticketId}`));

    socket.on("event:join", (eventId: string) => {
      socket.join(`event:${eventId}`);
      socket.emit("event:joined", { eventId });
    });
    socket.on("event:leave", (eventId: string) => socket.leave(`event:${eventId}`));

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} — ${reason}`);
    });
  });
}

/**
 * Emite para uma room específica.
 * @example emit(`user:${userId}`, "email_sent", { message: "Confirmação enviada!" })
 * @example emit(`ticket:${ticketId}`, "ticket:status", { status: "confirmed" })
 * @example emit(`event:${eventId}`, "event:updated", { availableSeats: 10 })
 */
export function emit(room: string, event: string, payload: Record<string, unknown>): void {
  io.to(room).emit(event, payload);
}

/**
 * Emite para todos os clientes conectados.
 * @example broadcast("system:maintenance", { message: "Voltamos em 5 minutos" })
 */
export function broadcast(event: string, payload: Record<string, unknown>): void {
  io.emit(event, payload);
}