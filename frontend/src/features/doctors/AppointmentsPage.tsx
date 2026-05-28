import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Check,
  Clock,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarOff,
  FileText,
} from "lucide-react"
import { AppLayout } from "@/components/common/AppLayout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useMyAppointments,
  useCancelAppointment,
  useConfirmAppointment,
} from "@/hooks/use-appointments"
import { PatientDetails } from "@/components/common/PatientDetails"
import { JoinSessionButton } from "@/components/common/JoinSessionButton"
import type { Appointment, AppointmentStatus } from "@/types/appointment"

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
  COMPLETED: { label: "Completed", className: "bg-blue-100 text-blue-700 border-blue-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
}

const CONSULTATION_DURATION_MIN = 30

function DoctorAppointmentCard({ appointment }: { appointment: Appointment }) {
  const navigate = useNavigate()
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment()
  const { mutate: confirmAppointment, isPending: isConfirming } = useConfirmAppointment()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")

  const statusConfig = STATUS_CONFIG[appointment.status]
  const isPending = appointment.status === "PENDING"
  const isConfirmed = appointment.status === "CONFIRMED"
  const canCancel = appointment.status === "PENDING" || appointment.status === "CONFIRMED"
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
                <PatientDetails
                  patient={appointment.patient}
                  appointmentNotes={appointment.notes}
                />
              </div>
            </div>

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

          {(isPending || isConfirmed || canCancel || isCompleted) && (
            <div className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-2.5">
              {isPending && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={isConfirming}
                    >
                      <Check className="size-3.5" />
                      Confirm
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm appointment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Confirm the appointment with {appointment.patient.firstName}{" "}
                        {appointment.patient.lastName} on {dateStr} at {timeStr}. The
                        patient will be notified and you can join the session once
                        confirmed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Not yet</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => confirmAppointment(appointment.id)}
                      >
                        Confirm Appointment
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {isConfirmed && (
                <JoinSessionButton
                  appointmentId={appointment.id}
                  scheduledAt={appointment.scheduledAt}
                  durationMin={CONSULTATION_DURATION_MIN}
                />
              )}

              {isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    navigate(`/doctor/medical-records?appointment=${appointment.id}`)
                  }
                >
                  <FileText className="size-3.5" />
                  View Records
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
                    Cancel Appointment
                  </Button>

                  <Dialog open={cancelOpen} onOpenChange={(open) => !open && handleCancelClose()}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Cancel appointment?</DialogTitle>
                        <DialogDescription>
                          This will cancel the appointment with {appointment.patient.firstName}{" "}
                          {appointment.patient.lastName} on {dateStr} at {timeStr}.
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
    </>
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
