import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as patientService from "./patient.service.js";
import {
  completeProfileSchema,
  updateProfileSchema,
} from "./patient.validation.js";

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

export const completeProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = completeProfileSchema.parse(req.body);
    const patient = await patientService.completeProfile(getUserId(req), data);

    res.status(200).json({
      success: true,
      message: "Patient profile completed successfully",
      data: patient,
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = updateProfileSchema.parse(req.body);
    const patient = await patientService.updateProfile(getUserId(req), data);

    res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      data: patient,
    });
  },
);

export const uploadProfilePicture = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await patientService.uploadProfilePicture(
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
