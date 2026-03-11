import { EventService } from "./event.service";

export class EventController {
    constructor(private eventService: EventService) { }

    async createEvent(req: any, res: any) {
        try {
            const event = await this.eventService.createEvent(req.body);
            return res.status(201).json(event);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao criar evento' });
        }
    }

    async getAllEvents(req: any, res: any) {
        try {
            const { limit, page, search } = req.query;
            const events = await this.eventService.getAllEvents(
                Number(limit) || 10,
                Number(page) || 1,
                String(search) || ''
            );

            return res.status(200).json(events);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar eventos' });
        }
    }

    async getEventById(req: any, res: any) {
        try {
            const { id } = req.params;
            const event = await this.eventService.getEventById(id);

            if (!event) {
                return res.status(404).json({ message: 'Evento não encontrado' });
            }

            return res.status(200).json(event);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar evento' });
        }
    }
}
        