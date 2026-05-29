import prisma from "../../lib/prisma.js";
import type { MessageAuthorRole } from "../../generated/prisma/client.js";

export async function findMessagesByAppointmentId(appointmentId: string) {
  return prisma.appointmentMessage.findMany({
    where: { appointmentId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createMessage(data: {
  appointmentId: string;
  authorRole: MessageAuthorRole;
  authorUserId: string;
  body: string;
}) {
  return prisma.appointmentMessage.create({
    data,
  });
}
