import { useState } from "react"
import { Sparkles, X, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface RecommendationBannerProps {
  specialization: string
  explanation: string
}

export function RecommendationBanner({ specialization, explanation }: RecommendationBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  if (dismissed) return null

  return (
    <div className="relative flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="size-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          AI recommends a{" "}
          <span className="text-primary">{specialization}</span>
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{explanation}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => navigate(`/recommendations`)}
        >
          View details
          <ChevronRight className="size-3" />
        </Button>
        <button
          type="button"
          aria-label="Dismiss recommendation"
          onClick={() => setDismissed(true)}
          className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
