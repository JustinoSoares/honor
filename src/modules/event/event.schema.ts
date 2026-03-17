import z from "zod";

export const EventSchema = z.object({
    title: z.string("O título do evento é obrigatório").min(1, 'O título do evento é obrigatório'),
    description: z.string("A descrição do evento é obrigatória").min(1, 'A descrição do evento é obrigatória'),
    date_start: z.string("A data de início do evento é obrigatória").refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data de início inválida',
    }),
    date_end: z.string("A data de término do evento é obrigatória").refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data de término inválida',
    }).optional(),
    promoter: z.string("O promotor do evento é obrigatório").min(1, 'O promotor do evento é obrigatório').optional(),
    duration : z.number("A duração do evento em minuto deve ser um número inteiro positivo").int().positive().optional(),
    province: z.string("A província do evento é obrigatória").min(1, 'A província do evento é obrigatória'),
    type_event: z.string("O tipo do evento é obrigatório").min(1, 'O tipo do evento é obrigatório'),
    location: z.string("A localização do evento é obrigatória").min(1, 'A localização do evento é obrigatória'),
    available : z.boolean().default(false).optional(),
    owner: z.object({
        name: z.string("O nome do dono do evento é obrigatório").min(1, 'O nome do dono do evento é obrigatório'),
        email: z.string("O email do dono do evento é obrigatório").email('Endereço de email inválido'),
        phone: z.string("O telefone do dono do evento é obrigatório").min(1, 'O telefone do dono do evento é obrigatório'),
    })
});

export type EventCreate = z.infer<typeof EventSchema>;

export const EventUpdateSchema = z.object({
    title: z.string().min(1, 'O título do evento é obrigatório').optional(),
    description: z.string().min(1, 'A descrição do evento é obrigatória').optional(),
    date_start: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data de início inválida',
    }).optional(),
    date_end: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data de término inválida',
    }).optional(),
    promoter: z.string().min(1, 'O promotor do evento é obrigatório').optional(),
    duration : z.number().int().positive('A duração do evento em minuto deve ser um número inteiro positivo').optional(),
    province: z.string().min(1, 'A província do evento é obrigatória').optional(),
    type_event: z.string().min(1, 'O tipo do evento é obrigatório').optional(),
    location: z.string().min(1, 'A localização do evento é obrigatória').optional(),
    available : z.boolean().default(false).optional(),
    owner: z.object({
        name: z.string("O nome do dono do evento é obrigatório").min(1, 'O nome do dono do evento é obrigatório'),
        email: z.string("O email do dono do evento é obrigatório").email('Endereço de email inválido'),
        phone: z.string("O telefone do dono do evento é obrigatório").min(1, 'O telefone do dono do evento é obrigatório'),
    }).optional(),
});

export type EventUpdate = z.infer<typeof EventUpdateSchema>;

export const ResponseEventSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    date_start: z.string(),
    date_end: z.string().nullable(),
    promoter: z.string().nullable(),
    duration : z.number().int().positive('A duração do evento em minuto deve ser um número inteiro positivo').nullable(),
    province: z.string(),
    type_event: z.string(),
    location: z.string(),
    available : z.boolean().default(false),
    responsible: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        bi: z.string(),
        phone: z.string(),
        person_id: z.string(),
    }),
    owner: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        phone: z.string(),
    }),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type ResponseEvent = z.infer<typeof ResponseEventSchema>;

export const ResponseBadSchema = z.object({
    message: z.string(),
    status: z.number(),
});

export type ResponseBad = z.infer<typeof ResponseBadSchema>;