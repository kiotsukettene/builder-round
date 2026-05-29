import { getIO } from "./socket.js";

export interface AppointmentMessagePayload {
  id: string;
  appointmentId: string;
  authorRole: string;
  authorUserId: string;
  body: string;
  createdAt: Date;
}

export function emitAppointmentMessage(
  patientUserId: string,
  doctorUserId: string,
  message: AppointmentMessagePayload,
): void {
  try {
    const io = getIO();
    const payload = {
      ...message,
      createdAt: message.createdAt.toISOString(),
    };

    io.to(`user:${patientUserId}`).emit("appointment:message", payload);
    io.to(`user:${doctorUserId}`).emit("appointment:message", payload);
  } catch {
    // Socket.IO not available (e.g., tests)
  }
}
