import prisma from "../../database/prisma";
import { validate } from "uuid";
import * as schema from "./event.schema";
import { includes } from "zod";
export class EventService {
    constructor() { }

    async createEvent(data: schema.EventCreate, user_id?: string) {
        try {
            if (!user_id || !validate(user_id)) {
                return {
                    message: 'Usuário não autenticado',
                    status: 401,
                }
            }

            const responsible = await prisma.user.findFirst({
                where: { id: user_id },
                select: {
                    person: true
                }
            });

            if (!responsible) {
                return {
                    message: 'Usuário não encontrado',
                    status: 404,
                }
            }

            const { title, description, date_start,
                date_end, location, promoter, duration, province,
                type_event, available
            } = data;

            const owner = await prisma.owner.create({
                data: {
                    name: data.owner.name,
                    email: data.owner.email,
                    phone: data.owner.phone,
                }
            });

            const event = await prisma.event.create({
                data: {
                    title,
                    description,
                    date_start: new Date(date_start),
                    date_end: date_end ? new Date(date_end) : null,
                    location,
                    promoter: promoter || null,
                    duration: duration || 0,
                    province,
                    type_event,
                    available: available || false,
                    owner_id: owner.id,
                    responsible_id: user_id
                }
            });

            const dataResponse: schema.ResponseEvent = {
                id: event.id,
                title: event.title,
                description: event.description,
                date_start: event.date_start.toISOString(),
                date_end: event.date_end ? event.date_end.toISOString() : null,
                location: event.location,
                promoter: event.promoter,
                duration: event.duration,
                province: event.province,
                type_event: event.type_event,
                available: event.available,
                owner: {
                    id: owner.id,
                    name: owner.name,
                    email: owner.email,
                    phone: owner.phone,
                },
                responsible: {
                    id: user_id,
                    name: responsible.person.name,
                    email: responsible.person.email,
                    phone: responsible.person.phone,
                    person_id: responsible.person.id,
                    bi: responsible.person.bi,
                },
                created_at: event.created_at.toISOString(),
                updated_at: event.updated_at.toISOString(),
            };

            return dataResponse;
        } catch (error) {
            return {
                message: 'Erro ao criar evento',
                status: 500,
            }
        }
    }

    async getAllEvents(limit = 10, page = 1, search = '') {
        const skip = (page - 1) * limit;

        let whereClause = {};
        if (search) {
            console.log('search: ', search);
            whereClause = {
                title: {
                    contains: search,
                    mode: 'insensitive',
                },
            };
        }

        try {
            const events = await prisma.event.findMany({
                skip,
                take: limit,
                where: whereClause,
                orderBy: {
                    created_at: 'desc',
                },
            });

            const dataResponse = await Promise.all(events.map(async (event) => {
                const owner = await prisma.owner.findUnique({
                    where: { id: event.owner_id },
                });
                const responsible = await prisma.user.findUnique({
                    where: { id: event.responsible_id },
                    select: {
                        person: true
                    }
                });


                if (!owner || !responsible) {
                    return null;
                }
                return {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    date_start: event.date_start.toISOString(),
                    date_end: event.date_end ? event.date_end.toISOString() : null,
                    location: event.location,
                    promoter: event.promoter,
                    duration: event.duration,
                    province: event.province,
                    type_event: event.type_event,
                    available: event.available,
                    owner: {
                        id: event.owner_id,
                        name: owner.name,
                        email: owner.email,
                        phone: owner.phone,
                    },
                    responsible: {
                        id: event.responsible_id,
                        name: responsible.person.name,
                        email: responsible.person.email,
                        phone: responsible.person.phone,
                        person_id: responsible.person.id,
                        bi: responsible.person.bi,
                    },
                    created_at: event.created_at.toISOString(),
                    updated_at: event.updated_at.toISOString(),
                }
            }));

            return dataResponse.filter(event => event !== null);
        } catch (error) {
            return {
                message: 'Erro ao buscar eventos',
                status: 500,
            }
        }
    }

    async getEventById(event_id: string) {
        try {
            const event = await prisma.event.findFirst({
                where: { id: event_id },
                include: {
                    owner: true,
                    responsible: {
                        include: {
                            person: true,
                        }
                    }
                }
            });

            if (!event) {
                return {
                    message: 'Evento não encontrado',
                    status: 404,
                };
            }
            return {
                id: event.id,
                title: event.title,
                description: event.description,
                date_start: event.date_start.toISOString(),
                date_end: event.date_end ? event.date_end.toISOString() : null,
                location: event.location,
                promoter: event.promoter,
                duration: event.duration,
                province: event.province,
                type_event: event.type_event,
                available: event.available,
                owner: {
                    id: event.owner_id,
                    name: event.owner.name,
                    email: event.owner.email,
                    phone: event.owner.phone,
                },
                responsible: {
                    id: event.responsible_id,
                    name: event.responsible.person.name,
                    email: event.responsible.person.email,
                    phone: event.responsible.person.phone,
                    person_id: event.responsible.person.id,
                    bi: event.responsible.person.bi,
                },
                created_at: event.created_at.toISOString(),
                updated_at: event.updated_at.toISOString(),
            };
        } catch (error) {
            return {
                message: 'Erro ao buscar evento',
                status: 500,
            }
        }
    }

    async updateEvent(event_id: string, data: schema.EventUpdate) {
        const eventExist = await prisma.event.findFirst({
            where: { id: event_id },
            include: {
                owner: true,
                responsible: {
                    include: {
                        person: true,
                    }
                }
            }
        });

        if (!eventExist) {
            return {
                message: 'Evento não encontrado',
                status: 404,
            };
        }

        const updatedEvent = await prisma.event.update({
            where: { id: event_id },
            data: {
                title: data.title || eventExist.title,
                description: data.description || eventExist.description,
                date_start: data.date_start ? new Date(data.date_start) : eventExist.date_start,
                date_end: data.date_end ? new Date(data.date_end) : eventExist.date_end,
                location: data.location || eventExist.location,
                promoter: data.promoter || eventExist.promoter,
                duration: data.duration || eventExist.duration,
                province: data.province || eventExist.province,
                type_event: data.type_event || eventExist.type_event,
                available: typeof data.available === 'boolean' ? data.available : eventExist.available,
            }
        });

        const updatedOwner = await prisma.owner.update({
            where: { id: eventExist.owner_id },
            data: {
                name: data.owner?.name || eventExist.owner.name,
                email: data.owner?.email || eventExist.owner.email,
                phone: data.owner?.phone || eventExist.owner.phone,
            }
        });

        const dataResponse: schema.ResponseEvent = {
            id: updatedEvent.id,
            title: updatedEvent.title,
            description: updatedEvent.description,
            date_start: updatedEvent.date_start.toISOString(),
            date_end: updatedEvent.date_end ? updatedEvent.date_end.toISOString() : null,
            location: updatedEvent.location,
            promoter: updatedEvent.promoter,
            duration: updatedEvent.duration,
            province: updatedEvent.province,
            type_event: updatedEvent.type_event,
            available: updatedEvent.available,
            owner: {
                id: updatedOwner.id,
                name: updatedOwner.name,
                email: updatedOwner.email,
                phone: updatedOwner.phone,
            },
            responsible: {
                id: eventExist.responsible_id,
                name: eventExist.responsible.person.name,
                email: eventExist.responsible.person.email,
                phone: eventExist.responsible.person.phone,
                person_id: eventExist.responsible.person.id,
                bi: eventExist.responsible.person.bi,
            },
            created_at: updatedEvent.created_at.toISOString(),
            updated_at: updatedEvent.updated_at.toISOString(),
        };
        return dataResponse;
    }

    async deleteEvent(event_id: string) {
        const existingEvent = await prisma.event.findUnique({
            where: { id: event_id },
        });

        if (!existingEvent) {
            return {
                message: 'Evento não encontrado',
                status: 404,
            };
        }
        await prisma.event.delete({
            where: { id: event_id },
            select: { owner: true }
        });
        return { 
            message: 'Evento deletado com sucesso',
            status: 200,
        };
    }
}