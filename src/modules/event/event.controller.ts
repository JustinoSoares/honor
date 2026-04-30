import { EventService } from "./event.service";
import { Request, Response } from "express";


const service = new EventService();
export class EventController {
    constructor() { }

    async createEvent(req: Request | any, res: Response) {
        const user_id = req.userId;
        try {
            const event = await service.createEvent(req.body, user_id);
            if ('status' in event && event.status !== 200) {
                return res.status(event.status).json({ message: event.message });
            }
            return res.status(201).json(event);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao criar evento' });
        }
    }

    async getAllEvents(req: Request, res: Response) {
        try {
            const { limit, page, search } = req.query;

            const events = await service.getAllEvents(
                Number(limit) || 10,
                Number(page) || 1,
                search ? String(search) : ''
            );

            if ('status' in events && events.status !== 200) {
                return res.status(events.status).json({ message: events.message });
            }

            return res.status(200).json(events);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar eventos' });
        }
    }

    async getEventById(req: Request, res: Response) {
        try {
            const { event_id } = req.params;
            const event = await service.getEventById(event_id as string);

            if (!event) {
                return res.status(404).json({ message: 'Evento não encontrado' });
            }

            if ('status' in event && event.status !== 200) {
                return res.status(event.status!).json({ message: event.message });
            }
            return res.status(200).json(event);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar evento' });
        }
    }

    async updateEvent(req: Request | any, res: Response) {
        try {
            const { event_id } = req.params;
            const eventData = req.body;
            const event = await service.updateEvent(event_id as string, eventData);
            if (!event) {
                return res.status(404).json({ message: 'Evento não encontrado' });
            }
            if ('status' in event && event.status !== 200) {
                return res.status(event.status!).json({ message: event.message });
            }
            return res.status(200).json(event);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao atualizar evento' });
        }
    }

    async deleteEvent(req: Request | any, res: Response) {
        try {
            const { event_id } = req.params;
            const result = await service.deleteEvent(event_id as string);
            if (!result) {
                return res.status(404).json({ message: 'Evento não encontrado' });
            }
    
            if ('status' in result && result.status !== 200) {
                return res.status(result.status!).json({ message: result.message });
            }

            return res.status(result.status!).json({ message: result.message });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao deletar evento' });
        } 
    }
}