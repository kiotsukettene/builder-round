import prisma from "../../lib/prisma.js";
import type { AppointmentStatus } from "../../generated/prisma/client.js";
import type { ListAppointmentsQueryInput } from "./appointment.validation.js";

const appointmentWithRelations = {
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

export async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
}) {
  return prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      scheduledAt: data.scheduledAt,
      status: "PENDING",
    },
    include: appointmentWithRelations,
  });
}

export async function findAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: appointmentWithRelations,
  });
}

export async function findAppointmentsByPatientId(
  patientId: string,
  filters: ListAppointmentsQueryInput,
) {
  const { page, limit, status } = filters;
  const skip = (page - 1) * limit;

  const where = {
    patientId,
    ...(status && { status }),
  };

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scheduledAt: "desc" },
      include: appointmentWithRelations,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total };
}

export async function findAppointmentsByDoctorId(
  doctorId: string,
  filters: ListAppointmentsQueryInput,
) {
  const { page, limit, status } = filters;
  const skip = (page - 1) * limit;

  const where = {
    doctorId,
    ...(status && { status }),
  };

  const [appointments, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scheduledAt: "desc" },
      include: appointmentWithRelations,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
) {
  return prisma.appointment.update({
    where: { id },
    data: { status },
    include: appointmentWithRelations,
  });
}

export async function updateAppointmentSchedule(
  id: string,
  scheduledAt: Date,
) {
  return prisma.appointment.update({
    where: { id },
    data: { scheduledAt, status: "PENDING" },
    include: appointmentWithRelations,
  });
}

export async function findConflictingAppointment(
  doctorId: string,
  scheduledAt: Date,
  excludeId?: string,
) {
  const windowMs = 30 * 60 * 1000;
  const from = new Date(scheduledAt.getTime() - windowMs);
  const to = new Date(scheduledAt.getTime() + windowMs);

  return prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledAt: { gte: from, lte: to },
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  });
}
