import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { AppLayout } from "@/components/common/AppLayout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AppointmentCard } from "@/features/patients/components/AppointmentCard"
import { useMyAppointments } from "@/hooks/use-appointments"
import type { AppointmentStatus } from "@/types/appointment"

type TabValue = "upcoming" | "missed" | "completed" | "cancelled" | "all"

const TAB_STATUS_MAP: Record<TabValue, AppointmentStatus | undefined> = {
  upcoming: undefined,
  missed: "MISSED",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  all: undefined,
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}

function EmptyState({ tab, onFindDoctor }: { tab: TabValue; onFindDoctor: () => void }) {
  const messages: Record<TabValue, { title: string; description: string }> = {
    upcoming: {
      title: "No upcoming appointments",
      description: "Find a doctor and book your first consultation.",
    },
    missed: {
      title: "No missed appointments",
      description: "Appointments that pass without a completed session will appear here.",
    },
    completed: {
      title: "No completed appointments yet",
      description: "Your completed consultations will appear here.",
    },
    cancelled: {
      title: "No cancelled appointments",
      description: "You haven't cancelled any appointments.",
    },
    all: {
      title: "No appointments yet",
      description: "Find a doctor and book your first consultation.",
    },
  }

  const msg = messages[tab]

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
      <CalendarPlus className="size-10 text-muted-foreground/40" />
      <div>
        <p className="font-medium">{msg.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{msg.description}</p>
      </div>
      {(tab === "upcoming" || tab === "all") && (
        <Button variant="outline" onClick={onFindDoctor}>
          Find a Doctor
        </Button>
      )}
    </div>
  )
}

export function AppointmentsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming")
  const [page, setPage] = useState(1)

  const status = TAB_STATUS_MAP[activeTab]

  const listQuery =
    activeTab === "upcoming"
      ? { page, limit: 10, upcoming: true as const }
      : { page, limit: 10, status }

  const { data, isContentLoading } = useMyAppointments(listQuery)

  const appointments = data?.appointments ?? []
  const meta = data?.meta

  function handleTabChange(value: string) {
    setActiveTab(value as TabValue)
    setPage(1)
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your consultation appointments.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {isContentLoading ? (
          <AppointmentsSkeleton />
        ) : appointments.length === 0 ? (
          <EmptyState tab={activeTab} onFindDoctor={() => navigate("/doctors")} />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                role="PATIENT"
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta &&
          meta.totalPages > 1 &&
          (activeTab !== "upcoming" || appointments.length > 0) && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1 || isContentLoading}
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
              disabled={page === meta.totalPages || isContentLoading}
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
