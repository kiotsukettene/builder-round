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
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  FRONTEND_URL: z.string().url(),
  MAIL_FROM: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

const parsed = envSchema.parse(process.env);

if (parsed.NODE_ENV === "production" && !parsed.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is required when NODE_ENV=production");
}

if (
  parsed.NODE_ENV !== "production" &&
  (!parsed.SMTP_USER || !parsed.SMTP_PASSWORD)
) {
  throw new Error(
    "SMTP_USER and SMTP_PASSWORD are required when NODE_ENV=development",
  );
}

export const env = parsed;
