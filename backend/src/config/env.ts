import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRATION: z.string().default("1h"),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),
});

export const env = envSchema.parse(process.env);
