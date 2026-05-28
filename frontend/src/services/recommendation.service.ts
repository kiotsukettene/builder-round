import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"
import type { RecommendationResponse } from "@/types/recommendation"

export async function getDefaultRecommendation(): Promise<ApiResponse<RecommendationResponse>> {
  const { data } = await api.get<ApiResponse<RecommendationResponse>>("/api/v1/recommendations")
  return data
}

export async function getCustomRecommendation(
  symptoms: string
): Promise<ApiResponse<RecommendationResponse>> {
  const { data } = await api.post<ApiResponse<RecommendationResponse>>("/api/v1/recommendations", {
    symptoms,
  })
  return data
}
