import { AppError } from "../../errors/app-error.js";
import { sendNotification } from "../../lib/notification.js";
import * as appointmentRepository from "./appointment.repository.js";
import * as patientRepository from "../patients/patient.repository.js";
import * as doctorRepository from "../doctors/doctor.repository.js";
import { toAppointmentDto } from "./appointment.utils.js";
import {
  addMinutesToTimeStr,
  formatAppointmentDateTime,
  getWallClockParts,
} from "../../utils/schedule-datetime.js";
import type {
  BookAppointmentInput,
  ListAppointmentsQueryInput,
  RescheduleAppointmentInput,
} from "./appointment.validation.js";

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED"] as const;
const RESCHEDULABLE_STATUSES = ["PENDING", "CONFIRMED"] as const;

function requireFutureDate(scheduledAt: Date): void {
  if (scheduledAt <= new Date()) {
    throw new AppError("Appointment must be scheduled for a future date and time", 400);
  }
}

function isSlotWithinAvailability(
  scheduledAt: Date,
  durationMinutes: number,
  availabilities: { dayOfWeek: number; startTime: string; endTime: string }[],
): boolean {
  const wall = getWallClockParts(scheduledAt);
  const endStr = addMinutesToTimeStr(wall.timeStr, durationMinutes);

  return availabilities.some((window) => {
    if (window.dayOfWeek !== wall.dayOfWeek) return false;
    return wall.timeStr >= window.startTime && endStr <= window.endTime;
  });
}

async function getPatientOrThrow(userId: string) {
  const patient = await patientRepository.findPatientByUserId(userId);
  if (!patient) {
    throw new AppError("Patient profile not found", 404);
  }

  return patient;
}

async function getDoctorWithAvailabilityOrThrow(doctorId: string) {
  const result = await doctorRepository.findDoctorById(doctorId);
  if (!result) {
    throw new AppError("Doctor not found", 404);
  }

  return result.doctor;
}

async function getAppointmentOrThrow(id: string) {
  const appointment = await appointmentRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  return appointment;
}

export async function bookAppointment(
  patientUserId: string,
  input: BookAppointmentInput,
) {
  const scheduledAt = new Date(input.scheduledAt);
  requireFutureDate(scheduledAt);

  // Fetch patient, doctor, and blocked-date status all at once
  const [patient, doctor, isBlocked] = await Promise.all([
    getPatientOrThrow(patientUserId),
    getDoctorWithAvailabilityOrThrow(input.doctorId),
    appointmentRepository.isDateBlockedForDoctor(input.doctorId, scheduledAt),
  ]);

  if (!isSlotWithinAvailability(scheduledAt, doctor.consultationDuration, doctor.availabilities)) {
    throw new AppError(
      "The requested time slot is outside the doctor's availability",
      400,
    );
  }

  if (isBlocked) {
    throw new AppError("The doctor is not available on this date", 400);
  }

  const result = await appointmentRepository.createAppointmentSafe({
    patientId: patient.id,
    doctorId: doctor.id,
    scheduledAt,
    durationMinutes: doctor.consultationDuration,
  });

  if (result.conflict) {
    throw new AppError(
      "This time slot is already booked. Please choose another time.",
      409,
    );
  }

  const { appointment } = result;

  await sendNotification({
    userId: appointment.doctor.user.id,
    type: "APPOINTMENT_BOOKED",
    title: "New Appointment Booked",
    message: `${patient.firstName} ${patient.lastName} has booked an appointment on ${formatAppointmentDateTime(scheduledAt)}.`,
    relatedId: appointment.id,
  });

  return toAppointmentDto(appointment);
}

export async function cancelAppointment(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  const isPatient = role === "PATIENT" && appointment.patient.userId === userId;
  const isDoctor = role === "DOCTOR" && appointment.doctor.userId === userId;

  if (!isPatient && !isDoctor) {
    throw new AppError("You do not have permission to cancel this appointment", 403);
  }

  if (
    !CANCELLABLE_STATUSES.includes(
      appointment.status as (typeof CANCELLABLE_STATUSES)[number],
    )
  ) {
    throw new AppError(
      `Cannot cancel an appointment with status ${appointment.status}`,
      400,
    );
  }

  const updated = await appointmentRepository.updateAppointmentStatus(
    appointmentId,
    "CANCELLED",
  );

  const notifyUserId = isPatient
    ? appointment.doctor.user.id
    : appointment.patient.user.id;

  const notifyName = isPatient
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
    : `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

  await sendNotification({
    userId: notifyUserId,
    type: "APPOINTMENT_CANCELLED",
    title: "Appointment Cancelled",
    message: `Your appointment on ${formatAppointmentDateTime(appointment.scheduledAt)} has been cancelled by ${notifyName}.`,
    relatedId: appointment.id,
  });

  return toAppointmentDto(updated);
}

export async function rescheduleAppointment(
  patientUserId: string,
  appointmentId: string,
  input: RescheduleAppointmentInput,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  if (appointment.patient.userId !== patientUserId) {
    throw new AppError(
      "You do not have permission to reschedule this appointment",
      403,
    );
  }

  if (
    !RESCHEDULABLE_STATUSES.includes(
      appointment.status as (typeof RESCHEDULABLE_STATUSES)[number],
    )
  ) {
    throw new AppError(
      `Cannot reschedule an appointment with status ${appointment.status}`,
      400,
    );
  }

  const scheduledAt = new Date(input.scheduledAt);
  requireFutureDate(scheduledAt);

  // Fetch doctor profile and blocked-date status in parallel
  const [doctor, isBlocked] = await Promise.all([
    getDoctorWithAvailabilityOrThrow(appointment.doctor.id),
    appointmentRepository.isDateBlockedForDoctor(appointment.doctor.id, scheduledAt),
  ]);

  if (!isSlotWithinAvailability(scheduledAt, doctor.consultationDuration, doctor.availabilities)) {
    throw new AppError(
      "The requested time slot is outside the doctor's availability",
      400,
    );
  }

  if (isBlocked) {
    throw new AppError("The doctor is not available on this date", 400);
  }

  const result = await appointmentRepository.updateAppointmentScheduleSafe(
    appointmentId,
    appointment.doctor.id,
    scheduledAt,
    doctor.consultationDuration,
  );

  if (result.conflict) {
    throw new AppError(
      "This time slot is already booked. Please choose another time.",
      409,
    );
  }

  const { appointment: updated } = result;

  await sendNotification({
    userId: appointment.doctor.user.id,
    type: "SCHEDULE_UPDATED",
    title: "Appointment Rescheduled",
    message: `${appointment.patient.firstName} ${appointment.patient.lastName} has rescheduled their appointment to ${formatAppointmentDateTime(scheduledAt)}.`,
    relatedId: appointment.id,
  });

  return toAppointmentDto(updated);
}

export async function getMyAppointments(
  userId: string,
  role: string,
  query: ListAppointmentsQueryInput,
) {
  const { page, limit } = query;

  if (role === "PATIENT") {
    const patient = await getPatientOrThrow(userId);
    const { appointments, total } =
      await appointmentRepository.findAppointmentsByPatientId(
        patient.id,
        query,
      );

    return {
      data: appointments.map(toAppointmentDto),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  const doctor = await doctorRepository.findDoctorByUserId(userId);
  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  const { appointments, total } =
    await appointmentRepository.findAppointmentsByDoctorId(doctor.id, query);

  return {
    data: appointments.map(toAppointmentDto),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAppointmentById(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  const isPatient = role === "PATIENT" && appointment.patient.userId === userId;
  const isDoctor = role === "DOCTOR" && appointment.doctor.userId === userId;

  if (!isPatient && !isDoctor) {
    throw new AppError("You do not have access to this appointment", 403);
  }

  return toAppointmentDto(appointment);
}
