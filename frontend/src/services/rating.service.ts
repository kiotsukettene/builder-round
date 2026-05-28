import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"

export interface DoctorReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  patientName: string
}

export interface DoctorReviewsResponse {
  averageRating: number | null
  totalReviews: number
  reviews: DoctorReview[]
}

export interface SubmitReviewPayload {
  rating: number
  comment?: string
}

export async function listDoctorReviews(
  doctorId: string
): Promise<ApiResponse<DoctorReviewsResponse>> {
  const { data } = await api.get<ApiResponse<DoctorReviewsResponse>>(
    `/api/v1/doctors/${doctorId}/reviews`
  )
  return data
}

export async function submitReview(
  appointmentId: string,
  payload: SubmitReviewPayload
): Promise<ApiResponse<DoctorReview>> {
  const { data } = await api.post<ApiResponse<DoctorReview>>(
    `/api/v1/consultations/${appointmentId}/review`,
    payload
  )
  return data
}
