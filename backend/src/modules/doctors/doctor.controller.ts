import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as doctorService from "./doctor.service.js";
import {
  completeProfileSchema,
  updateProfileSchema,
} from "./doctor.validation.js";

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

export const getProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const doctor = await doctorService.getProfile(getUserId(req));

    res.status(200).json({
      success: true,
      message: "Doctor profile retrieved successfully",
      data: doctor,
    });
  },
);

export const completeProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = completeProfileSchema.parse(req.body);
    const doctor = await doctorService.completeProfile(getUserId(req), data);

    res.status(200).json({
      success: true,
      message: "Doctor profile completed successfully",
      data: doctor,
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = updateProfileSchema.parse(req.body);
    const doctor = await doctorService.updateProfile(getUserId(req), data);

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  },
);

export const uploadProfilePicture = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await doctorService.uploadProfilePicture(
      getUserId(req),
      req.file,
    );

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: result,
    });
  },
);
