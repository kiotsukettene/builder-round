import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number | null
  totalReviews?: number
  showCount?: boolean
  size?: "sm" | "md"
  className?: string
}

export function StarRating({
  rating,
  totalReviews = 0,
  showCount = true,
  size = "sm",
  className,
}: StarRatingProps) {
  const starSize = size === "sm" ? "size-3.5" : "size-4"
  const textSize = size === "sm" ? "text-xs" : "text-sm"

  if (rating === null || rating === 0) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(starSize, "text-muted-foreground/30")}
          />
        ))}
        {showCount && (
          <span className={cn(textSize, "text-muted-foreground")}>
            {totalReviews === 0 ? "No reviews" : `(${totalReviews})`}
          </span>
        )}
      </div>
    )
  }

  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < fullStars
        const half = !filled && i === fullStars && hasHalf
        return (
          <Star
            key={i}
            className={cn(
              starSize,
              filled || half ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            )}
          />
        )
      })}
      <span className={cn(textSize, "font-medium tabular-nums text-foreground")}>
        {rating.toFixed(1)}
      </span>
      {showCount && totalReviews > 0 && (
        <span className={cn(textSize, "text-muted-foreground")}>
          ({totalReviews})
        </span>
      )}
    </div>
  )
}
