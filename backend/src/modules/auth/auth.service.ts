import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../../lib/email/index.js";
import { AppError } from "../../errors/app-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { hashToken } from "../../utils/token-hash.js";
import * as authRepository from "./auth.repository.js";
import { RESEND_VERIFICATION_COOLDOWN_MS } from "./auth.constants.js";
import type {
  RegisterInput,
  LoginInput,
  ResendVerificationInput,
} from "./auth.validation.js";

const SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function generateVerificationToken(): {
  rawToken: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  return { rawToken, hashedToken, expiresAt };
}

function getFirstName(user: {
  patient?: { firstName: string } | null;
  doctor?: { firstName: string } | null;
}): string {
  return user.patient?.firstName ?? user.doctor?.firstName ?? "there";
}

function assertResendCooldown(lastSentAt: Date | null): void {
  if (!lastSentAt) {
    return;
  }

  const elapsedMs = Date.now() - lastSentAt.getTime();
  if (elapsedMs < RESEND_VERIFICATION_COOLDOWN_MS) {
    throw new AppError(
      "Please wait 30 seconds before requesting another verification email",
      429,
    );
  }
}

async function createAndSendVerificationToken(user: {
  id: string;
  email: string;
  patient?: { firstName: string } | null;
  doctor?: { firstName: string } | null;
}): Promise<void> {
  const { rawToken, hashedToken, expiresAt } = generateVerificationToken();

  await authRepository.setVerificationToken(user.id, hashedToken, expiresAt);
  await sendVerificationEmail({
    to: user.email,
    firstName: getFirstName(user),
    token: rawToken,
  });
}

export async function register(data: RegisterInput) {
  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const { rawToken, hashedToken, expiresAt } = generateVerificationToken();
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await authRepository.createUser({
    ...data,
    hashedPassword,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: expiresAt,
    lastVerificationEmailSentAt: new Date(),
  });

  await sendVerificationEmail({
    to: user.email,
    firstName: data.firstName,
    token: rawToken,
  });

  return { user };
}

export async function verifyEmail(token: string): Promise<void> {
  const hashedToken = hashToken(token);
  const user = await authRepository.findUserByVerificationToken(hashedToken);

  if (!user) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  if (user.emailVerified) {
    throw new AppError("Email is already verified", 409);
  }

  if (
    !user.emailVerificationExpires ||
    user.emailVerificationExpires < new Date()
  ) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  await authRepository.markEmailVerified(user.id);
}

export async function resendVerification(
  data: ResendVerificationInput,
): Promise<void> {
  const user = await authRepository.findUserByEmail(data.email);

  if (!user) {
    return;
  }

  if (user.emailVerified) {
    throw new AppError("Email is already verified", 409);
  }

  assertResendCooldown(user.lastVerificationEmailSentAt);

  await createAndSendVerificationToken(user);
}

export async function login(data: LoginInput) {
  const user = await authRepository.findUserByEmail(data.email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.emailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refresh(token: string) {
  try {
    if (await authRepository.isRefreshTokenRevoked(hashToken(token))) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const payload = verifyRefreshToken(token);
    const user = await authRepository.findUserById(payload.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    return { accessToken };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid or expired refresh token", 401);
  }
}

export async function logout(userId: string, refreshToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.userId !== userId) {
      throw new AppError("Invalid refresh token", 401);
    }

    const decoded = jwt.decode(refreshToken) as jwt.JwtPayload | null;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date();

    await authRepository.revokeRefreshToken(
      hashToken(refreshToken),
      expiresAt,
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid or expired refresh token", 401);
  }
}

export async function getProfile(userId: string) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
