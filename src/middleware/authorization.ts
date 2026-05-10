import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/prisma";
import { AuthRequest } from "./auth.middleware";
export const authentication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "É necessário fazer login para aceder a esta funcionalidade." });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "É necessário fazer login para aceder a esta funcionalidade." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user_id: string };

    const existingUser = await prisma.user.findFirst({
      where: { id: decoded.user_id },
    });
    if (!existingUser) {
      return res.status(401).json({ message: "A sua sessão é inválida. Por favor, faça login novamente." });
    }
    if (!existingUser.verified) {
      return res.status(400).json({ message: "A sua conta ainda não está verificada. Verifique o seu email e introduza o código de verificação." });
    }

    req.userId = existingUser.id;

    next();
  } catch {
    return res.status(401).json({ message: "A sua sessão expirou ou é inválida. Por favor, faça login novamente." });
  }
};
