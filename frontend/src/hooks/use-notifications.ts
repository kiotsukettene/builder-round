import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { io, type Socket } from "socket.io-client"
import * as notificationService from "@/services/notification.service"
import { useAuthStore } from "@/store/auth.store"
import type { Notification } from "@/types/notification"

let socket: Socket | null = null

function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(import.meta.env.VITE_API_URL ?? "", {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    })
  }
  return socket
}

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => notificationService.getNotifications(page, limit),
    staleTime: 1000 * 30,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.setQueryData(["notifications-unread"], 0)
      toast.success("All notifications marked as read.")
    },
    onError: () => {
      toast.error("Failed to mark notifications as read.")
    },
  })
}

export function useNotificationSocket() {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const sock = getSocket(accessToken)

    function handleNewNotification(notification: Notification) {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] })
      queryClient.invalidateQueries({ queryKey: ["appointments"] })

      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      })
    }

    sock.on("notification:new", handleNewNotification)

    return () => {
      sock.off("notification:new", handleNewNotification)
    }
  }, [isAuthenticated, accessToken, queryClient])
}
