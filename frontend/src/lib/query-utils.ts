import type { UseQueryResult } from "@tanstack/react-query"

/** True during initial load or while showing placeholder data from a prior query key. */
export function isQueryContentLoading<TData, TError>(
  query: Pick<UseQueryResult<TData, TError>, "isLoading" | "isPlaceholderData">
): boolean {
  return query.isLoading || query.isPlaceholderData
}
