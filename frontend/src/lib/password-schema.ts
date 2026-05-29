import { z } from "zod"

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((v) => /[a-z]/.test(v), "Password must contain at least one lowercase letter")
  .refine((v) => /[A-Z]/.test(v), "Password must contain at least one uppercase letter")
  .refine((v) => /\d/.test(v), "Password must contain at least one number")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Password must contain at least one special character")
