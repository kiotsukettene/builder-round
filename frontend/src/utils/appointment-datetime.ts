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
