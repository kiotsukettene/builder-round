import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, Clock, User, FileText, RotateCcw, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { JoinSessionButton } from "@/components/common/JoinSessionButton"
import { RescheduleDialog } from "@/features/patients/components/RescheduleDialog"
import { useCancelAppointment } from "@/hooks/use-appointments"
import { isSessionWindowPassed } from "@/utils/appointment-datetime"
import type { Appointment } from "@/types/appointment"

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-700 border-green-200" },
  COMPLETED: { label: "Completed", className: "bg-blue-100 text-blue-700 border-blue-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
  MISSED: { label: "Missed", className: "bg-orange-100 text-orange-700 border-orange-200" },
}

interface AppointmentCardProps {
  appointment: Appointment
  role: "PATIENT" | "DOCTOR"
}

export function AppointmentCard({ appointment, role }: AppointmentCardProps) {
  const navigate = useNavigate()
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment()
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")

  const isPatient = role === "PATIENT"
  const counterpart = isPatient ? appointment.doctor : appointment.patient
  const counterpartName = isPatient
    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : `${appointment.patient.firstName} ${appointment.patient.lastName}`
  const counterpartSub = isPatient ? appointment.doctor.specialization : "Patient"

  const statusConfig = STATUS_CONFIG[appointment.status]
  const durationMin = appointment.doctor.consultationDuration
  const isMissed = appointment.status === "MISSED"
  const sessionPassed =
    isMissed ||
    (appointment.status === "CONFIRMED" &&
      isSessionWindowPassed(appointment.scheduledAt, durationMin))
  const canCancel =
    appointment.status === "PENDING" ||
    appointment.status === "CONFIRMED" ||
    appointment.status === "MISSED"
  const canReschedule =
    isPatient &&
    (appointment.status === "PENDING" ||
      appointment.status === "CONFIRMED" ||
      appointment.status === "MISSED")
  const isConfirmed = appointment.status === "CONFIRMED" && !sessionPassed
  const isCompleted = appointment.status === "COMPLETED"
  const medicalRecordsPath = isPatient
    ? `/medical-records?appointment=${appointment.id}`
    : `/doctor/medical-records?appointment=${appointment.id}`

  const scheduledDate = new Date(appointment.scheduledAt)
  const dateStr = scheduledDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const timeStr = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  function handleCancelClose() {
    setCancelOpen(false)
    setCancellationReason("")
  }

  function handleCancelSubmit() {
    const reason = cancellationReason.trim()
    if (!reason) return

    cancelAppointment(
      { id: appointment.id, payload: { cancellationReason: reason } },
      { onSuccess: handleCancelClose },
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5">
            {/* Doctor/Patient info */}
            <div className="flex flex-1 items-start gap-3">
              {isPatient ? (
                <button
                  type="button"
                  onClick={() => navigate(`/doctors/${appointment.doctor.id}`)}
                  className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-md text-left transition-colors hover:bg-muted/40 -m-1 p-1"
                >
                  <Avatar className="size-11 shrink-0">
                    <AvatarImage
                      src={counterpart.profilePicture ?? undefined}
                      alt={counterpartName}
                    />
                    <AvatarFallback>
                      <User className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold hover:underline">
                      {counterpartName}
                    </p>
                    <p className="text-xs text-muted-foreground">{counterpartSub}</p>
                  </div>
                </button>
              ) : (
                <>
                  <Avatar className="size-11 shrink-0">
                    <AvatarImage
                      src={counterpart.profilePicture ?? undefined}
                      alt={counterpartName}
                    />
                    <AvatarFallback>
                      <User className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{counterpartName}</p>
                    <p className="text-xs text-muted-foreground">{counterpartSub}</p>
                  </div>
                </>
              )}
            </div>

            {/* Date + status */}
            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
              <Badge
                variant="outline"
                className={`shrink-0 text-xs font-medium ${statusConfig.className}`}
              >
                {statusConfig.label}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {dateStr}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {timeStr}
              </div>
            </div>
          </div>

          {sessionPassed && (
            <div className="border-t bg-orange-50 px-4 py-2.5 text-sm text-orange-800">
              This session window has passed. Reschedule if you still need a consultation.
            </div>
          )}

          {/* Actions footer */}
          {(canCancel || canReschedule || isConfirmed || isCompleted) && (
            <div className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
              {isConfirmed && (
                <JoinSessionButton
                  appointmentId={appointment.id}
                  scheduledAt={appointment.scheduledAt}
                  durationMin={durationMin}
                />
              )}

              {isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => navigate(medicalRecordsPath)}
                >
                  <FileText className="size-3.5" />
                  View Records
                </Button>
              )}

              {canReschedule && (
                <Button
                  variant={isMissed ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setRescheduleOpen(true)}
                >
                  <RotateCcw className="size-3.5" />
                  Reschedule
                </Button>
              )}

              {canCancel && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isCancelling}
                    onClick={() => setCancelOpen(true)}
                  >
                    <X className="size-3.5" />
                    Cancel
                  </Button>

                  <Dialog open={cancelOpen} onOpenChange={(open) => !open && handleCancelClose()}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Cancel appointment?</DialogTitle>
                        <DialogDescription>
                          This will cancel your appointment with {counterpartName} on {dateStr} at {timeStr}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-1.5">
                        <Label htmlFor={`cancel-reason-${appointment.id}`} className="text-sm">
                          Reason for cancellation
                        </Label>
                        <Textarea
                          id={`cancel-reason-${appointment.id}`}
                          placeholder="Please provide a reason..."
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          rows={3}
                          maxLength={500}
                          className="resize-none text-sm"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleCancelClose}>
                          Keep Appointment
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={!cancellationReason.trim() || isCancelling}
                          onClick={handleCancelSubmit}
                        >
                          Cancel Appointment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {canReschedule && (
        <RescheduleDialog
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          appointment={appointment}
        />
      )}
    </>
  )
}
