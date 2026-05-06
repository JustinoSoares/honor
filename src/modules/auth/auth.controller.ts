import { AuthService } from "./auth.service";
import { Response } from "express";
import { env } from "../../env";
import { AuthRequest } from "../../middleware/auth.middleware";

const authService = new AuthService();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "api/v1/auth/refresh",
};

export class AuthController {
  constructor() {}

  async login(req: AuthRequest, res: Response) {
    try {
      const result = await authService.login(req.body);
      if ("status" in result && result.status !== 200) {
        return res.status(result.status).json({ message: result.message });
      }

      if ("refreshToken" in result) {
        res.cookie("refresh_token", result.refreshToken, {
          httpOnly: true, // not accessible via JS
          secure: process.env.NODE_ENV === "production", // HTTPS only in prod
          sameSite: "strict", // CSRF protection
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        });

        return res.status(200).json(result);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao realizar login" });
    }
  }

  async googleAuth(req: AuthRequest, res: Response) {
    try {
      const { url, state } = await authService.googleAuth();
      res.cookie("oauth_state", state, COOKIE_OPTIONS);
      res.redirect(url);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao iniciar autenticação Google" });
    }
  }

  async googleCallback(req: AuthRequest, res: Response) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
      }

      if (typeof code !== "string" || typeof state !== "string") {
        return res.redirect(`${env.FRONTEND_URL}/login?error=invalid_oauth_response`);
      }

      const result = await authService.googleAuthCallback(code, state);

      if ("status" in result && result.status !== 200) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=Autenticação_google_falhou`);
      }

      res.cookie("refresh_token", result.refreshToken, COOKIE_OPTIONS);

      return res.redirect(`${env.FRONTEND_URL}/?access_token=${result.accessToken}`);
    } catch (error) {
      console.error(error);
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }

  async refreshToken(req: AuthRequest, res: Response) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token ausente" });
      }

      const result = await authService.refreshToken(refreshToken);

      if ("status" in result && result.status !== 200) {
        return res.status(result.status as number).json({ message: result.message });
      }

      res.cookie("refresh_token", result.refreshToken, COOKIE_OPTIONS);
      return res.status(200).json({ accessToken: result.accessToken });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao renovar token" });
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (refreshToken) {
        await authService.logout(refreshToken);
        res.clearCookie("refresh_token", COOKIE_OPTIONS);
      }
      return res.status(200).json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao realizar logout" });
    }
  }
}
