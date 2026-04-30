import prisma from "../../database/prisma";
import * as schema from "./auth.schema";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  constructor() {}

  async login(data: schema.LoginData) {
    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
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
      user_id: user.id,
      email: user.email,
      role : user.role,
      verified: user.verified,
    };

    const JWT_SECRET = process.env.JWT_SECRET;

    const token = jwt.sign(payload, JWT_SECRET!);

    return {
      token,
    } as schema.ResponseLogin;
  }
}
