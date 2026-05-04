import {  Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "./auth.middleware";

export const validate =
  (schema: ZodSchema) => (req: AuthRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      //const errors = z.treeifyError(result.error);

      return res.status(400).json({
        message: result.error.issues[0]?.message,
      });
    }

    req.body = result.data;
    next();
  };
