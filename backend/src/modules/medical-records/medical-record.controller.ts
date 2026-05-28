import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as medicalRecordService from "./medical-record.service.js";
import { listMedicalRecordsQuerySchema } from "./medical-record.validation.js";

function getAuthUser(req: Request): { userId: string; role: string } {
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId || !role) {
    throw new AppError("Authentication required", 401);
  }

  return { userId, role };
}

export const listMedicalRecords = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const query = listMedicalRecordsQuerySchema.parse(req.query);

    const result = await medicalRecordService.listMedicalRecords(
      userId,
      role,
      query,
    );

    res.status(200).json({
      success: true,
      message: "Medical records retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const getMedicalRecordDetail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const { appointmentId } = req.params;

    if (!appointmentId || Array.isArray(appointmentId)) {
      throw new AppError("Appointment ID is required", 400);
    }

    const record = await medicalRecordService.getMedicalRecordDetail(
      userId,
      role,
      appointmentId,
    );

    res.status(200).json({
      success: true,
      message: "Medical record retrieved successfully",
      data: record,
    });
  },
);
