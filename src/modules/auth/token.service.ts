import jwt from "jsonwebtoken";
import { env } from "../../env";

interface TokenPayload {
  user_id: string;
  email: string;
  role: string;
  verified: boolean;
  is_active: boolean;
}

export function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN, // 15 minutos
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN, // 7 dias
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  const { user_id, email, role, verified, is_active } = decoded as TokenPayload;
  return { user_id, email, role, verified, is_active } as TokenPayload;
}
