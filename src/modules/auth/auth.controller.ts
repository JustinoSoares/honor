// import { AuthService } from "./auth.service";
// import { Request, Response } from 'express';

// const authService = new AuthService();

// export class AuthController {
//     constructor() { }

//     async login(req: Request, res: Response) {
//         try {
//             const result = await authService.login(req.body);
//             if ('status' in result && result.status !== 200) {
//                 return res.status(result.status).json({ message: result.message });
//             }
//             return res.status(200).json(result);
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({ message: 'Erro ao realizar login' });
//         }
//     }
// }