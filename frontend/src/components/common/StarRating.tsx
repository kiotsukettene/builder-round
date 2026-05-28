import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number | null
  totalReviews?: number
  size?: "sm" | "md"
  showCount?: boolean
  className?: string
}

export function StarRating({
  rating,
  totalReviews = 0,
  size = "sm",
  showCount = true,
  className,
}: StarRatingProps) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4"
  const displayRating = rating ?? 0

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex items-center">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = displayRating >= index + 1
          const half = !filled && displayRating >= index + 0.5

          return (
            <Star
              key={index}
              className={cn(
                iconSize,
                filled || half
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          )
        })}
      </span>
      {rating !== null ? (
        <span className="text-xs text-muted-foreground">
          {rating.toFixed(1)}
          {showCount && totalReviews > 0 && ` (${totalReviews})`}
        </span>
      ) : showCount ? (
        <span className="text-xs text-muted-foreground">No reviews yet</span>
      ) : null}
    </span>
  )
}

interface InteractiveStarRatingProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function InteractiveStarRating({
  value,
  onChange,
  disabled = false,
}: InteractiveStarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1
        const filled = value >= starValue

        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            aria-label={`Rate ${starValue} stars`}
            onClick={() => onChange(starValue)}
            className="rounded p-0.5 transition-colors hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star
              className={cn(
                "size-7",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
