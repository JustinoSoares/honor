import { z } from "zod";

export const CreateTicketSchema = z.object({
data : z
  .array(
    z.object({
      event_id: z.string("O ID do evento é obrigatório"),
      package_id: z.string("O ID do pacote é obrigatório"),
      name: z.string("O nome do convite é obrigatório").min(1, "O nome do convite é obrigatório"),
    }),
  )
  .min(1, "Pelo menos um convite deve ser criado")
});

export const ticketArray  = z.array(
  z.object({
    event_id: z.string("O ID do evento é obrigatório"),
    package_id: z.string("O ID do pacote é obrigatório"),
    
    name: z.string("O nome do convite é obrigatório").min(1, "O nome do convite é obrigatório"),
  }),
).min(1, "Pelo menos um convite deve ser criado");

export type TicketArray = z.infer<typeof ticketArray>;

export type CreateTicket = z.infer<typeof CreateTicketSchema>;

export const TicketGuestSchema = z.object({
  event_id: z.string("O ID do evento é obrigatório"),
  package_id: z.string("O ID do pacote é obrigatório"),
  name: z.string("O nome do convite é obrigatório").min(1, "O nome do convite é obrigatório"),
});

export type TicketGuest = z.infer<typeof TicketGuestSchema>;

export const ResponseTicket = z.object({
  event_id: z.string("O ID do evento é obrigatório"),
  package_id: z.string("O ID do pacote é obrigatório"),
  name: z.string("O nome do convite é obrigatório").min(1, "O nome do convite é obrigatório"),
  is_paid: z.boolean(),
  is_used: z.boolean(),
  package_name: z.string("O nome do pacote é obrigatório").min(1, "O nome do pacote é obrigatório"),
  package_color: z
    .string("A cor do pacote é obrigatória")
    .min(1, "A cor do pacote é obrigatória")
    .optional(),
  user_id: z.string("O ID do usuário é obrigatório"),
  created_at: z.string(),
  updated_at: z.string(),
  qr_code: z.string().optional(),

  user: z.object({
    id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    name: z.string().openapi({ example: "Justino Soares" }),
    email: z.string().openapi({ example: "justino.soares@example.com" }),
    phone: z.string().openapi({ example: "+244 900 000 000" }),
  }),
});

export type ResponseTicket = z.infer<typeof ResponseTicket>;
