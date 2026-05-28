/**
 * Schedule helpers treat availability HH:MM and calendar dates as local wall-clock time
 * in the app timezone (browser local on frontend, APP_TIMEZONE on backend).
 */

export function formatDateQueryParam(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Build ISO datetime with the user's local timezone offset (e.g. 2026-05-29T09:00:00+08:00). */
export function buildScheduledAtIso(date: Date, slotTime: string): string {
  const datePart = formatDateQueryParam(date)
  const [hours, minutes] = slotTime.split(":").map(Number)
  const local = new Date(date)
  local.setHours(hours, minutes, 0, 0)

  const offsetMinutes = -local.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const absOffset = Math.abs(offsetMinutes)
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0")
  const offsetMins = String(absOffset % 60).padStart(2, "0")

  return `${datePart}T${slotTime}:00${sign}${offsetHours}:${offsetMins}`
}

export function formatSlotTime(time: string): string {
  const [hStr, mStr] = time.split(":")
  const h = Number(hStr)
  const m = Number(mStr)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}

const JOIN_WINDOW_BEFORE_MIN = 30

/** Whether the current time is within the joinable window (30 min before through session end). */
export function isWithinJoinWindow(
  scheduledAt: string,
  durationMin = 30,
): boolean {
  const scheduled = new Date(scheduledAt)
  const now = new Date()
  const windowStart = new Date(
    scheduled.getTime() - JOIN_WINDOW_BEFORE_MIN * 60 * 1000,
  )
  const windowEnd = new Date(scheduled.getTime() + durationMin * 60 * 1000)
  return now >= windowStart && now <= windowEnd
}

function formatDurationUntil(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

/** Contextual label for upcoming or in-progress appointments. */
export function getRelativeTimeLabel(
  scheduledAt: string,
  durationMin = 30,
): string {
  const scheduled = new Date(scheduledAt)
  const now = new Date()
  const diffMs = scheduled.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / (60 * 1000))

  if (diffMinutes > 24 * 60) {
    const days = Math.round(diffMinutes / (24 * 60))
    return `Starts in ${days} day${days === 1 ? "" : "s"}`
  }

  if (diffMinutes > 60) {
    const hours = Math.round(diffMinutes / 60)
    return `Starts in ${hours}h`
  }

  if (diffMinutes > 15) {
    return `Starts in ${formatDurationUntil(diffMinutes)}`
  }

  if (diffMinutes > 0) {
    return "Starting soon"
  }

  const elapsedMinutes = Math.abs(diffMinutes)
  const sessionEndMinutes = durationMin

  if (elapsedMinutes <= sessionEndMinutes) {
    if (elapsedMinutes <= 1) {
      return "Starting now"
    }
    return `Started ${elapsedMinutes} min ago`
  }

  return "Session window passed"
}
