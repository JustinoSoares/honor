import express from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import * as auth from "./auth.schema";

const router = express.Router();
const authController = new AuthController();

router.post("/login", validate(auth.LoginSchema), authController.login);

router.get("/google", authController.googleAuth);

router.get("/google/callback", authController.googleCallback);

router.post(
  "/refresh",
  validate(auth.RefreshTokenSchema),
  authController.refreshToken,
);

router.post("/logout", authController.logout);

export default router;
