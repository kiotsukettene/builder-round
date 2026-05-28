import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as ratingService from "@/services/rating.service"
import type { SubmitReviewPayload } from "@/services/rating.service"

export function useDoctorReviews(doctorId: string | undefined) {
  return useQuery({
    queryKey: ["doctor-reviews", doctorId],
    queryFn: async () => {
      const res = await ratingService.listDoctorReviews(doctorId!)
      return res.data
    },
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSubmitReview(appointmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) =>
      ratingService.submitReview(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-reviews"] })
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Review submitted. Thank you for your feedback!")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to submit review."
      toast.error(message)
    },
  })
}
