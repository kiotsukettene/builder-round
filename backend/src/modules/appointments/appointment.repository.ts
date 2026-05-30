import prisma from "../../lib/prisma.js";
import type { AppointmentStatus } from "../../generated/prisma/client.js";
import type { ListAppointmentsQueryInput } from "./appointment.validation.js";
import { getDayBoundsInTimezone, getWallClockParts } from "../../utils/schedule-datetime.js";

export async function isDateBlockedForDoctor(
  doctorId: string,
  date: Date,
): Promise<boolean> {
  const { dateStr } = getWallClockParts(date);
  const { start, end } = getDayBoundsInTimezone(dateStr);

  const blocked = await prisma.blockedDate.findFirst({
    where: {
      doctorId,
      date: { gte: start, lte: end },
    },
  });

  return blocked !== null;
}

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

function buildAppointmentListWhere(
  filters: ListAppointmentsQueryInput,
  idFilter: { patientId: string } | { doctorId: string },
) {
  const { status, upcoming } = filters;

  return {
    ...idFilter,
    ...(upcoming
      ? { status: { in: ["PENDING", "CONFIRMED"] as AppointmentStatus[] } }
      : status
        ? { status }
        : {}),
  };
}

export async function findAppointmentsByPatientId(
  patientId: string,
  filters: ListAppointmentsQueryInput,
) {
  const { page, limit } = filters;
  const skip = (page - 1) * limit;

  const where = buildAppointmentListWhere(filters, { patientId });

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
  const { page, limit } = filters;
  const skip = (page - 1) * limit;

  const where = buildAppointmentListWhere(filters, { doctorId });

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
  extra?: { cancellationReason?: string },
) {
  return prisma.appointment.update({
    where: { id },
    data: {
      status,
      ...(extra?.cancellationReason !== undefined && {
        cancellationReason: extra.cancellationReason,
      }),
    },
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
  durationMinutes: number,
  excludeId?: string,
) {
  const windowMs = durationMinutes * 60 * 1000;
  const from = new Date(scheduledAt.getTime() - windowMs + 1);
  const to = new Date(scheduledAt.getTime() + windowMs - 1);

  return prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledAt: { gte: from, lte: to },
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  });
}

export async function createAppointmentSafe(data: {
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  durationMinutes: number;
  initialMessage?: { authorUserId: string; body: string };
}) {
  return prisma.$transaction(
    async (tx) => {
      const windowMs = data.durationMinutes * 60 * 1000;
      const from = new Date(data.scheduledAt.getTime() - windowMs + 1);
      const to = new Date(data.scheduledAt.getTime() + windowMs - 1);

      const conflict = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          status: { in: ["PENDING", "CONFIRMED"] },
          scheduledAt: { gte: from, lte: to },
        },
      });

      if (conflict) {
        return { conflict: true as const };
      }

      const appointment = await tx.appointment.create({
        data: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          scheduledAt: data.scheduledAt,
          status: "PENDING",
        },
        include: appointmentWithRelations,
      });

      let initialMessage = null;

      if (data.initialMessage) {
        initialMessage = await tx.appointmentMessage.create({
          data: {
            appointmentId: appointment.id,
            authorRole: "PATIENT",
            authorUserId: data.initialMessage.authorUserId,
            body: data.initialMessage.body,
          },
        });
      }

      return { conflict: false as const, appointment, initialMessage };
    },
    { isolationLevel: "Serializable" },
  );
}

export async function updateAppointmentScheduleSafe(
  id: string,
  doctorId: string,
  scheduledAt: Date,
  durationMinutes: number,
) {
  return prisma.$transaction(
    async (tx) => {
      const windowMs = durationMinutes * 60 * 1000;
      const from = new Date(scheduledAt.getTime() - windowMs + 1);
      const to = new Date(scheduledAt.getTime() + windowMs - 1);

      const conflict = await tx.appointment.findFirst({
        where: {
          doctorId,
          status: { in: ["PENDING", "CONFIRMED"] },
          scheduledAt: { gte: from, lte: to },
          NOT: { id },
        },
      });

      if (conflict) {
        return { conflict: true as const };
      }

      const appointment = await tx.appointment.update({
        where: { id },
        data: {
          scheduledAt,
          status: "PENDING",
          reminderOneHourSentAt: null,
          reminderTenMinSentAt: null,
          sessionWindowPassedNotifiedAt: null,
        },
        include: appointmentWithRelations,
      });

      return { conflict: false as const, appointment };
    },
    { isolationLevel: "Serializable" },
  );
}
