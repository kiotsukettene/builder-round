import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"
import type {
  DoctorListFilters,
  DoctorListMeta,
  DoctorSlotsResponse,
  PublicDoctor,
  PublicDoctorWithAvailability,
} from "@/types/doctor"

export interface DoctorListResponse {
  data: PublicDoctor[]
  meta: DoctorListMeta
}

export async function listDoctors(
  filters: DoctorListFilters = {}
): Promise<{ data: PublicDoctor[]; meta: DoctorListMeta }> {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.specialization) params.set("specialization", filters.specialization)
  if (filters.page) params.set("page", String(filters.page))
  if (filters.limit) params.set("limit", String(filters.limit))

  const { data } = await api.get<
    ApiResponse<PublicDoctor[]> & { meta: DoctorListMeta }
  >(`/api/v1/doctors?${params.toString()}`)

  return { data: data.data, meta: data.meta }
}

export async function getDoctorById(
  id: string
): Promise<ApiResponse<PublicDoctorWithAvailability>> {
  const { data } = await api.get<ApiResponse<PublicDoctorWithAvailability>>(`/api/v1/doctors/${id}`)
  return data
}

export async function getDoctorSlots(
  doctorId: string,
  date: string
): Promise<ApiResponse<DoctorSlotsResponse>> {
  const { data } = await api.get<ApiResponse<DoctorSlotsResponse>>(
    `/api/v1/doctors/${doctorId}/slots?date=${date}`
  )
  return data
}
