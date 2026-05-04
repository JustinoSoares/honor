import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/prisma";
export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token de autenticação ausente" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token de autenticação ausente" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    const existingUser = await prisma.user.findFirst({
      where: { id: decoded.userId },
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
