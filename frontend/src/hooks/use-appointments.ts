import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as appointmentService from "@/services/appointment.service"
import type {
  AppointmentListQuery,
  BookAppointmentPayload,
  RescheduleAppointmentPayload,
} from "@/types/appointment"

export function useMyAppointments(query: AppointmentListQuery = {}) {
  return useQuery({
    queryKey: ["appointments", query],
    queryFn: () => appointmentService.getMyAppointments(query),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  })
}

export function useAppointmentById(id: string | undefined) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const res = await appointmentService.getAppointmentById(id!)
      return res.data
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  })
}

export function useBookAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BookAppointmentPayload) => appointmentService.bookAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-slots"] })
      toast.success("Appointment booked successfully!")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to book appointment."
      toast.error(message)
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-slots"] })
      toast.success("Appointment cancelled.")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to cancel appointment."
      toast.error(message)
    },
  })
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RescheduleAppointmentPayload }) =>
      appointmentService.rescheduleAppointment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      queryClient.invalidateQueries({ queryKey: ["doctor-slots"] })
      toast.success("Appointment rescheduled successfully!")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to reschedule appointment."
      toast.error(message)
    },
  })
}
