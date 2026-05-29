import { getIO } from "./socket.js";

export interface ConsultationEndedPayload {
  appointmentId: string;
  status: "COMPLETED";
}

export function emitConsultationEnded(
  patientUserId: string,
  doctorUserId: string,
  payload: ConsultationEndedPayload,
): void {
  try {
    const io = getIO();
    io.to(`user:${patientUserId}`).emit("consultation:ended", payload);
    io.to(`user:${doctorUserId}`).emit("consultation:ended", payload);
  } catch {
    // Socket.IO not available (e.g., tests)
  }
}
