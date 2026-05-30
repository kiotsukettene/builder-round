import prisma from "../../lib/prisma.js";
import type { AppointmentStatus } from "../../generated/prisma/client.js";
import type {
  ConsultationNoteInput,
  PrescriptionInput,
  UpdatePrescriptionInput,
} from "./consultation.validation.js";

/** Drops keys whose value is `undefined` (required for exactOptionalPropertyTypes + Prisma). */
function omitUndefined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as {
    [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>;
  };
}

// ── Appointment ──

const appointmentWithParticipants = {
  patient: {
    include: {
      user: { select: { id: true } },
    },
  },
  doctor: {
    include: {
      user: { select: { id: true } },
    },
  },
} as const;

export async function findAppointmentWithParticipants(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: appointmentWithParticipants,
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
) {
  return prisma.appointment.update({
    where: { id },
    data: { status },
    include: appointmentWithParticipants,
  });
}

// ── Consultation Note ──

export async function upsertNote(
  appointmentId: string,
  data: ConsultationNoteInput,
) {
  const fields = omitUndefined(data);
  return prisma.consultationNote.upsert({
    where: { appointmentId },
    create: { appointmentId, ...fields },
    update: fields,
  });
}

export async function findNoteByAppointmentId(appointmentId: string) {
  return prisma.consultationNote.findUnique({
    where: { appointmentId },
  });
}

// ── Prescriptions ──

export async function createPrescription(
  appointmentId: string,
  data: PrescriptionInput,
) {
  return prisma.prescription.create({
    data: { appointmentId, ...omitUndefined(data) },
  });
}

export async function findPrescriptionsByAppointmentId(appointmentId: string) {
  return prisma.prescription.findMany({
    where: { appointmentId },
    orderBy: { createdAt: "asc" },
  });
}

export async function findPrescriptionById(id: string) {
  return prisma.prescription.findUnique({
    where: { id },
  });
}

export async function updatePrescription(
  id: string,
  data: UpdatePrescriptionInput,
) {
  return prisma.prescription.update({
    where: { id },
    data: omitUndefined(data),
  });
}

export async function deletePrescription(id: string) {
  return prisma.prescription.delete({
    where: { id },
  });
}
