import { z } from "zod";

export const CreateGuestSchema = z.object({
  name: z
    .string("O nome do responsável pelos convites é obrigatório")
    .min(1, "O nome do convidado é obrigatório"),
  email: z
    .string("O email do convidado é obrigatório")
    .email("Endereço de email inválido"),
  phone: z
    .string("O telefone do convidado é obrigatório")
    .min(1, "O telefone do convidado é obrigatório"),
  event_id: z.string("O ID do evento é obrigatório"),
  invitation: z
    .array(
      z.object({
        event_id: z.string("O ID do evento é obrigatório"),
        package_id: z.string("O ID do pacote é obrigatório"),
        name: z
          .string("O nome do convite é obrigatório")
          .min(1, "O nome do convite é obrigatório"),
      }),
    ).min(1, "Pelo menos um convite deve ser criado"),
});

export type CreateGuest = z.infer<typeof CreateGuestSchema>;

export const ResponseGuestSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "O nome do convidado é obrigatório").optional(),
  email: z.string().email("Endereço de email inválido").optional(),
  phone: z.string().min(1, "O telefone do convidado é obrigatório").optional(),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED", "BLOCKED"])
    .optional(),
  link: z.string().nullable().optional(),
  debt: z.number(),
  event_id: z.string().optional(),
  invitation: z
    .array(
      z.object({
        event_id: z.string("O ID do evento é obrigatório"),
        package_id: z.string("O ID do pacote é obrigatório"),
        is_paid: z.boolean().optional(),
        is_used: z.boolean().optional(),
        package_name: z
          .string("O nome do pacote é obrigatório")
          .min(1, "O nome do pacote é obrigatório"),
        package_color: z
          .string("A cor do pacote é obrigatória")
          .min(1, "A cor do pacote é obrigatória"),
        guest_id: z.string("O ID do convidado é obrigatório"),
        name: z
          .string("O nome do convite é obrigatório")
          .min(1, "O nome do convite é obrigatório"),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
        qr_code: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export type ResponseGuest = z.infer<typeof ResponseGuestSchema>;

export const InvitationGuestSchema = z.object({
  event_id: z.string("O ID do evento é obrigatório"),
  package_id: z.string("O ID do pacote é obrigatório"),
  name: z
    .string("O nome do convite é obrigatório")
    .min(1, "O nome do convite é obrigatório"),
});

export type InvitationGuest = z.infer<typeof InvitationGuestSchema>;

export const ResponseInvitationGuest = z.object({
  event_id: z.string("O ID do evento é obrigatório"),
  package_id: z.string("O ID do pacote é obrigatório"),
  name: z
    .string("O nome do convite é obrigatório")
    .min(1, "O nome do convite é obrigatório"),
  is_paid: z.boolean(),
  is_used: z.boolean(),
  package_name: z
    .string("O nome do pacote é obrigatório")
    .min(1, "O nome do pacote é obrigatório"),
  package_color: z
    .string("A cor do pacote é obrigatória")
    .min(1, "A cor do pacote é obrigatória").optional(),
  guest_id: z.string("O ID do convidado é obrigatório"),
  created_at: z.string(),
  updated_at: z.string(),
  qr_code: z.string().optional(),
});

export type ResponseInvitationGuest = z.infer<typeof ResponseInvitationGuest>;
