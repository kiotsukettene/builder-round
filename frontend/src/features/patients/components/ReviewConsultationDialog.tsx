import { useState } from "react"
import { Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useSubmitReview } from "@/hooks/use-rating"

interface ReviewConsultationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  doctorName: string
}

export function ReviewConsultationDialog({
  open,
  onOpenChange,
  appointmentId,
  doctorName,
}: ReviewConsultationDialogProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const { mutate: submitReview, isPending } = useSubmitReview(appointmentId)

  function handleSubmit() {
    if (rating === 0) return
    submitReview(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setRating(0)
          setComment("")
          onOpenChange(false)
        },
      }
    )
  }

  const displayRating = hovered || rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Consultation</DialogTitle>
          <DialogDescription>
            How was your experience with Dr. {doctorName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star selector */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onMouseEnter={() => setHovered(i + 1)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    className={cn(
                      "size-9 transition-colors",
                      i < displayRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30 hover:text-amber-300"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {displayRating === 0 && "Select a rating"}
              {displayRating === 1 && "Poor"}
              {displayRating === 2 && "Fair"}
              {displayRating === 3 && "Good"}
              {displayRating === 4 && "Very Good"}
              {displayRating === 5 && "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <Label htmlFor="review-comment" className="text-sm">
              Comment <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              className="resize-none text-sm"
            />
            <p className="text-right text-xs text-muted-foreground">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || rating === 0}>
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
