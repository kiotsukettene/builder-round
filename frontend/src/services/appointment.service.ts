import api from "@/lib/api";
import type { ApiResponse } from "@/types/auth";
import type {
  Appointment,
  AppointmentListMeta,
  AppointmentListQuery,
  BookAppointmentPayload,
  CancelAppointmentPayload,
  RescheduleAppointmentPayload,
} from "@/types/appointment";

export async function listMyAppointments(
  query: AppointmentListQuery = {},
): Promise<{ appointments: Appointment[]; meta: AppointmentListMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status) params.set("status", query.status);

  const queryString = params.toString();
  const url = queryString
    ? `/api/v1/appointments?${queryString}`
    : "/api/v1/appointments";

  const { data } = await api.get<
    ApiResponse<Appointment[]> & { meta: AppointmentListMeta }
  >(url);

  return { appointments: data.data, meta: data.meta };
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const { data } = await api.get<ApiResponse<Appointment>>(
    `/api/v1/appointments/${id}`,
  );
  return data.data;
}

export async function bookAppointment(
  payload: BookAppointmentPayload,
): Promise<Appointment> {
  const { data } = await api.post<ApiResponse<Appointment>>(
    "/api/v1/appointments",
    payload,
  );
  return data.data;
}

export async function confirmAppointment(id: string): Promise<Appointment> {
  const { data } = await api.patch<ApiResponse<Appointment>>(
    `/api/v1/appointments/${id}/confirm`,
  );
  return data.data;
}

export async function cancelAppointment(
  id: string,
  payload: CancelAppointmentPayload,
): Promise<Appointment> {
  const { data } = await api.patch<ApiResponse<Appointment>>(
    `/api/v1/appointments/${id}/cancel`,
    payload,
  );
  return data.data;
}

export async function rescheduleAppointment(
  id: string,
  payload: RescheduleAppointmentPayload,
): Promise<Appointment> {
  const { data } = await api.patch<ApiResponse<Appointment>>(
    `/api/v1/appointments/${id}/reschedule`,
    payload,
  );
  return data.data;
}
