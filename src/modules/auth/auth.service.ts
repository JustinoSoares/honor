import prisma from "../../database/prisma";
import * as schema from "./auth.schema";
import * as bcrypt from "bcrypt";
import { env } from "../../env";
import { generateTokens, verifyRefreshToken } from "./token.service";
import { generateState, consumeState } from "./oauthState";
import { OAuth2Client } from "google-auth-library";
import { oauth2Client, SCOPES } from "../../config/google";
import crypto from "crypto";

import {
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
} from "./refreshToken.service";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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
      role: user.role,
      verified: user.verified,
    };

    const tokens = generateTokens(payload);

    await storeRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    } as schema.ResponseLogin;
  }

  async googleAuth() {
    const state = await generateState();

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      state,
      prompt: "consent",
    });

    return { url, state };
  }

  async googleAuthCallback(code: string, state: string) {
    // consumeState é atômico (GETDEL) — valida e deleta em uma única operação
    const stateValid = await consumeState(state as string);
    if (!stateValid) {
      return {
        message: "Estado inválido ou expirado",
        status: 400,
      };
    }

    // Troca o code pelo token e informações do usuário
    const { tokens } = await oauth2Client.getToken(code as string);

    // Verifica o ID token e extrai os dados do usuário
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: email, name } = ticket.getPayload()!;

    if (!email) {
      return {
        message: "Email não disponível no perfil do Google",
        status: 400,
      };
    }

    const user = await prisma.user.upsert({
      where: { email: email },
      update: {
        email: email ?? "",
      },
      create: {
        email: email,
        name: name ?? "",
        phone: "",
        password: crypto.randomBytes(20).toString("hex"), // senha aleatória, pois o login é via Google
        role: "USER",
        verified: true,
      },
    });

    const payload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    // Persiste no Valkey (lookup rápido) e no Postgres (durabilidade)
    await Promise.all([
      storeRefreshToken(user.id, refreshToken),
      prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      }),
    ]);

    //res.cookie("refresh_token", refreshToken, COOKIE_OPTIONS);
    return { accessToken, refreshToken };
  }

  async refreshToken(oldToken: string) {
    const payload = verifyRefreshToken(oldToken);

    const isValid = await validateRefreshToken(payload.user_id, oldToken);
    if (!isValid) {
      return {
        message: "Refresh token inválido ou expirado",
        status: 401,
      };
    }

    const { accessToken, refreshToken } = generateTokens(payload);

    // Rotação: sobrescreve o token antigo atomicamente
    await Promise.all([
      storeRefreshToken(payload.user_id, refreshToken), // Sobrescreve o token no Valkey
      prisma.user.update({
        where: { id: payload.user_id },
        data: { refreshToken: refreshToken },
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        // Revoga instantaneamente no Valkey — sem esperar TTL do JWT
        await Promise.all([
          revokeRefreshToken(payload.user_id),
          prisma.user.update({
            where: { id: payload.user_id },
            data: { refreshToken: null },
          }),
        ]);
      } catch {
        // Token já expirado — tudo bem, só limpa o cookie
      }
    }
  }
}
