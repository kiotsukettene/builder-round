import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"
import type {
  AvailabilityResponse,
  BlockDatePayload,
  BlockedDate,
  SetAvailabilityPayload,
} from "@/types/schedule"

export async function getAvailability(): Promise<ApiResponse<AvailabilityResponse>> {
  const { data } = await api.get<ApiResponse<AvailabilityResponse>>("/api/v1/schedules/availability")
  return data
}

export async function setAvailability(
  payload: SetAvailabilityPayload
): Promise<ApiResponse<AvailabilityResponse>> {
  const { data } = await api.put<ApiResponse<AvailabilityResponse>>(
    "/api/v1/schedules/availability",
    payload
  )
  return data
}

export async function getBlockedDates(): Promise<ApiResponse<BlockedDate[]>> {
  const { data } = await api.get<ApiResponse<BlockedDate[]>>("/api/v1/schedules/blocked-dates")
  return data
}

export async function blockDate(payload: BlockDatePayload): Promise<ApiResponse<BlockedDate>> {
  const { data } = await api.post<ApiResponse<BlockedDate>>(
    "/api/v1/schedules/blocked-dates",
    payload
  )
  return data
}

export async function removeBlockedDate(id: string): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/api/v1/schedules/blocked-dates/${id}`)
  return data
}
