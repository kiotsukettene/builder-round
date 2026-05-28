import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as scheduleService from "@/services/schedule.service"
import type { BlockDatePayload, SetAvailabilityPayload } from "@/types/schedule"

export function useAvailability() {
  return useQuery({
    queryKey: ["schedule-availability"],
    queryFn: async () => {
      const res = await scheduleService.getAvailability()
      return res.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useSetAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SetAvailabilityPayload) => scheduleService.setAvailability(payload),
    onSuccess: (res) => {
      queryClient.setQueryData(["schedule-availability"], res.data)
      toast.success("Schedule saved successfully!")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to save schedule."
      toast.error(message)
    },
  })
}

export function useBlockedDates() {
  return useQuery({
    queryKey: ["blocked-dates"],
    queryFn: async () => {
      const res = await scheduleService.getBlockedDates()
      return res.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useBlockDate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BlockDatePayload) => scheduleService.blockDate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-dates"] })
      toast.success("Date blocked successfully.")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to block date."
      toast.error(message)
    },
  })
}

export function useRemoveBlockedDate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleService.removeBlockedDate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-dates"] })
      toast.success("Blocked date removed.")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to remove blocked date."
      toast.error(message)
    },
  })
}
