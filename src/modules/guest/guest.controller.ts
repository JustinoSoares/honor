import { GuestService } from './guest.service';
import { Request, Response } from 'express';
import * as schema from './guest.schema';

const service = new GuestService();

export class GuestController {
    constructor() { }

    async createGuest(req: Request, res: Response) {
        try {
            let { event_id } = req.params;
            const { data } = req.body;

            event_id = String(event_id);

            const guest = await service.createGuest(event_id as string, data as schema.GuestCreate);
            if ('status' in guest && guest.status !== 200) {
                return res.status(guest.status).json({ message: guest.message });
            }
            return res.status(201).json(guest);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao criar convidado' });
        }
    }

    async getGuestsByEventId(req: Request, res: Response) {
        try {
            let { event_id } = req.params;
            const { limit, page, search } = req.query;

            event_id = String(event_id);

            const guests = await service.getGuestsByEventId(
                event_id,
                Number(limit) || 10,
                Number(page) || 1,
                search ? String(search) : ''
            );

            if ('status' in guests && guests.status !== 200) {
                return res.status(guests.status).json({ message: guests.message });
            }

            return res.status(200).json(guests);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar convidados' });
        }
    }

    async getGuestById(req: Request, res: Response) {
        try {
            let { guest_id } = req.params;

            guest_id = String(guest_id);

            const guest = await service.getGuestById(guest_id);

            if (!guest) {
                return res.status(404).json({ message: 'Convidado não encontrado' });
            }

            if ('status' in guest && guest.status !== 200) {
                return res.status(guest.status).json({ message: guest.message });
            }
            return res.status(200).json(guest);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar convidado' });
        }
    }

    async deleteGuest(req: Request, res: Response) {
        try {
            let { guest_id } = req.params;

            guest_id = String(guest_id);

            const result = await service.deleteGuest(guest_id);

            return res.status(result.status).json({ message: result.message });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao deletar convidado' });
        }
    }
}