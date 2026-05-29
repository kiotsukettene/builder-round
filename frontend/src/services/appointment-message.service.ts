import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"
import type {
  AppointmentMessage,
  SendAppointmentMessagePayload,
} from "@/types/appointment-message"

export async function listAppointmentMessages(
  appointmentId: string,
): Promise<AppointmentMessage[]> {
  const { data } = await api.get<ApiResponse<AppointmentMessage[]>>(
    `/api/v1/appointments/${appointmentId}/messages`,
  )
  return data.data
}

export async function sendAppointmentMessage(
  appointmentId: string,
  payload: SendAppointmentMessagePayload,
): Promise<AppointmentMessage> {
  const { data } = await api.post<ApiResponse<AppointmentMessage>>(
    `/api/v1/appointments/${appointmentId}/messages`,
    payload,
  )
  return data.data
}
