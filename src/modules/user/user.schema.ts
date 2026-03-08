import zod from 'zod';

export const UserSchema = zod.object({
    name: zod.string().min(1, 'O seu nome é obrigatório'),
    email: zod.string().email('Endereço de email inválido'),
    bi: zod.string().min(1, 'BI é obrigatório'),
    phone: zod.string().min(1, 'Número de telefone é obrigatório'),
    password: zod.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type UserCreate = zod.infer<typeof UserSchema>;

export const UserUpdateSchema = zod.object({
    name: zod.string().min(1, 'O seu nome é obrigatório').optional(),
    email: zod.string().email('Endereço de email inválido').optional(),
    bi: zod.string().min(1, 'BI é obrigatório').optional(),
    phone: zod.string().min(1, 'Número de telefone é obrigatório').optional(),
    password: zod.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional(),
});

export type UserUpdate = zod.infer<typeof UserUpdateSchema>;

export const ResponseUserSchema = zod.object({
    id: zod.string(),
    name: zod.string(),
    email: zod.string(),
    bi: zod.string(),
    phone: zod.string(),
    person_id: zod.string(),
});

export type ResponseUser = zod.infer<typeof ResponseUserSchema>;

export const ResponseBadSchema = zod.object({
    message: zod.string(),
    status: zod.number(),
});

export type ResponseBad = zod.infer<typeof ResponseBadSchema>;
