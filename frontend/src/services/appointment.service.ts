import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"
import type {
  Appointment,
  AppointmentListQuery,
  AppointmentListMeta,
  BookAppointmentPayload,
  RescheduleAppointmentPayload,
} from "@/types/appointment"

interface AppointmentsResponse {
  appointments: Appointment[]
  meta: AppointmentListMeta
}

export async function bookAppointment(
  payload: BookAppointmentPayload
): Promise<ApiResponse<Appointment>> {
  const { data } = await api.post<ApiResponse<Appointment>>("/api/v1/appointments", payload)
  return data
}

export async function getMyAppointments(
  query: AppointmentListQuery = {}
): Promise<AppointmentsResponse> {
  const params = new URLSearchParams()
  if (query.page) params.set("page", String(query.page))
  if (query.limit) params.set("limit", String(query.limit))
  if (query.status) params.set("status", query.status)

  const { data } = await api.get<ApiResponse<Appointment[]> & { meta: AppointmentListMeta }>(
    `/api/v1/appointments?${params.toString()}`
  )

  return { appointments: data.data, meta: data.meta }
}

export async function getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
  const { data } = await api.get<ApiResponse<Appointment>>(`/api/v1/appointments/${id}`)
  return data
}

export async function cancelAppointment(id: string): Promise<ApiResponse<Appointment>> {
  const { data } = await api.patch<ApiResponse<Appointment>>(`/api/v1/appointments/${id}/cancel`)
  return data
}

export async function rescheduleAppointment(
  id: string,
  payload: RescheduleAppointmentPayload
): Promise<ApiResponse<Appointment>> {
  const { data } = await api.patch<ApiResponse<Appointment>>(
    `/api/v1/appointments/${id}/reschedule`,
    payload
  )
  return data
}
