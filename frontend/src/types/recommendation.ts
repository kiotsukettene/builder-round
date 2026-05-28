export interface RecommendationResult {
  specialization: string
  explanation: string
}

export interface PublicDoctor {
  id: string
  firstName: string
  lastName: string
  specialization: string
  bio: string | null
  fee: number | null
  consultationDuration: number
  profilePicture: string | null
}

export interface RecommendationResponse {
  recommendation: RecommendationResult
  doctors: PublicDoctor[]
}
