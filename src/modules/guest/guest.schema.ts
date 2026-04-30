// import {z} from 'zod';

// export const GuestSchema = z.object({
//     name: z.string("O nome do convidado é obrigatório").min(1, 'O nome do convidado é obrigatório'),
//     email: z.string("O email do convidado é obrigatório").email('Endereço de email inválido'),
//     phone: z.string("O telefone do convidado é obrigatório").min(1, 'O telefone do convidado é obrigatório'),
//     link: z.string().optional(),
// });

// export type GuestCreate = z.infer<typeof GuestSchema>;

// export const GuestUpdateSchema = z.object({
//     name: z.string().min(1, 'O nome do convidado é obrigatório').optional(),
//     email: z.string().email('Endereço de email inválido').optional(),
//     phone: z.string().min(1, 'O telefone do convidado é obrigatório').optional(),
//     link: z.string().optional(),
// });

// export type GuestUpdate = z.infer<typeof GuestUpdateSchema>;

// export const ResponseGuestSchema = z.object({
//     id: z.string(),
//     name: z.string().optional(),
//     email: z.string().optional(),
//     phone: z.string().optional(),
//     qr_code : z.string().nullable(),
//     link: z.string().nullable(),
// });

// export type ResponseGuest = z.infer<typeof ResponseGuestSchema>;
