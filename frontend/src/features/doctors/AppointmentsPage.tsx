import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Clock,
  User,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarOff,
  Phone,
  Cake,
  Ruler,
  Weight,
  FileText,
} from "lucide-react"
import { AppLayout } from "@/components/common/AppLayout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useMyAppointments, useCancelAppointment } from "@/hooks/use-appointments"
import type { Appointment, AppointmentPatient, AppointmentStatus } from "@/types/appointment"

type TabValue = "upcoming" | "completed" | "cancelled" | "all"

const TAB_STATUS_MAP: Record<TabValue, AppointmentStatus | undefined> = {
  upcoming: undefined,
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  all: undefined,
}

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-700 border-green-200" },
  COMPLETED: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
}

function isJoinable(scheduledAt: string): boolean {
  const scheduled = new Date(scheduledAt)
  const now = new Date()
  const windowStart = new Date(scheduled.getTime() - 10 * 60 * 1000)
  const windowEnd = new Date(scheduled.getTime() + 60 * 60 * 1000)
  return now >= windowStart && now <= windowEnd
}

function getAge(birthday: string): number {
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

function formatBirthday(birthday: string | null): string | null {
  if (!birthday) return null
  const date = new Date(birthday)
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${formatted} (${getAge(birthday)} yrs)`
}

function PatientDetails({ patient }: { patient: AppointmentPatient }) {
  const birthday = formatBirthday(patient.birthday)
  const hasVitals = patient.weight !== null || patient.height !== null
  const vitals =
    patient.weight !== null && patient.height !== null
      ? `${patient.weight} kg · ${patient.height} cm`
      : patient.weight !== null
        ? `${patient.weight} kg`
        : patient.height !== null
          ? `${patient.height} cm`
          : null

  const hasDetails = patient.phone || birthday || hasVitals || patient.history

  if (!hasDetails) {
    return (
      <p className="text-xs text-muted-foreground">
        No additional patient profile details available.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {(patient.phone || birthday) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {patient.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              <span>{patient.phone}</span>
            </div>
          )}
          {birthday && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cake className="size-3.5 shrink-0" />
              <span>{birthday}</span>
            </div>
          )}
        </div>
      )}

      {vitals && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Weight className="size-3.5 shrink-0" />
            <Ruler className="size-3.5 shrink-0" />
            <span>{vitals}</span>
          </div>
        </div>
      )}

      {patient.history && (
        <div className="rounded-md bg-muted/40 p-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="size-3.5" />
            Medical History
          </div>
          <p className="text-xs leading-relaxed text-foreground/80">{patient.history}</p>
        </div>
      )}
    </div>
  )
}

function DoctorAppointmentCard({ appointment }: { appointment: Appointment }) {
  const navigate = useNavigate()
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment()

  const statusConfig = STATUS_CONFIG[appointment.status]
  const canCancel = appointment.status === "PENDING" || appointment.status === "CONFIRMED"
  const canJoin = (appointment.status === "PENDING" || appointment.status === "CONFIRMED") &&
    isJoinable(appointment.scheduledAt)

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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5">
          {/* Patient info */}
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Avatar className="size-11 shrink-0">
              <AvatarImage
                src={appointment.patient.profilePicture ?? undefined}
                alt={`${appointment.patient.firstName} ${appointment.patient.lastName}`}
              />
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="truncate font-semibold">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </p>
                <p className="text-xs text-muted-foreground">Patient</p>
              </div>
              <PatientDetails patient={appointment.patient} />
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

        {/* Actions */}
        {(canJoin || canCancel) && (
          <div className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
            {canJoin && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => navigate(`/consultation/${appointment.id}`)}
              >
                <Video className="size-3.5" />
                Join Session
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
                      This will cancel the appointment with {appointment.patient.firstName}{" "}
                      {appointment.patient.lastName} on {dateStr} at {timeStr}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep</AlertDialogCancel>
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
  )
}

export function DoctorAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming")
  const [page, setPage] = useState(1)

  const status = TAB_STATUS_MAP[activeTab]

  const { data, isLoading } = useMyAppointments({ page, limit: 10, status })

  const appointments = data?.appointments ?? []
  const meta = data?.meta

  const displayed = activeTab === "upcoming"
    ? appointments.filter((a) => a.status === "PENDING" || a.status === "CONFIRMED")
    : appointments

  function handleTabChange(value: string) {
    setActiveTab(value as TabValue)
    setPage(1)
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your patient appointments.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
            <CalendarOff className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No appointments found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === "upcoming"
                  ? "No upcoming appointments. Set your schedule so patients can book."
                  : "No appointments in this category."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((appointment) => (
              <DoctorAppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === meta.totalPages}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
