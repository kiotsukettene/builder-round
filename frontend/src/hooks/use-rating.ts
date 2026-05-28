import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as ratingService from "@/services/rating.service"
import type { SubmitReviewInput } from "@/types/rating"

export function useDoctorReviews(doctorId: string | undefined) {
  return useQuery({
    queryKey: ["doctor-reviews", doctorId],
    queryFn: async () => {
      const res = await ratingService.getDoctorReviews(doctorId!)
      return res.data
    },
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string
      data: SubmitReviewInput
    }) => ratingService.submitReview(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-reviews"] })
      queryClient.invalidateQueries({ queryKey: ["doctors"] })
      queryClient.invalidateQueries({ queryKey: ["doctor"] })
      queryClient.invalidateQueries({ queryKey: ["recommendation"] })
      toast.success("Thank you for your review!")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error?.response?.data?.message ?? "Failed to submit review. Please try again."
      toast.error(message)
    },
  })
}
