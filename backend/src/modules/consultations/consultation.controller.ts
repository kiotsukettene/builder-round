import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as consultationService from "./consultation.service.js";
import {
  consultationNoteSchema,
  prescriptionSchema,
  updatePrescriptionSchema,
} from "./consultation.validation.js";

function getAuthUser(req: Request): { userId: string; role: string } {
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId || !role) {
    throw new AppError("Authentication required", 401);
  }

  return { userId, role };
}

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (!value || Array.isArray(value)) {
    throw new AppError(`${name} is required`, 400);
  }
  return value;
}

// ── Session ──

export const joinConsultation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");

    const result = await consultationService.joinConsultation(
      userId,
      role,
      appointmentId,
    );

    res.status(200).json({
      success: true,
      message: "Joined consultation successfully",
      data: result,
    });
  },
);

export const endConsultation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");

    const result = await consultationService.endConsultation(
      userId,
      appointmentId,
    );

    res.status(200).json({
      success: true,
      message: "Consultation ended successfully",
      data: result,
    });
  },
);

// ── Notes ──

export const upsertConsultationNote = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");
    const data = consultationNoteSchema.parse(req.body);

    const note = await consultationService.upsertConsultationNote(
      userId,
      appointmentId,
      data,
    );

    res.status(200).json({
      success: true,
      message: "Consultation note saved",
      data: note,
    });
  },
);

export const getConsultationNote = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");

    const note = await consultationService.getConsultationNote(
      userId,
      role,
      appointmentId,
    );

    res.status(200).json({
      success: true,
      message: "Consultation note retrieved",
      data: note,
    });
  },
);

// ── Prescriptions ──

export const addPrescription = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");
    const data = prescriptionSchema.parse(req.body);

    const prescription = await consultationService.addPrescription(
      userId,
      appointmentId,
      data,
    );

    res.status(201).json({
      success: true,
      message: "Prescription added",
      data: prescription,
    });
  },
);

export const listPrescriptions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");

    const prescriptions = await consultationService.listPrescriptions(
      userId,
      role,
      appointmentId,
    );

    res.status(200).json({
      success: true,
      message: "Prescriptions retrieved",
      data: prescriptions,
    });
  },
);

export const updatePrescription = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");
    const prescriptionId = getParam(req, "prescriptionId");
    const data = updatePrescriptionSchema.parse(req.body);

    const prescription = await consultationService.updatePrescription(
      userId,
      appointmentId,
      prescriptionId,
      data,
    );

    res.status(200).json({
      success: true,
      message: "Prescription updated",
      data: prescription,
    });
  },
);

export const deletePrescription = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");
    const prescriptionId = getParam(req, "prescriptionId");

    await consultationService.deletePrescription(
      userId,
      appointmentId,
      prescriptionId,
    );

    res.status(200).json({
      success: true,
      message: "Prescription deleted",
    });
  },
);

// ── Medical Record ──

export const getMedicalRecord = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const appointmentId = getParam(req, "appointmentId");

    const record = await consultationService.getMedicalRecord(
      userId,
      role,
      appointmentId,
    );

    res.status(200).json({
      success: true,
      message: "Medical record retrieved",
      data: record,
    });
  },
);
