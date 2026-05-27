import { rateLimit } from "express-rate-limit";
import { RESEND_VERIFICATION_COOLDOWN_MS } from "../modules/auth/auth.constants.js";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const resendVerificationLimiter = rateLimit({
  windowMs: RESEND_VERIFICATION_COOLDOWN_MS,
  limit: 1,
  keyGenerator: (req) => {
    const email = req.body?.email;
    if (typeof email === "string" && email.trim()) {
      return `resend:${email.trim().toLowerCase()}`;
    }
    return req.ip ?? "unknown";
  },
  message: {
    success: false,
    message: "Please wait 30 seconds before requesting another verification email",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
