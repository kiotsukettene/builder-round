import { AppError } from "../../errors/app-error.js";
import { env } from "../../config/env.js";
import { generateZegoToken, makeRoomId } from "../../lib/zegocloud.js";
import * as consultationRepository from "./consultation.repository.js";
import type {
  ConsultationNoteInput,
  PrescriptionInput,
  UpdatePrescriptionInput,
} from "./consultation.validation.js";

const JOINABLE_STATUSES = ["PENDING", "CONFIRMED"] as const;

async function getAppointmentOrThrow(appointmentId: string) {
  const appointment =
    await consultationRepository.findAppointmentWithParticipants(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }
  return appointment;
}

function assertParticipant(
  appointment: Awaited<
    ReturnType<typeof consultationRepository.findAppointmentWithParticipants>
  >,
  userId: string,
  role: string,
): "PATIENT" | "DOCTOR" {
  if (!appointment) throw new AppError("Appointment not found", 404);

  if (role === "PATIENT" && appointment.patient.user.id === userId) {
    return "PATIENT";
  }
  if (role === "DOCTOR" && appointment.doctor.user.id === userId) {
    return "DOCTOR";
  }

  throw new AppError("You do not have access to this appointment", 403);
}

// ── Session ──

export async function joinConsultation(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);
  const participantRole = assertParticipant(appointment, userId, role);

  if (
    !JOINABLE_STATUSES.includes(
      appointment.status as (typeof JOINABLE_STATUSES)[number],
    )
  ) {
    throw new AppError(
      `Cannot join a consultation with status ${appointment.status}`,
      400,
    );
  }

  if (participantRole === "DOCTOR" && appointment.status === "PENDING") {
    await consultationRepository.updateAppointmentStatus(
      appointmentId,
      "CONFIRMED",
    );
  }

  const roomId = makeRoomId(appointmentId);
  const token = generateZegoToken(userId, roomId);

  return {
    roomId,
    token,
    appId: env.ZEGOCLOUD_APP_ID,
  };
}

export async function endConsultation(userId: string, appointmentId: string) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  if (appointment.doctor.user.id !== userId) {
    throw new AppError(
      "Only the doctor can end this consultation",
      403,
    );
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError("Consultation is already completed", 400);
  }

  if (appointment.status === "CANCELLED") {
    throw new AppError("Cannot end a cancelled appointment", 400);
  }

  const updated = await consultationRepository.updateAppointmentStatus(
    appointmentId,
    "COMPLETED",
  );

  return {
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updatedAt,
  };
}

// ── Notes ──

export async function upsertConsultationNote(
  userId: string,
  appointmentId: string,
  data: ConsultationNoteInput,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  if (appointment.doctor.user.id !== userId) {
    throw new AppError("Only the doctor can write consultation notes", 403);
  }

  return consultationRepository.upsertNote(appointmentId, data);
}

export async function getConsultationNote(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);
  assertParticipant(appointment, userId, role);

  return consultationRepository.findNoteByAppointmentId(appointmentId);
}

// ── Prescriptions ──

export async function addPrescription(
  userId: string,
  appointmentId: string,
  data: PrescriptionInput,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  if (appointment.doctor.user.id !== userId) {
    throw new AppError("Only the doctor can add prescriptions", 403);
  }

  return consultationRepository.createPrescription(appointmentId, data);
}

export async function listPrescriptions(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);
  assertParticipant(appointment, userId, role);

  return consultationRepository.findPrescriptionsByAppointmentId(appointmentId);
}

export async function updatePrescription(
  userId: string,
  appointmentId: string,
  prescriptionId: string,
  data: UpdatePrescriptionInput,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  if (appointment.doctor.user.id !== userId) {
    throw new AppError("Only the doctor can update prescriptions", 403);
  }

  const prescription =
    await consultationRepository.findPrescriptionById(prescriptionId);

  if (!prescription || prescription.appointmentId !== appointmentId) {
    throw new AppError("Prescription not found", 404);
  }

  return consultationRepository.updatePrescription(prescriptionId, data);
}

export async function deletePrescription(
  userId: string,
  appointmentId: string,
  prescriptionId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);

  if (appointment.doctor.user.id !== userId) {
    throw new AppError("Only the doctor can delete prescriptions", 403);
  }

  const prescription =
    await consultationRepository.findPrescriptionById(prescriptionId);

  if (!prescription || prescription.appointmentId !== appointmentId) {
    throw new AppError("Prescription not found", 404);
  }

  await consultationRepository.deletePrescription(prescriptionId);
}

// ── Medical Record ──

export async function getMedicalRecord(
  userId: string,
  role: string,
  appointmentId: string,
) {
  const appointment = await getAppointmentOrThrow(appointmentId);
  assertParticipant(appointment, userId, role);

  const [note, prescriptions] = await Promise.all([
    consultationRepository.findNoteByAppointmentId(appointmentId),
    consultationRepository.findPrescriptionsByAppointmentId(appointmentId),
  ]);

  return { note, prescriptions };
}
