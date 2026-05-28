import prisma from "../../lib/prisma.js";

export async function findDoctorAvailability(doctorId: string) {
  return prisma.doctorAvailability.findMany({
    where: { doctorId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function replaceAvailability(
  doctorId: string,
  slots: { dayOfWeek: number; startTime: string; endTime: string }[],
  consultationDuration?: number,
) {
  return prisma.$transaction(async (tx) => {
    await tx.doctorAvailability.deleteMany({ where: { doctorId } });

    if (slots.length > 0) {
      await tx.doctorAvailability.createMany({
        data: slots.map((slot) => ({ ...slot, doctorId })),
      });
    }

    if (consultationDuration !== undefined) {
      await tx.doctor.update({
        where: { id: doctorId },
        data: { consultationDuration },
      });
    }

    return tx.doctorAvailability.findMany({
      where: { doctorId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  });
}

export async function createBlockedDate(
  doctorId: string,
  date: Date,
  reason?: string,
) {
  return prisma.blockedDate.create({
    data: { doctorId, date, reason: reason ?? null },
  });
}

export async function findBlockedDates(doctorId: string) {
  return prisma.blockedDate.findMany({
    where: { doctorId },
    orderBy: { date: "asc" },
  });
}

export async function findBlockedDateById(id: string) {
  return prisma.blockedDate.findUnique({ where: { id } });
}

export async function deleteBlockedDate(id: string) {
  return prisma.blockedDate.delete({ where: { id } });
}

export async function findBlockedDateByDoctorAndDate(
  doctorId: string,
  date: Date,
) {
  return prisma.blockedDate.findUnique({
    where: { doctorId_date: { doctorId, date } },
  });
}
