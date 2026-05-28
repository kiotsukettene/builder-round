import { useNavigate } from "react-router-dom"
import { CalendarDays, Clock, DollarSign, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  const { mutate: bookAppointment, isPending } = useBookAppointment()

  const { dateStr, timeStr } = {
    dateStr: selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    timeStr: formatSlotTime(selectedSlot),
  }

  function handleConfirm() {
    bookAppointment(
      { doctorId: doctor.id, scheduledAt: buildScheduledAtIso(selectedDate, selectedSlot) },
      {
        onSuccess: () => {
          onOpenChange(false)
          navigate("/appointments")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>
            Review the details below before confirming your booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Doctor info */}
          <div className="flex items-center gap-3">
            <Avatar className="size-12 shrink-0">
              <AvatarImage
                src={doctor.profilePicture ?? undefined}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              />
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
              <Badge variant="outline" className="mt-0.5 text-xs">
                {doctor.specialization}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Booking details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{dateStr}</p>
                <p className="text-sm text-muted-foreground">at {timeStr}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm">
                <span className="font-medium">{consultationDuration} min</span>
                <span className="text-muted-foreground"> consultation</span>
              </p>
            </div>

            {consultationFee !== null && (
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm">
                  <span className="font-medium">${consultationFee}</span>
                  <span className="text-muted-foreground"> consultation fee</span>
                </p>
              </div>
            )}
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            Your appointment will be marked as <strong>Pending</strong> until the doctor confirms
            it. You will receive a notification once confirmed.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
