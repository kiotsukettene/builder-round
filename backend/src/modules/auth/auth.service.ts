import bcrypt from "bcryptjs";
import { AppError } from "../../errors/app-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import * as authRepository from "./auth.repository.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

const SALT_ROUNDS = 10;

export async function register(data: RegisterInput) {
  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await authRepository.createUser({ ...data, hashedPassword });

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
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

export async function getProfile(userId: string) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
