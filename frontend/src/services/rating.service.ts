import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"
import type {
  DoctorReviewsResponse,
  SubmitReviewInput,
  SubmitReviewResponse,
} from "@/types/rating"

export async function submitReview(
  appointmentId: string,
  data: SubmitReviewInput
): Promise<ApiResponse<SubmitReviewResponse>> {
  const { data: response } = await api.post<ApiResponse<SubmitReviewResponse>>(
    `/api/v1/consultations/${appointmentId}/review`,
    data
  )
  return response
}

export async function getDoctorReviews(
  doctorId: string
): Promise<ApiResponse<DoctorReviewsResponse>> {
  const { data } = await api.get<ApiResponse<DoctorReviewsResponse>>(
    `/api/v1/doctors/${doctorId}/reviews`
  )
  return data
}
