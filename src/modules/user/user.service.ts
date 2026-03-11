
import prisma  from '../../database/prisma';
import * as schema from './user.schema';
import * as bcrypt from 'bcrypt';


export class UserService {
    constructor() { }

    async createUser(data: schema.UserCreate) {

        const existingUser = await prisma.person.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { bi: data.bi },
                ],
            },
        });

        if (existingUser) {
            return {
                message: 'Email já cadastrado',
                status: 400,
            };
        }

        const person = await prisma.person.create({
            data: {
                name: data.name,
                email: data.email,
                bi: data.bi,
                phone: data.phone,
            },
        });

        const user = await prisma.user.create({
            data: {
                password: await bcrypt.hash(data.password, 10),
                person_id: person.id,
            },
        });
        return {
            id: user.id,
            name: person.name,
            email: person.email,
            bi: person.bi,
            phone: person.phone,
            person_id: person.id,
        } as schema.ResponseUser;
    }

    async getAllusers(limit = 10, page = 1, search : string = '') {
        const skip = (page - 1) * limit;
        let whereClause = {};

        if (search) {
            whereClause = {
                person: {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            include: {
                person: true,
            },
            skip,
            take: limit,
        });

        return users.map(user => ({
            id: user.id,
            name: user.person.name,
            email: user.person.email,
            bi: user.person.bi,
            phone: user.person.phone,
            person_id: user.person_id,
        })) as schema.ResponseUser[];
    }

    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { person: true },
        });

        if (!user) {
            return {
                message: 'Usuário não encontrado',
                status: 404,
            };
        }

        return {
            id: user.id,
            name: user.person.name,
            email: user.person.email,
            bi: user.person.bi,
            phone: user.person.phone,
            person_id: user.person_id,
        } as schema.ResponseUser;
    }

    async updateUser(id: string, data: schema.UserUpdate) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { person: true },
        });

        if (!user) {
            return {
                message: 'Usuário não encontrado',
                status: 404,
            };
        }

        const updatedPerson = await prisma.person.update({
            where: { id: user.person_id },
            data: {
                name: data.name ?? user.person.name,
                email: data.email ?? user.person.email,
                bi: data.bi ?? user.person.bi,
                phone: data.phone ?? user.person.phone,
            },
        });

        if (data.password) {
            await prisma.user.update({
                where: { id },
                data: { password: data.password },
            });
        }

        return {
            id: user.id,
            name: updatedPerson.name,
            email: updatedPerson.email,
            bi: updatedPerson.bi,
            phone: updatedPerson.phone,
            person_id: updatedPerson.id,
        } as schema.ResponseUser;
    }

    async deleteUser(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { person: true },
        });

        if (!user) {
            return {
                message: 'Usuário não encontrado',
                status: 404,
            };
        }

        await prisma.user.delete({ where: { id } });
        await prisma.person.delete({ where: { id: user.person_id } });

        return {
            message: 'Usuário deletado com sucesso',
            status: 200,
        } as schema.ResponseBad;
    }
}