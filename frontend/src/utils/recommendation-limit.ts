const STORAGE_PREFIX = "tellmd-custom-recommendation-usage"
export const MAX_CUSTOM_RECOMMENDATIONS = 2
const WINDOW_MS = 24 * 60 * 60 * 1000

interface UsageRecord {
  timestamps: number[]
}

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}-${userId}`
}

function readTimestamps(userId: string): number[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as UsageRecord
    if (!Array.isArray(parsed.timestamps)) return []
    const now = Date.now()
    return parsed.timestamps.filter((t) => now - t < WINDOW_MS)
  } catch {
    return []
  }
}

function writeTimestamps(userId: string, timestamps: number[]) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify({ timestamps }))
}

export function getCustomRecommendationUsageCount(userId: string): number {
  return readTimestamps(userId).length
}

export function getRemainingCustomRecommendations(userId: string): number {
  return Math.max(0, MAX_CUSTOM_RECOMMENDATIONS - getCustomRecommendationUsageCount(userId))
}

export function canUseCustomRecommendation(userId: string): boolean {
  return getRemainingCustomRecommendations(userId) > 0
}

export function recordCustomRecommendationUsage(userId: string) {
  const timestamps = [...readTimestamps(userId), Date.now()]
  writeTimestamps(userId, timestamps)
}

export function getCustomRecommendationResetAt(userId: string): Date | null {
  const timestamps = readTimestamps(userId)
  if (timestamps.length < MAX_CUSTOM_RECOMMENDATIONS) return null
  const oldest = Math.min(...timestamps)
  return new Date(oldest + WINDOW_MS)
}

export function formatResetTime(resetAt: Date | null): string {
  if (!resetAt) return ""
  const diffMs = resetAt.getTime() - Date.now()
  if (diffMs <= 0) return "soon"

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
