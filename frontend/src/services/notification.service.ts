import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"
import type { Notification, NotificationListMeta } from "@/types/notification"

interface NotificationsResponse {
  notifications: Notification[]
  meta: NotificationListMeta
}

interface UnreadCountResponse {
  count: number
}

export async function getNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const { data } = await api.get<ApiResponse<Notification[]> & { meta: NotificationListMeta }>(
    `/api/v1/notifications?${params.toString()}`
  )
  return { notifications: data.data, meta: data.meta }
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiResponse<UnreadCountResponse>>(
    "/api/v1/notifications/unread-count"
  )
  return data.data.count
}

export async function markAsRead(id: string): Promise<ApiResponse<Notification>> {
  const { data } = await api.patch<ApiResponse<Notification>>(
    `/api/v1/notifications/${id}/read`
  )
  return data
}

export async function markAllAsRead(): Promise<ApiResponse<null>> {
  const { data } = await api.patch<ApiResponse<null>>("/api/v1/notifications/read-all")
  return data
}
