import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useDoctorSlots } from "@/hooks/use-discovery"
import { useRescheduleAppointment } from "@/hooks/use-appointments"
import type { Appointment } from "@/types/appointment"
import {
  buildScheduledAtIso,
  formatDateQueryParam,
  formatSlotTime,
} from "@/utils/appointment-datetime"

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment
}

export function RescheduleDialog({ open, onOpenChange, appointment }: RescheduleDialogProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(today))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const dateStr = formatDateQueryParam(selectedDate)
  const { data: slotsData, isLoading } = useDoctorSlots(appointment.doctor.id, dateStr)
  const { mutate: reschedule, isPending } = useRescheduleAppointment()

  function shiftDate(days: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    if (d >= today) {
      setSelectedDate(d)
      setSelectedSlot(null)
    }
  }

  function handleConfirm() {
    if (!selectedSlot) return
    reschedule(
      { id: appointment.id, payload: { scheduledAt: buildScheduledAtIso(selectedDate, selectedSlot) } },
      {
        onSuccess: () => {
          onOpenChange(false)
          setSelectedSlot(null)
        },
      }
    )
  }

  const currentDate = new Date(appointment.scheduledAt)
  const currentDateStr = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  const currentTimeStr = currentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const displayDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Current: {currentDateStr} at {currentTimeStr} with Dr.{" "}
            {appointment.doctor.firstName} {appointment.doctor.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Date navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => shiftDate(-1)}
              disabled={selectedDate <= today}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="flex-1 text-center text-sm font-medium">{displayDate}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => shiftDate(1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Slots */}
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          ) : slotsData && slotsData.slots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {slotsData.slots.map((slot) => (
                <Button
                  key={slot.startTime}
                  variant={selectedSlot === slot.startTime ? "default" : "outline"}
                  size="sm"
                  disabled={!slot.available}
                  className={!slot.available ? "line-through opacity-40" : ""}
                  onClick={() => slot.available && setSelectedSlot(
                    selectedSlot === slot.startTime ? null : slot.startTime
                  )}
                >
                  {formatSlotTime(slot.startTime)}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" />
              No available slots for this day.
            </div>
          )}

          {selectedSlot && (
            <>
              <Separator />
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                New time: <span className="font-medium text-foreground">{formatSlotTime(selectedSlot)}</span>{" "}
                on <span className="font-medium text-foreground">{displayDate}</span>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedSlot || isPending}>
            {isPending ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
