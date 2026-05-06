import { z } from "zod";
import type { StringValue } from "ms";
import * as dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  URL_BASE_LINK: z.string().url(),
  FRONTEND_URL: z.string().url(),

  PORT: z.string().transform(Number),

  BASE_API_URL: z.string().url(),
  DEFAULT_ENCRYPTION_KEY: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),

  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),

  JWT_EXPIRES_IN: z.custom<StringValue>(),
  JWT_REFRESH_EXPIRES_IN: z.custom<StringValue>(),

  NODE_ENV: z.enum(["development", "production", "test"]),

  VALKEY_HOST: z.string().min(1),
  VALKEY_PORT: z.string().transform(Number),
  VALKEY_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(process.env);
