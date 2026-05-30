import {
  getNotificationTypeDotColor,
  getNotificationTypeLabelColor,
  TYPE_LABELS,
} from "@/lib/notification-utils"
import type { NotificationType } from "@/types/notification"
import { cn } from "@/lib/utils"

interface NotificationCategoryLabelProps {
  type: NotificationType
  className?: string
}

export function NotificationCategoryLabel({ type, className }: NotificationCategoryLabelProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 truncate text-xs font-semibold",
        getNotificationTypeLabelColor(type),
        className,
      )}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", getNotificationTypeDotColor(type))}
        aria-hidden
      />
      {TYPE_LABELS[type]}
    </p>
  )
}
