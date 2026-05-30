import { useNavigate } from "react-router-dom"
import { NotificationCategoryLabel } from "@/features/notifications/components/NotificationCategoryLabel"
import { getNotificationDestination, timeAgo } from "@/lib/notification-utils"
import { useAuthStore } from "@/store/auth.store"
import type { Notification } from "@/types/notification"
import { cn } from "@/lib/utils"

interface NotificationListItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
}

export function NotificationListItem({ notification, onMarkAsRead }: NotificationListItemProps) {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)

  function handleClick() {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }

    const destination = getNotificationDestination(
      notification.type,
      role,
      notification.relatedId,
    )
    if (destination) {
      navigate(destination)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !notification.isRead && "bg-accent/50",
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <NotificationCategoryLabel type={notification.type} />
          <p className="text-sm font-medium leading-snug">{notification.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
        </div>
        {!notification.isRead && (
          <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
    </button>
  )
}
