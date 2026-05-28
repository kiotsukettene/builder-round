import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import * as recommendationService from "@/services/recommendation.service"

export function useDefaultRecommendation() {
  return useQuery({
    queryKey: ["recommendation", "default"],
    queryFn: async () => {
      const res = await recommendationService.getDefaultRecommendation()
      return res.data
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })
}

export function useCustomRecommendation() {
  return useMutation({
    mutationFn: (symptoms: string) => recommendationService.getCustomRecommendation(symptoms),
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to get recommendation. Please try again."
      toast.error(message)
    },
  })
}
