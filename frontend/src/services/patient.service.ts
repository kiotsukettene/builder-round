import api from "@/lib/api"
import type {
  ApiResponse,
  CompletePatientProfilePayload,
  PatientProfile,
  UpdatePatientProfilePayload,
} from "@/types/auth"

export async function completePatientProfile(
  payload: CompletePatientProfilePayload
): Promise<ApiResponse<PatientProfile>> {
  const { data } = await api.put<ApiResponse<PatientProfile>>("/api/v1/patients/me", payload)
  return data
}

export async function updatePatientProfile(
  payload: UpdatePatientProfilePayload
): Promise<ApiResponse<PatientProfile>> {
  const { data } = await api.patch<ApiResponse<PatientProfile>>("/api/v1/patients/me", payload)
  return data
}

export async function uploadPatientProfilePicture(
  file: File
): Promise<ApiResponse<{ profilePicture: string }>> {
  const formData = new FormData()
  formData.append("profilePicture", file)

  const { data } = await api.post<ApiResponse<{ profilePicture: string }>>(
    "/api/v1/patients/me/profile-picture",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return data
}
