import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isQueryContentLoading } from "@/lib/query-utils";
import * as appointmentService from "@/services/appointment.service";
import type {
  AppointmentListQuery,
  BookAppointmentPayload,
  CancelAppointmentPayload,
  RescheduleAppointmentPayload,
} from "@/types/appointment";

export function useMyAppointments(query: AppointmentListQuery = {}) {
  const result = useQuery({
    queryKey: ["appointments", query],
    queryFn: () => appointmentService.listMyAppointments(query),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });

  return {
    ...result,
    isContentLoading: isQueryContentLoading(result),
  };
}

export function useAppointmentById(id: string | undefined) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointmentService.getAppointmentById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookAppointmentPayload) =>
      appointmentService.bookAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment booked successfully.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error?.response?.data?.message ?? "Failed to book appointment.";
      toast.error(message);
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment confirmed.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error?.response?.data?.message ?? "Failed to confirm appointment.";
      toast.error(message);
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CancelAppointmentPayload;
    }) => appointmentService.cancelAppointment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment cancelled.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error?.response?.data?.message ?? "Failed to cancel appointment.";
      toast.error(message);
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RescheduleAppointmentPayload;
    }) => appointmentService.rescheduleAppointment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment rescheduled.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error?.response?.data?.message ?? "Failed to reschedule appointment.";
      toast.error(message);
    },
  });
}
