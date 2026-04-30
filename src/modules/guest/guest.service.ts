// import prisma from '../../database/prisma';
// import { generateQRCode } from '../../utils/generate_qr';
// import * as schema from './guest.schema';

// const baseUrl = process.env.URL_BASE_LINK || 'http://localhost:3000/guest';
// export class GuestService {
//     async createGuest(event_id: string, data: schema.GuestCreate) : Promise<schema.ResponseGuest | { status: number, message: string }> {
//         const guest = await prisma.guest.create({
//             data: {
//                 name: data.name,
//                 email: data.email,
//                 phone: data.phone,
//                 event_id
//             },
//         });

//         const qrCode = await generateQRCode(guest.id);

//         const link = `${baseUrl}/${guest.id}`;
//         const updatedGuest = await prisma.guest.update({
//             where: { id: guest.id },
//             data: {
//                 qr_code: qrCode,
//                 link
//             },
//         });

//         const dataResponse = {
//             id: updatedGuest.id,
//             name: updatedGuest.name,
//             email: updatedGuest.email,
//             phone: updatedGuest.phone,
//             qr_code: updatedGuest.qr_code,
//             link: updatedGuest.link
//         };

//         return dataResponse;
//     }

//     async getGuestsByEventId(event_id: string, limit: number, offset: number, search?: string) {
//         if (!event_id) {
//             return {
//                 status: 400,
//                 message: 'O ID do evento é obrigatório',
//             }
//         }

//         const whereClause: any = { event_id };

//         if (search) {
//             whereClause.OR = [
//                 { name: { contains: search, mode: 'insensitive' } },
//                 { email: { contains: search, mode: 'insensitive' } },
//                 { phone: { contains: search, mode: 'insensitive' } },
//             ];
//         }
//         return await prisma.guest.findMany({
//             where: {
//                 event_id: event_id,
//                 ...whereClause
//             },
//             take: limit,
//             skip: offset
//         });
//     }

//     async getGuestById(guest_id: string) : Promise<schema.ResponseGuest | { status: number, message: string } | null> {
//         if (!guest_id) {
//             return {
//                 status: 400,
//                 message: 'O ID do convidado é obrigatório',
//             }
//         }
//         return await prisma.guest.findFirst({
//             where: { id: guest_id },
//         });
//     }

//     async deleteGuest(guest_id: string) : Promise<{ status: number, message: string }> {
//         if (!guest_id) {
//             return {
//                 status: 400,
//                 message: 'O ID do convidado é obrigatório',
//             }
//         }
//         await prisma.guest.delete({
//             where: { id: guest_id },
//         });
//         return {
//             status: 200,
//             message: 'Convidado deletado com sucesso'
//         };
//     }
// }