import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, Clock, DollarSign } from "lucide-react"
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
import { useBookAppointment } from "@/hooks/use-appointments"
import type { PublicDoctorWithAvailability } from "@/types/doctor"
import { buildScheduledAtIso, formatSlotTime } from "@/utils/appointment-datetime"

interface BookingConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor: PublicDoctorWithAvailability
  selectedDate: Date
  selectedSlot: string
  consultationDuration: number
  consultationFee: number | null
}

export function BookingConfirmDialog({
  open,
  onOpenChange,
  doctor,
  selectedDate,
  selectedSlot,
  consultationDuration,
  consultationFee,
}: BookingConfirmDialogProps) {
  const navigate = useNavigate()
  const [note, setNote] = useState("")
  const { mutate: bookAppointment, isPending } = useBookAppointment()

  const dateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const timeLabel = formatSlotTime(selectedSlot)

  function handleClose() {
    onOpenChange(false)
    setNote("")
  }

  function handleConfirm() {
    const trimmedNote = note.trim()
    bookAppointment(
      {
        doctorId: doctor.id,
        scheduledAt: buildScheduledAtIso(selectedDate, selectedSlot),
        ...(trimmedNote && { notes: trimmedNote }),
      },
      {
        onSuccess: () => {
          handleClose()
          navigate("/appointments")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm consultation booking</DialogTitle>
          <DialogDescription>
            Review your appointment details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <div className="space-y-1.5 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" />
              <span>{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              <span>
                {timeLabel} · {consultationDuration} min
              </span>
            </div>
            {consultationFee !== null && (
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 shrink-0" />
                <span>${consultationFee} consultation fee</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-note" className="text-sm">
            Note for doctor <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="booking-note"
            placeholder="Share symptoms, concerns, or anything the doctor should know..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={1000}
            className="resize-none text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Back
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
