import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { RegistrationState } from "@pusher/push-notifications-web"
import {
  enablePushNotifications,
  getPushRegistrationState,
  hasPushOptInPreference,
  isBeamsConfigured,
  isPushFullyRegistered,
  stopPushNotifications,
} from "@/lib/pusher-beams"
import { useAuthStore } from "@/store/auth.store"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return "Failed to enable browser notifications"
}

export function usePushNotifications() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!isBeamsConfigured() || !isAuthenticated || !accessToken || !user) {
      return
    }

    if (!hasPushOptInPreference()) {
      return
    }

    if (Notification.permission !== "granted") {
      return
    }

    enablePushNotifications(user.id).catch((error) => {
      console.error("Push notification setup failed:", error)
    })
  }, [isAuthenticated, accessToken, user])
}

export function usePushNotificationControls() {
  const user = useAuthStore((s) => s.user)
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== "undefined" ? Notification.permission : "default"
  )
  const [isEnabling, setIsEnabling] = useState(false)
  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    RegistrationState.PERMISSION_PROMPT_REQUIRED
  )

  const refreshState = useCallback(async () => {
    setPermission(typeof Notification !== "undefined" ? Notification.permission : "default")
    const state = await getPushRegistrationState()
    setRegistrationState(state)
    return state
  }, [])

  useEffect(() => {
    refreshState()
  }, [refreshState, user?.id])

  const enableBrowserNotifications = useCallback(async () => {
    if (!isBeamsConfigured() || !user) {
      toast.error("Push notifications are not configured.")
      return
    }

    setIsEnabling(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result !== "granted") {
        toast.error("Notification permission was not granted.")
        return
      }

      await enablePushNotifications(user.id)
      const state = await refreshState()

      if (isPushFullyRegistered(state)) {
        toast.success("Browser notifications enabled.")
      } else {
        toast.error("Could not finish registering for push notifications. Try again.")
      }
    } catch (error) {
      console.error("Enable push notifications failed:", error)
      toast.error(getErrorMessage(error))
      await refreshState()
    } finally {
      setIsEnabling(false)
    }
  }, [user, refreshState])

  const isPushEnabled = isPushFullyRegistered(registrationState)

  const needsSetupRetry =
    permission === "granted" &&
    !isPushEnabled &&
    registrationState === RegistrationState.PERMISSION_GRANTED_NOT_REGISTERED_WITH_BEAMS

  return {
    isBeamsConfigured: isBeamsConfigured(),
    permission,
    isEnabling,
    registrationState,
    isPushEnabled,
    needsSetupRetry,
    enableBrowserNotifications,
    refreshState,
  }
}

export async function cleanupPushOnLogout(): Promise<void> {
  await stopPushNotifications()
}
