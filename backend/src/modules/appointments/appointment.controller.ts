import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as appointmentService from "./appointment.service.js";
import {
  bookAppointmentSchema,
  cancelAppointmentSchema,
  listAppointmentsQuerySchema,
  rescheduleAppointmentSchema,
} from "./appointment.validation.js";

function getAuthUser(req: Request): { userId: string; role: string } {
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId || !role) {
    throw new AppError("Authentication required", 401);
  }

  return { userId, role };
}

function getAppointmentId(req: Request): string {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new AppError("Appointment ID is required", 400);
  }

  return id;
}

export const bookAppointment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuthUser(req);
    const data = bookAppointmentSchema.parse(req.body);
    const appointment = await appointmentService.bookAppointment(userId, data);

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  },
);

export const cancelAppointment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const data = cancelAppointmentSchema.parse(req.body);
    const appointment = await appointmentService.cancelAppointment(
      userId,
      role,
      getAppointmentId(req),
      data,
    );

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  },
);

export const confirmAppointment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const appointment = await appointmentService.confirmAppointment(
      userId,
      role,
      getAppointmentId(req),
    );

    res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully",
      data: appointment,
    });
  },
);

export const rescheduleAppointment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = getAuthUser(req);
    const data = rescheduleAppointmentSchema.parse(req.body);
    const appointment = await appointmentService.rescheduleAppointment(
      userId,
      getAppointmentId(req),
      data,
    );

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment,
    });
  },
);

export const getMyAppointments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const query = listAppointmentsQuerySchema.parse(req.query);
    const result = await appointmentService.getMyAppointments(
      userId,
      role,
      query,
    );

    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const getAppointmentById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = getAuthUser(req);
    const appointment = await appointmentService.getAppointmentById(
      userId,
      role,
      getAppointmentId(req),
    );

    res.status(200).json({
      success: true,
      message: "Appointment retrieved successfully",
      data: appointment,
    });
  },
);
