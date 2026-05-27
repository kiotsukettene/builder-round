import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../errors/app-error.js";
import * as authRepository from "../modules/auth/auth.repository.js";
import * as patientRepository from "../modules/patients/patient.repository.js";
import { isPatientProfileComplete } from "../modules/patients/patient.utils.js";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("Insufficient permissions", 403);
    }

    next();
  };
}

export async function requireVerifiedEmail(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user?.userId) {
    throw new AppError("Authentication required", 401);
  }

  const user = await authRepository.findUserById(req.user.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.emailVerified) {
    throw new AppError(
      "Please verify your email to access this resource",
      403,
    );
  }

  next();
}

export async function requireCompleteProfile(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user?.userId) {
    throw new AppError("Authentication required", 401);
  }

  const patient = await patientRepository.findPatientByUserId(req.user.userId);
  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }

  if (!isPatientProfileComplete(patient)) {
    throw new AppError("Please complete your profile to access this feature", 403);
  }

  next();
}
