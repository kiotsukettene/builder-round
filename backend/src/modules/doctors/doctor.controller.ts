import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as doctorService from "./doctor.service.js";
import {
  completeProfileSchema,
  listDoctorsQuerySchema,
  updateProfileSchema,
} from "./doctor.validation.js";
import { z } from "zod";

const slotsQuerySchema = z.object({
  date: z.string().min(1, "date query parameter is required"),
});

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

function getDoctorId(req: Request): string {
  const id = req.params.id;
  if (!id || Array.isArray(id)) {
    throw new AppError("Doctor ID is required", 400);
  }

  return id;
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

export const listDoctors = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = listDoctorsQuerySchema.parse(req.query);
    const result = await doctorService.listDoctors(query);

    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const getDoctorById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const doctor = await doctorService.getDoctorById(getDoctorId(req));

    res.status(200).json({
      success: true,
      message: "Doctor retrieved successfully",
      data: doctor,
    });
  },
);

export const getAvailableSlots = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { date } = slotsQuerySchema.parse(req.query);
    const result = await doctorService.getAvailableSlots(getDoctorId(req), date);

    res.status(200).json({
      success: true,
      message: "Available slots retrieved successfully",
      data: result,
    });
  },
);
