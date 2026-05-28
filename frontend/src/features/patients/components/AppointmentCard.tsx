import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, Clock, User, Video, FileText, RotateCcw, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RescheduleDialog } from "@/features/patients/components/RescheduleDialog"
import { useCancelAppointment } from "@/hooks/use-appointments"
import type { Appointment } from "@/types/appointment"
import {
  getRelativeTimeLabel,
  isWithinJoinWindow,
} from "@/utils/appointment-datetime"

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-700 border-green-200" },
  COMPLETED: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
}

const CONSULTATION_DURATION_MIN = 30

interface AppointmentCardProps {
  appointment: Appointment
  role: "PATIENT" | "DOCTOR"
}

export function AppointmentCard({ appointment, role }: AppointmentCardProps) {
  const navigate = useNavigate()
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment()
  const [rescheduleOpen, setRescheduleOpen] = useState(false)

  const isPatient = role === "PATIENT"
  const counterpart = isPatient ? appointment.doctor : appointment.patient
  const counterpartName = isPatient
    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : `${appointment.patient.firstName} ${appointment.patient.lastName}`
  const counterpartSub = isPatient ? appointment.doctor.specialization : "Patient"

  const statusConfig = STATUS_CONFIG[appointment.status]
  const canCancel = appointment.status === "PENDING" || appointment.status === "CONFIRMED"
  const canReschedule = isPatient && (appointment.status === "PENDING" || appointment.status === "CONFIRMED")
  const isActive = appointment.status === "PENDING" || appointment.status === "CONFIRMED"
  const isWithinWindow = isWithinJoinWindow(
    appointment.scheduledAt,
    CONSULTATION_DURATION_MIN,
  )
  const timeLabel = getRelativeTimeLabel(
    appointment.scheduledAt,
    CONSULTATION_DURATION_MIN,
  )
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
                  className="flex min-w-0 flex-1 items-start gap-3 rounded-md text-left transition-colors hover:bg-muted/40 -m-1 p-1"
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

          {/* Actions footer */}
          {(canCancel || canReschedule || isActive || isCompleted) && (
            <div className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
              {isActive && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={isWithinWindow ? "default" : "outline"}
                    className="gap-1.5"
                    onClick={() => navigate(`/consultation/${appointment.id}`)}
                  >
                    <Video className="size-3.5" />
                    {isWithinWindow ? "Join Now" : "Join Session"}
                  </Button>
                  <span className="text-xs text-muted-foreground">{timeLabel}</span>
                </div>
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
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setRescheduleOpen(true)}
                >
                  <RotateCcw className="size-3.5" />
                  Reschedule
                </Button>
              )}

              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isCancelling}
                    >
                      <X className="size-3.5" />
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will cancel your appointment with {counterpartName} on {dateStr} at {timeStr}.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => cancelAppointment(appointment.id)}
                      >
                        Cancel Appointment
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
