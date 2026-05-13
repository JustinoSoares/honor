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
import { generateCode } from "../../utils/generate_code";
import { sendVerificationEmail } from "../../utils/send-mail";
import { notify } from "../../utils/notify";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "api/v1/auth/refresh",
};

type RefreshTokenPayload = {
  user_id : string,
  email: string,
  role: string,
  verified: boolean,
  is_active : boolean
}

export class AuthService {
  constructor() { }

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

    if (!user.is_active) {
      return {
        message: "A sua conta está bloqueada. Contacte o administrador.",
        status: 403,
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
      is_active: user.is_active,
    };

    const tokens = generateTokens(payload);

    await storeRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    } as schema.ResponseLogin;
  }

  async sendCodeOnEmail(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return {
        message:
          "Não encontramos nenhuma conta com este email. Verifique o email e tente novamente.",
        status: 404,
      };
    }

    const code = generateCode();

    await sendVerificationEmail(email, code);

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        reset_code: await bcrypt.hash(code, 10),
        reset_expire: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return {
      message: "Código enviado com sucesso",
      status: 200,
    };
  }

  async checkCode(email: string, code: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return {
        message:
          "Não encontramos nenhuma conta com este email. Verifique o email e tente novamente.",
        status: 401,
      };
    }

    if (user.verified) {
      return {
        message: "A sua conta já está verificada. Pode fazer login normalmente.",
        status: 400,
      };
    }

    const isCodeValid = await bcrypt.compare(code, user?.reset_code ?? "");

    if (!isCodeValid) {
      return {
        message: "O código inserido está incorreto. Verifique o email e tente novamente.",
        status: 401,
      };
    }

    if (user?.reset_expire && user.reset_expire < new Date()) {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          reset_code: null,
          reset_expire: null,
        },
      });


      return {
        message: "O seu código de verificação expirou. Por favor, solicite um novo código.",

        status: 401,
      };
    }

    await prisma.user.update({
      where: { email },
      data: {
        reset_code: null,
        reset_expire: null,
        verified: true,
      },
    });

    // Notifica o utilizador que a conta foi verificada com sucesso
    await notify(user.id, "A sua conta foi verificada com sucesso! Bem-vindo à Honor.", {
      type: "account_verified",
    });

    return {
      message: "Verificação realizada com sucesso",
      status: 200,
    };
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
        message:
          "Sessão de login expirada ou inválida. Por favor, tente iniciar a autenticação com o Google novamente.",

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
        message:
          "Não foi possível obter o seu email do Google. Certifique-se de que a sua conta Google tem um email público.",

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
      is_active: user.is_active,
    };

    const { accessToken, refreshToken } = generateTokens(payload);
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
    let payload: RefreshTokenPayload;
    try {
      payload = verifyRefreshToken(oldToken);
    } catch {
      return {
        message: "A sua sessão expirou. Por favor, faça login novamente.",
        status: 401,
      };
    }

    // 2. Validate the token is still stored (not revoked)
   /* const isValid = await validateRefreshToken(payload.user_id, oldToken);
    if (!isValid) {
      return {
        message: "A sua sessão expirou. Por favor, faça login novamente.",
        status: 401,
      };
    }*/

    // 3. Check user is still active
    const user = await prisma.user.findUnique({ where: { id: payload.user_id } });
    if (!user || !user.is_active) {
      await revokeRefreshToken(payload.user_id);
      return {
        message: "A sua conta está bloqueada. Contacte o administrador.",
        status: 403,
      };
    }

    // 4. Build a fresh payload — never mutate the decoded token

    const updatedPayload: RefreshTokenPayload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      is_active: user.is_active,
    }

    const { accessToken, refreshToken } = generateTokens(updatedPayload);

    // 5. Revoke old token first, then store the new one atomically
    //    Using a transaction or sequential ops to avoid inconsistent state
    try {
      await revokeRefreshToken(payload.user_id); // Invalidate old token first

      await Promise.all([
        storeRefreshToken(payload.user_id, refreshToken),
        prisma.user.update({
          where: { id: payload.user_id },
          data: { refreshToken },
        }),
      ]);
    } catch {
      // If storage fails, the old token is already revoked — force re-login
      return {
        message: "Erro ao renovar sessão. Por favor, faça login novamente.",
        status: 500,
      };
    }

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
