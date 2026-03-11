import { PrismaClient } from "@prisma/client";

export class EventService {
    constructor(private prisma: PrismaClient) { }

    async createEvent(data: any) {
        try {
            const event = await this.prisma.event.create({
                data,
            });
            return event;
        } catch (error) {
            return {
                message: 'Erro ao criar evento',
                status: 500,
            }
        }
    }

    async getAllEvents(limit = 10, page = 1, search = '') {
        const skip = (page - 1) * limit;

        try {
            const events = await this.prisma.event.findMany({
                skip,
                take: limit,
                where: {
                    title: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            });
            return events;
        } catch (error) {
            return {
                message: 'Erro ao buscar eventos',
                status: 500,
            }
        }
    }

    async getEventById(event_id: string) {
        try {
            const event = await this.prisma.event.findFirst({
                where: { id: event_id },
            });
            return event;
        } catch (error) {
            return {
                message: 'Erro ao buscar evento',
                status: 500,
            }
        }
    }

    async updateEvent(event_id: string, data: any) {
        const event = await this.prisma.event.update({
            where: { id: event_id },
            data,
        });
        return event;
    }

    async deleteEvent(event_id: string) {
        await this.prisma.event.delete({
            where: { id: event_id },
        });
        return { message: 'Evento deletado com sucesso' };
    }
}