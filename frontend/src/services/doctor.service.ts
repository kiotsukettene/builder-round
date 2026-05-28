import api from "@/lib/api"
import type {
  ApiResponse,
  CompleteDoctorProfilePayload,
  DoctorProfile,
  UpdateDoctorProfilePayload,
} from "@/types/auth"

export async function getDoctorProfile(): Promise<ApiResponse<DoctorProfile>> {
  const { data } = await api.get<ApiResponse<DoctorProfile>>("/api/v1/doctors/me")
  return data
}

export async function completeDoctorProfile(
  payload: CompleteDoctorProfilePayload
): Promise<ApiResponse<DoctorProfile>> {
  const { data } = await api.put<ApiResponse<DoctorProfile>>("/api/v1/doctors/me", payload)
  return data
}

export async function updateDoctorProfile(
  payload: UpdateDoctorProfilePayload
): Promise<ApiResponse<DoctorProfile>> {
  const { data } = await api.patch<ApiResponse<DoctorProfile>>("/api/v1/doctors/me", payload)
  return data
}

export async function uploadDoctorProfilePicture(
  file: File
): Promise<ApiResponse<{ profilePicture: string }>> {
  const formData = new FormData()
  formData.append("profilePicture", file)

  const { data } = await api.post<ApiResponse<{ profilePicture: string }>>(
    "/api/v1/doctors/me/profile-picture",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return data
}
