import { useState } from "react"
import { BellOff, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { AppLayout } from "@/components/common/AppLayout"
import { NotificationListItem } from "@/features/notifications/components/NotificationListItem"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotificationSocket,
  useNotifications,
  useUnreadCount,
} from "@/hooks/use-notifications"

const PAGE_LIMIT = 10

function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}

export function NotificationsPage() {
  const [page, setPage] = useState(1)

  useNotificationSocket()

  const { data: unreadCount = 0 } = useUnreadCount()
  const { data, isLoading, isFetching } = useNotifications(page, PAGE_LIMIT)
  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()

  const notifications = data?.notifications ?? []
  const meta = data?.meta
  const isContentLoading = isLoading || isFetching

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0 || isMarkingAll}
          >
            <Check className="mr-1.5 size-4" />
            {isMarkingAll ? "Marking…" : "Mark all read"}
          </Button>
        </div>

        {isLoading ? (
          <NotificationsSkeleton />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
            <BellOff className="size-10 text-muted-foreground/40" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              Updates about appointments and messages will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1 || isContentLoading}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === meta.totalPages || isContentLoading}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
