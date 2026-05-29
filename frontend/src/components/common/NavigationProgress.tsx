import { useIsFetching } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

export function NavigationProgress() {
  const isFetching = useIsFetching() > 0

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5 overflow-hidden bg-primary/15 transition-opacity duration-150",
        isFetching ? "opacity-100" : "opacity-0"
      )}
      aria-hidden
    >
      <div
        className={cn(
          "h-full w-1/3 bg-primary",
          isFetching && "animate-[navigation-progress_1s_ease-in-out_infinite]"
        )}
      />
    </div>
  )
}
