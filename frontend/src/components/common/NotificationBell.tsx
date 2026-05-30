import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Check, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationSocket,
} from "@/hooks/use-notifications"
import { usePushNotificationControls } from "@/hooks/use-push-notifications"
import { useAuthStore } from "@/store/auth.store"
import { NotificationCategoryLabel } from "@/features/notifications/components/NotificationCategoryLabel"
import { getNotificationDestination, timeAgo } from "@/lib/notification-utils"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)

  useNotificationSocket()

  const {
    isBeamsConfigured,
    permission: pushPermission,
    isEnabling: isEnablingPush,
    isPushEnabled,
    needsSetupRetry,
    enableBrowserNotifications,
    refreshState: refreshPushState,
  } = usePushNotificationControls()

  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: notificationsData } = useNotifications(1, 10)
  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()

  const notifications = notificationsData?.notifications ?? []

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen && isBeamsConfigured) {
      refreshPushState()
    }
  }

  function handleNotificationClick(
    id: string,
    isRead: boolean,
    type: (typeof notifications)[number]["type"],
    relatedId: string | null,
  ) {
    if (!isRead) {
      markAsRead(id)
    }

    const destination = getNotificationDestination(type, role, relatedId)
    if (destination) {
      navigate(destination)
      setOpen(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px] font-bold"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="flex w-80 flex-col overflow-hidden p-0"
        sideOffset={8}
      >
        <div className="shrink-0 p-1">
          <DropdownMenuLabel className="flex items-center justify-between py-2">
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
              >
                <Check className="mr-1 size-3" />
                Mark all read
              </Button>
            )}
          </DropdownMenuLabel>

          {isBeamsConfigured && (
            <>
              <DropdownMenuSeparator />
              <div className="px-4 py-2">
                {pushPermission === "granted" && isPushEnabled ? (
                  <p className="text-xs text-muted-foreground">Browser notifications on</p>
                ) : pushPermission === "denied" ? (
                  <p className="text-xs text-muted-foreground">
                    Browser notifications blocked. Enable them in your browser settings.
                  </p>
                ) : needsSetupRetry ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Permission granted. Finish setup to receive alerts when this tab is closed.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-full text-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        void enableBrowserNotifications()
                      }}
                      disabled={isEnablingPush}
                    >
                      {isEnablingPush ? "Setting up…" : "Complete setup"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full text-xs"
                    onClick={(e) => {
                      e.preventDefault()
                      void enableBrowserNotifications()
                    }}
                    disabled={isEnablingPush}
                  >
                    {isEnablingPush ? "Setting up…" : "Enable browser notifications"}
                  </Button>
                )}
              </div>
            </>
          )}

          <DropdownMenuSeparator className="mb-0" />
        </div>

        <div className="min-h-0 max-h-72 overflow-y-auto p-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BellOff className="size-7 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex cursor-pointer flex-col items-start gap-0.5 px-4 py-3 focus:bg-accent",
                  !notification.isRead && "bg-accent/50"
                )}
                onClick={() =>
                  handleNotificationClick(
                    notification.id,
                    notification.isRead,
                    notification.type,
                    notification.relatedId,
                  )
                }
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <NotificationCategoryLabel type={notification.type} />
                    <p className="text-sm font-medium leading-snug">{notification.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {timeAgo(notification.createdAt)}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <div className="shrink-0 border-t bg-popover p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full text-xs"
            onClick={() => {
              navigate("/notifications")
              setOpen(false)
            }}
          >
            View all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
