import z from "zod";

export const CreateEventSchema = z.object({
  title: z.string("O título do evento é obrigatório").min(1, "O título do evento é obrigatório"),
  description: z
    .string("A descrição do evento é obrigatória")
    .min(1, "A descrição do evento é obrigatória"),
  date_start: z
    .string("A data de início do evento é obrigatória")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Data de início inválida",
    }),
  date_end: z
    .string("A data de término do evento é obrigatória")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Data de término inválida",
    })
    .optional(),
  cover_url: z.string().optional().openapi({ example: "https://example.com/cover.jpg" }),
  max_guests: z
    .number("O número máximo de convidados deve ser um número inteiro")
    .int("O número máximo de convidados deve ser um número inteiro")
    .optional()
    .openapi({ example: 500 }),
  promoter: z
    .string("O promotor do evento é obrigatório")
    .min(1, "O promotor do evento é obrigatório"),
  promoter_nif: z
    .string("O NIF do promotor do evento é obrigatório")
    .min(1, "O NIF do promotor do evento é obrigatório"),
  category: z
    .string("A categoria do evento é obrigatória")
    .min(1, "A categoria do evento é obrigatória")
    .optional(),
  duration: z
    .number("A duração do evento em minuto deve ser um número inteiro positivo")
    .int()
    .positive()
    .optional(),
  province: z
    .string("A província do evento é obrigatória")
    .min(1, "A província do evento é obrigatória"),
  location: z
    .string("A localização do evento é obrigatória")
    .min(1, "A localização do evento é obrigatória"),
  contact: z.object({
    option: z.string("O email do contato é obrigatório"),
    option2: z.string("O telefone do contato é obrigatório").optional(),
  }),
  classification: z.enum(["A", "B", "C"]).openapi({ example: "C" }),

  packages: z
    .array(
      z.object({
        name: z.string("O nome do pacote é obrigatório").min(1, "O nome do pacote é obrigatório"),
        price: z
          .number("O preço do pacote deve ser um número")
          .positive("O preço do pacote deve ser um número positivo"),
        priority: z
          .number("A prioridade do pacote deve ser um número inteiro")
          .int()
          .positive("A prioridade do pacote deve ser um número inteiro positivo"),
        benefits: z
          .array(z.string("Cada benefício do pacote é obrigatório"))
          .min(1, "Pelo menos um benefício do pacote é obrigatório"),
        max_tickets: z
          .number("O número máximo de ingressos para este pacote deve ser um número inteiro")
          .int()
          .positive(
            "O número máximo de ingressos para este pacote deve ser um número inteiro positivo",
          )
          .optional(),
      }),
    )
    .optional(),
});

export type EventCreate = z.infer<typeof CreateEventSchema>;

export const CreatePackage = z.object({
  name: z.string("O nome do pacote é obrigatório").min(1, "O nome do pacote é obrigatório"),
  price: z
    .number("O preço do pacote deve ser um número")
    .positive("O preço do pacote deve ser um número positivo"),
  priority: z
    .number("A prioridade do pacote deve ser um número inteiro")
    .int()
    .positive("A prioridade do pacote deve ser um número inteiro positivo"),
  benefits: z
    .array(z.string("Cada benefício do pacote é obrigatório"))
    .min(1, "Pelo menos um benefício do pacote é obrigatório"),
  max_tickets: z
    .number("O número máximo de ingressos para este pacote deve ser um número inteiro")
    .int()
    .positive(
      "O número máximo de ingressos para este pacote deve ser um número inteiro positivo",
    )
    .optional(),
});

export type PackageCreate = z.infer<typeof CreatePackage>;

export const createMemberSchema = z.object({
  name: z.string("O nome do membro é obrigatório").min(1, "O nome do membro é obrigatório"),
  user_id: z.string("O ID do usuário é obrigatório").uuid("O ID do usuário deve ser um UUID"),
  event_id: z.string("O ID do evento é obrigatório").uuid("O ID do evento deve ser um UUID"),
  permission: z.enum(["MANAGER", "STAFF"]).openapi({ example: "MANAGER" }),
});

export type CreateMember = z.infer<typeof createMemberSchema>;

export const addMemberToEventSchema = z.object({
  email: z.string("O email do usuário é obrigatório").email("O email do usuário deve ser válido"),
  permission: z.enum(["MANAGER", "STAFF"]).openapi({ example: "MANAGER" }),
});

export type AddMemberToEvent = z.infer<typeof addMemberToEventSchema>;

export const ResponseMemberSchema = z.object({
  id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
  name: z.string().openapi({ example: "João Silva" }),
  user_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
  event_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
  permission: z.enum(["MANAGER", "STAFF"]).openapi({ example: "MANAGER" }),
});

export type ResponseMember = z.infer<typeof ResponseMemberSchema>;

export const CreateImageSchema = z.object({
  url: z.string("A URL da imagem é obrigatória").min(1, "A URL da imagem é obrigatória"),
  priority: z.number("A prioridade da imagem deve ser um número inteiro").int().optional(),
});

export type CreateImage = z.infer<typeof CreateImageSchema>;

export const ResponseImageSchema = z.object({
  id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
  url: z.string().openapi({ example: "https://example.com/image.jpg" }),
  priority: z.number().optional().openapi({ example: 1 }),
});

export type ResponseImage = z.infer<typeof ResponseImageSchema>;

export const ResponsePackageSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    name: z.string().openapi({ example: "Pacote VIP" }),
    price: z.number().openapi({ example: 150.0 }),
    priority: z.number().openapi({ example: 1 }),
    benefits: z.array(z.string()).openapi({ example: ["Acesso VIP", "Open bar"] }),
    max_tickets: z.number().optional().openapi({ example: 100 }),
    purchased: z.number().optional().openapi({ example: 50 }),
  })
  .openapi("ResponsePackage");

export type ResponsePackage = z.infer<typeof ResponsePackageSchema>;

export const EventUpdateSchema = z.object({
  title: z
    .string("O título do evento é obrigatório")
    .min(1, "O título do evento é obrigatório")
    .optional(),
  description: z
    .string("A descrição do evento é obrigatória")
    .min(1, "A descrição do evento é obrigatória")
    .optional(),
  date_start: z
    .string("A data de início do evento é obrigatória")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Data de início inválida",
    })
    .optional(),
  date_end: z
    .string("A data de término do evento é obrigatória")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Data de término inválida",
    })
    .optional(),
  cover_url: z.string().optional().openapi({ example: "https://example.com/cover.jpg" }),
  max_guests: z
    .number("O número máximo de convidados deve ser um número inteiro")
    .int("O número máximo de convidados deve ser um número inteiro")
    .optional()
    .openapi({ example: 500 }),
  promoter: z
    .string("O promotor do evento é obrigatório")
    .min(1, "O promotor do evento é obrigatório")
    .optional(),
  promoter_nif: z
    .string("O NIF do promotor do evento é obrigatório")
    .min(1, "O NIF do promotor do evento é obrigatório")
    .optional(),
  category: z
    .string("A categoria do evento é obrigatória")
    .min(1, "A categoria do evento é obrigatória")
    .optional(),
  duration: z
    .number("A duração do evento em minuto deve ser um número inteiro positivo")
    .int()
    .positive()
    .optional(),
  province: z
    .string("A província do evento é obrigatória")
    .min(1, "A província do evento é obrigatória")
    .optional(),
  location: z
    .string("A localização do evento é obrigatória")
    .min(1, "A localização do evento é obrigatória")
    .optional(),
  contact: z
    .object({
      option: z.string("O email do contato é obrigatório"),
      option2: z.string("O telefone do contato é obrigatório").optional(),
    })
    .optional(),
  classification: z.enum(["A", "B", "C"]).openapi({ example: "C" }).optional(),
});

export type EventUpdate = z.infer<typeof EventUpdateSchema>;

export const ResponseEventSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
    title: z.string().openapi({ example: "Evento de Música" }),
    description: z.string().openapi({ example: "Descrição do evento" }),
    date_start: z.string().openapi({ example: "2024-01-01T20:00:00Z" }),
    date_end: z.string().optional().openapi({ example: "2024-01-01T23:00:00Z" }),
    cover_url: z.string().optional().openapi({ example: "https://example.com/cover.jpg" }),
    max_guests: z.number().optional().openapi({ example: 500 }),
    promoter: z.string().openapi({ example: "Promotor XYZ" }),
    promoter_nif: z.string().openapi({ example: "123456789" }),
    category: z.string().openapi({ example: "Música" }),
    duration: z.number().optional().openapi({ example: 180 }),
    province: z.string().openapi({ example: "Luanda" }),
    location: z.string().openapi({ example: "Estádio Nacional" }),
    contact: z.object({
      option: z.string(),
      option2: z.string().optional(),
    }),
    available: z.boolean().openapi({ example: true }),
    classification: z.enum(["A", "B", "C"]).openapi({ example: "C" }).optional(),
    created_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),
    updated_at: z.string().datetime().openapi({ example: "2024-01-01T00:00:00Z" }),

    packages: z
      .array(
        z.object({
          id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
          name: z.string().openapi({ example: "Pacote VIP" }),
          price: z.number().openapi({ example: 150.0 }),
          priority: z.number().openapi({ example: 1 }),
          benefits: z.array(z.string()).openapi({ example: ["Acesso VIP", "Open bar"] }),
          max_tickets: z.number().optional().openapi({ example: 100 }),
          purchased: z.number().optional().openapi({ example: 50 }),
        }),
      )
      .optional(),
    members: z
      .array(
        z.object({
          id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
          name: z.string().openapi({ example: "João Silva" }),
          user_id: z.string().uuid().openapi({ example: "a1b2c3d4-e5f6-..." }),
          permission: z.enum(["MANAGER", "STAFF"]).openapi({ example: "MANAGER" }),
        }),
      )
      .optional(),
  })
  .openapi("ResponseEvent");

export type ResponseEvent = z.infer<typeof ResponseEventSchema>;

export const ResponseBadSchema = z.object({
  message: z.string(),
  status: z.number(),
});

export type ResponseBad = z.infer<typeof ResponseBadSchema>;

export const MetaSchema = z.object({
  page: z.number().openapi({ example: 1 }),
  per_page: z.number().openapi({ example: 10 }),
  total: z.number().openapi({ example: 100 }),
  total_pages: z.number().openapi({ example: 10 }),
});

export type Meta = z.infer<typeof MetaSchema>;
