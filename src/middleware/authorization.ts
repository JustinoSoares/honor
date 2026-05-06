import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/prisma";
import { AuthRequest } from "./auth.middleware";
export const authentication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token de autenticação ausente" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token de autenticação ausente" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user_id: string };

    const existingUser = await prisma.user.findFirst({
      where: { id: decoded.user_id },
    });
    if (!existingUser) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }
    req.userId = existingUser.id;

    next();
  } catch {
    return res.status(401).json({ message: "Token de autenticação inválido" });
  }
};
