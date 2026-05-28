import { useCallback, useMemo, useState } from "react"
import { useAuthStore } from "@/store/auth.store"
import {
  canUseCustomRecommendation,
  formatResetTime,
  getCustomRecommendationResetAt,
  getRemainingCustomRecommendations,
  MAX_CUSTOM_RECOMMENDATIONS,
  recordCustomRecommendationUsage,
} from "@/utils/recommendation-limit"

export function useRecommendationLimit() {
  const userId = useAuthStore((s) => s.user?.id)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const remaining = useMemo(() => {
    void version
    return userId ? getRemainingCustomRecommendations(userId) : 0
  }, [userId, version])

  const canUse = useMemo(() => {
    void version
    return userId ? canUseCustomRecommendation(userId) : false
  }, [userId, version])

  const resetAt = useMemo(() => {
    void version
    return userId ? getCustomRecommendationResetAt(userId) : null
  }, [userId, version])

  const resetLabel = useMemo(() => formatResetTime(resetAt), [resetAt])

  const recordUsage = useCallback(() => {
    if (!userId) return
    recordCustomRecommendationUsage(userId)
    refresh()
  }, [userId, refresh])

  return {
    remaining,
    canUse,
    resetAt,
    resetLabel,
    maxAttempts: MAX_CUSTOM_RECOMMENDATIONS,
    recordUsage,
    refresh,
  }
}
