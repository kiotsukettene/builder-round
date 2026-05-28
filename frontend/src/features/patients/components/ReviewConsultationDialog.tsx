import { useState } from "react"
import { toast } from "sonner"
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
import { InteractiveStarRating } from "@/components/common/StarRating"
import { useSubmitReview } from "@/hooks/use-rating"

interface ReviewConsultationDialogProps {
  appointmentId: string
  doctorName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function ReviewConsultationDialog({
  appointmentId,
  doctorName,
  open,
  onOpenChange,
  onComplete,
}: ReviewConsultationDialogProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const { mutateAsync: submitReview, isPending } = useSubmitReview()

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Please select a star rating.")
      return
    }

    try {
      await submitReview({
        appointmentId,
        data: {
          rating,
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        },
      })
      onOpenChange(false)
      onComplete?.()
    } catch {
      // Error toast handled in hook
    }
  }

  function handleSkip() {
    onOpenChange(false)
    onComplete?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your consultation</DialogTitle>
          <DialogDescription>
            {doctorName
              ? `How was your consultation with Dr. ${doctorName}?`
              : "Share your experience to help other patients find the right doctor."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Your rating</Label>
            <InteractiveStarRating value={rating} onChange={setRating} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Comment (optional)</Label>
            <Textarea
              id="review-comment"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              disabled={isPending}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            You can submit a review once the doctor has ended the consultation.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip} disabled={isPending}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || rating === 0}>
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
