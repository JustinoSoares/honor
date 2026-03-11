import prisma from "../../database/prisma";
import * as schema from "./auth.schema";
import * as bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken"

export class AuthService {
    constructor() { }

    async login(data: schema.LoginData) {
        const user = await prisma.user.findFirst({
            where: {
                person: {
                    email: data.email,
                },
            },
            include: {
                person: true,
            },
        });

        if (!user) {
            return {
                message: "Email ou senha incorretos",
                status: 401,
            };
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            return {
                message: "Email ou senha incorretos",
                status: 401,
            };
        }
        const payload = {
            userId: user.id,
            email: user.person.email,
        };

        const JWT_SECRET = process.env.JWT_SECRET

        const token = jwt.sign(payload, JWT_SECRET!);

        return {
            token,
        } as schema.ResponseLogin;
    }
}