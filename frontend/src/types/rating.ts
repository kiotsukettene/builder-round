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

export interface SubmitReviewInput {
  rating: number
  comment?: string
}

export interface SubmitReviewResponse {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  rating: number
  comment: string | null
  createdAt: string
}
