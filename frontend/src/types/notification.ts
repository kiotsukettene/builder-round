export type NotificationType =
  | "APPOINTMENT_BOOKED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_REMINDER"
  | "SCHEDULE_UPDATED"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedId: string | null
  createdAt: string
}

export interface NotificationListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedNotifications {
  notifications: Notification[]
  meta: NotificationListMeta
}
