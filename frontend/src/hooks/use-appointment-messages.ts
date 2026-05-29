import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getSocket } from "@/lib/socket"
import * as appointmentMessageService from "@/services/appointment-message.service"
import { useAuthStore } from "@/store/auth.store"
import type { AppointmentMessage } from "@/types/appointment-message"

export function appendMessageToCache(
  queryClient: QueryClient,
  message: AppointmentMessage,
) {
  queryClient.setQueryData<AppointmentMessage[]>(
    ["appointment-messages", message.appointmentId],
    (old = []) => {
      if (old.some((item) => item.id === message.id)) {
        return old
      }

      return [...old, message]
    },
  )
}

export function useAppointmentMessages(appointmentId: string) {
  return useQuery({
    queryKey: ["appointment-messages", appointmentId],
    queryFn: () => appointmentMessageService.listAppointmentMessages(appointmentId),
    staleTime: 1000 * 30,
  })
}

export function useSendAppointmentMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string
      payload: { body: string }
    }) => appointmentMessageService.sendAppointmentMessage(appointmentId, payload),
    onSuccess: (message) => {
      appendMessageToCache(queryClient, message)
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error?.response?.data?.message ?? "Failed to send message."
      toast.error(message)
    },
  })
}

export function useAppointmentMessagesSocket() {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const sock = getSocket(accessToken)

    function handleNewMessage(message: AppointmentMessage) {
      appendMessageToCache(queryClient, message)
    }

    sock.on("appointment:message", handleNewMessage)

    return () => {
      sock.off("appointment:message", handleNewMessage)
    }
  }, [isAuthenticated, accessToken, queryClient])
}
