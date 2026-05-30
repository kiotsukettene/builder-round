import type { Role } from "@/types/auth"
import type { NotificationType } from "@/types/notification"

export const TYPE_LABELS: Record<NotificationType, string> = {
  APPOINTMENT_BOOKED: "New Booking",
  APPOINTMENT_CONFIRMED: "Confirmed",
  APPOINTMENT_CANCELLED: "Cancellation",
  APPOINTMENT_REMINDER: "Reminder",
  APPOINTMENT_MESSAGE: "Message",
  SCHEDULE_UPDATED: "Schedule Update",
  SESSION_WINDOW_PASSED: "Session Ended",
}

const TYPE_LABEL_COLOR: Partial<Record<NotificationType, string>> = {
  APPOINTMENT_CANCELLED: "text-destructive",
  APPOINTMENT_BOOKED: "text-green-600 dark:text-green-500",
  APPOINTMENT_REMINDER: "text-yellow-600 dark:text-yellow-500",
}

const TYPE_DOT_COLOR: Partial<Record<NotificationType, string>> = {
  APPOINTMENT_CANCELLED: "bg-destructive",
  APPOINTMENT_BOOKED: "bg-green-600 dark:bg-green-500",
  APPOINTMENT_REMINDER: "bg-yellow-500",
}

export function getNotificationTypeLabelColor(type: NotificationType): string {
  return TYPE_LABEL_COLOR[type] ?? "text-muted-foreground"
}

export function getNotificationTypeDotColor(type: NotificationType): string {
  return TYPE_DOT_COLOR[type] ?? "bg-muted-foreground"
}

const APPOINTMENT_RELATED_TYPES: NotificationType[] = [
  "APPOINTMENT_BOOKED",
  "APPOINTMENT_CONFIRMED",
  "APPOINTMENT_CANCELLED",
  "APPOINTMENT_REMINDER",
  "APPOINTMENT_MESSAGE",
  "SESSION_WINDOW_PASSED",
]

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getNotificationDestination(
  type: NotificationType,
  role: Role | undefined,
  relatedId: string | null,
): string | null {
  if (!relatedId || !role) return null
  if (!APPOINTMENT_RELATED_TYPES.includes(type)) return null
  return role === "DOCTOR" ? "/doctor/appointments" : "/appointments"
}
