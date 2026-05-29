export type MessageAuthorRole = "PATIENT" | "DOCTOR"

export interface AppointmentMessage {
  id: string
  appointmentId: string
  authorRole: MessageAuthorRole
  authorUserId: string
  body: string
  createdAt: string
}

export interface SendAppointmentMessagePayload {
  body: string
}
