import prisma from "../../lib/prisma.js";
import type { AppointmentStatus } from "../../generated/prisma/client.js";

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
  data: {
    diagnosis?: string;
    notes?: string;
    recommendations?: string;
  },
) {
  return prisma.consultationNote.upsert({
    where: { appointmentId },
    create: { appointmentId, ...data },
    update: data,
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
  data: {
    medication: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  },
) {
  return prisma.prescription.create({
    data: { appointmentId, ...data },
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
  data: {
    medication?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  },
) {
  return prisma.prescription.update({
    where: { id },
    data,
  });
}

export async function deletePrescription(id: string) {
  return prisma.prescription.delete({
    where: { id },
  });
}
