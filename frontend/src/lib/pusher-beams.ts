import {
  Client,
  RegistrationState,
  type ITokenProvider,
} from "@pusher/push-notifications-web"
import * as pushService from "@/services/push.service"

const PUSHER_SDK_VERSION = "1.1.0"
const SERVICE_WORKER_PATH = `/service-worker.js?pusherBeamsWebSDKVersion=${PUSHER_SDK_VERSION}`

const INSTANCE_ID = import.meta.env.VITE_PUSHER_BEAMS_INSTANCE_ID as string | undefined

let beamsClient: Client | null = null
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null

export const PUSH_OPT_IN_KEY = "tellmd-push-opt-in"

export function isBeamsConfigured(): boolean {
  return Boolean(INSTANCE_ID)
}

function createBeamsClient(registration: ServiceWorkerRegistration): Client {
  if (!INSTANCE_ID) {
    throw new Error("Pusher Beams is not configured")
  }

  return new Client({
    instanceId: INSTANCE_ID,
    serviceWorkerRegistration: registration,
  })
}

function createBeamsTokenProvider(beamsUserId: string): ITokenProvider {
  return {
    fetchToken: async (userId) => {
      if (userId !== beamsUserId) {
        throw new Error("Beams user ID mismatch")
      }
      const token = await pushService.getBeamsAuthToken(userId)
      return { token }
    },
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
    scope: "/",
    updateViaCache: "none",
  })

  serviceWorkerRegistration = await navigator.serviceWorker.ready
  return serviceWorkerRegistration
}

export async function enablePushNotifications(userId: string): Promise<void> {
  if (!isBeamsConfigured()) {
    throw new Error("Push notifications are not configured for this app")
  }

  if (Notification.permission !== "granted") {
    throw new Error("Notification permission was not granted")
  }

  const registration = await registerServiceWorker()

  if (beamsClient) {
    try {
      await beamsClient.stop()
    } catch {
      // Continue with a fresh client
    }
    beamsClient = null
  }

  beamsClient = createBeamsClient(registration)
  await beamsClient.start()
  await beamsClient.setUserId(userId, createBeamsTokenProvider(userId))
  localStorage.setItem(PUSH_OPT_IN_KEY, "true")
}

export async function stopPushNotifications(): Promise<void> {
  if (!beamsClient) {
    localStorage.removeItem(PUSH_OPT_IN_KEY)
    return
  }

  try {
    await beamsClient.stop()
  } catch {
    // Best effort on logout
  }

  beamsClient = null
  serviceWorkerRegistration = null
  localStorage.removeItem(PUSH_OPT_IN_KEY)
}

export async function getPushRegistrationState(): Promise<RegistrationState> {
  if (typeof Notification === "undefined") {
    return RegistrationState.PERMISSION_PROMPT_REQUIRED
  }

  if (Notification.permission === "denied") {
    return RegistrationState.PERMISSION_DENIED
  }

  if (beamsClient) {
    try {
      return await beamsClient.getRegistrationState()
    } catch {
      // Fall through to permission-based state
    }
  }

  if (Notification.permission === "granted") {
    return hasPushOptInPreference()
      ? RegistrationState.PERMISSION_GRANTED_NOT_REGISTERED_WITH_BEAMS
      : RegistrationState.PERMISSION_PROMPT_REQUIRED
  }

  return RegistrationState.PERMISSION_PROMPT_REQUIRED
}

export function hasPushOptInPreference(): boolean {
  return localStorage.getItem(PUSH_OPT_IN_KEY) === "true"
}

export function isPushFullyRegistered(state: RegistrationState): boolean {
  return state === RegistrationState.PERMISSION_GRANTED_REGISTERED_WITH_BEAMS
}
