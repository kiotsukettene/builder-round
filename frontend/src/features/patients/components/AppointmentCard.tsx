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

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-700 border-green-200" },
  COMPLETED: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
}

function isJoinable(scheduledAt: string, durationMin: number): boolean {
  const scheduled = new Date(scheduledAt)
  const now = new Date()
  const windowStart = new Date(scheduled.getTime() - 10 * 60 * 1000)
  const windowEnd = new Date(scheduled.getTime() + durationMin * 60 * 1000)
  return now >= windowStart && now <= windowEnd
}

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
  const canJoin = (appointment.status === "PENDING" || appointment.status === "CONFIRMED") &&
    isJoinable(appointment.scheduledAt, 30)
  const isCompleted = appointment.status === "COMPLETED"

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
          {(canCancel || canReschedule || canJoin || isCompleted) && (
            <div className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
              {canJoin && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => navigate(`/consultation/${appointment.id}`)}
                >
                  <Video className="size-3.5" />
                  Join Now
                </Button>
              )}

              {isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => navigate(`/consultation/${appointment.id}`)}
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
