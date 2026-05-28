import { Link, useNavigate } from "react-router-dom"
import { User, LogOut, Menu, Stethoscope, Sparkles, CalendarDays, CalendarClock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth.store"
import { useLogout } from "@/hooks/use-auth"
import { NotificationBell } from "@/components/common/NotificationBell"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()
  const navigate = useNavigate()

  const profile = user?.role === "PATIENT" ? user.patient : user?.doctor
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.email ?? ""
  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : "?"

  const profilePath = user?.role === "DOCTOR" ? "/doctor/profile" : "/profile"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to={profilePath} className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">TellMD</span>
          </Link>

          <nav className="flex items-center gap-1">
            {user?.role === "PATIENT" && (
              <>
                <Link
                  to="/recommendations"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
                >
                  <Sparkles className="size-3.5" />
                  AI Match
                </Link>
                <Link
                  to="/doctors"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
                >
                  <Stethoscope className="size-3.5" />
                  Find Doctors
                </Link>
                <Link
                  to="/appointments"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
                >
                  <CalendarDays className="size-3.5" />
                  Appointments
                </Link>
                <Link
                  to="/medical-records"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
                >
                  <FileText className="size-3.5" />
                  Medical Records
                </Link>
              </>
            )}
            {user?.role === "DOCTOR" && (
              <>
                <Link
                  to="/doctor/schedule"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
                >
                  <CalendarClock className="size-3.5" />
                  Schedule
                </Link>
                <Link
                  to="/doctor/appointments"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
                >
                  <CalendarDays className="size-3.5" />
                  Appointments
                </Link>
                <Link
                  to="/doctor/medical-records"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
                >
                  <FileText className="size-3.5" />
                  Medical Records
                </Link>
              </>
            )}
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="size-7">
                    <AvatarImage src={profile?.profilePicture ?? undefined} alt={displayName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:block">{displayName}</span>
                  <Menu className="size-4 sm:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(profilePath)}>
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>
                {user?.role === "PATIENT" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/recommendations")}>
                      <Sparkles className="size-4" />
                      AI Match
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/doctors")}>
                      <Stethoscope className="size-4" />
                      Find Doctors
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/appointments")}>
                      <CalendarDays className="size-4" />
                      Appointments
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/medical-records")}>
                      <FileText className="size-4" />
                      Medical Records
                    </DropdownMenuItem>
                  </>
                )}
                {user?.role === "DOCTOR" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/doctor/schedule")}>
                      <CalendarClock className="size-4" />
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/doctor/appointments")}>
                      <CalendarDays className="size-4" />
                      Appointments
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/doctor/medical-records")}>
                      <FileText className="size-4" />
                      Medical Records
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isPending}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  {isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
