import type { AppointmentMessage } from "../../generated/prisma/client.js";

export function toAppointmentMessageDto(message: AppointmentMessage) {
  return {
    id: message.id,
    appointmentId: message.appointmentId,
    authorRole: message.authorRole,
    authorUserId: message.authorUserId,
    body: message.body,
    createdAt: message.createdAt,
  };
}
