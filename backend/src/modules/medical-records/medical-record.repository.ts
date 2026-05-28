import prisma from "../../lib/prisma.js";
import type { ListMedicalRecordsQueryInput } from "./medical-record.validation.js";

const medicalRecordInclude = {
  consultationNote: true,
  prescriptions: {
    orderBy: { createdAt: "asc" as const },
  },
} as const;

// ── Patient queries ──

export async function findCompletedAppointmentsByPatientId(
  patientId: string,
  { page, limit }: ListMedicalRecordsQueryInput,
) {
  const skip = (page - 1) * limit;
  const where = { patientId, status: "COMPLETED" as const };

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scheduledAt: "desc" },
      include: {
        ...medicalRecordInclude,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            profilePicture: true,
          },
        },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total };
}

// ── Doctor queries ──

export async function findCompletedAppointmentsByDoctorId(
  doctorId: string,
  { page, limit }: ListMedicalRecordsQueryInput,
) {
  const skip = (page - 1) * limit;
  const where = { doctorId, status: "COMPLETED" as const };

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scheduledAt: "desc" },
      include: {
        ...medicalRecordInclude,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total };
}

// ── Shared detail query ──

export async function findAppointmentWithFullRecord(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      ...medicalRecordInclude,
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
    },
  });
}
