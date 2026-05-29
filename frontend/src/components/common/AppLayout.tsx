import { Link, useLocation, useNavigate } from "react-router-dom"
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
import { NavigationProgress } from "@/components/common/NavigationProgress"
import { NotificationBell } from "@/components/common/NotificationBell"
import { useAppointmentMessagesSocket } from "@/hooks/use-appointment-messages"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
}

function isNavActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`)
}

const navLinkBase =
  "hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm sm:flex"
const navLinkInactive = "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
const navLinkActive = "bg-accent font-medium text-foreground"

interface NavLinkItemProps {
  to: string
  pathname: string
  icon: React.ReactNode
  label: string
}

function NavLinkItem({ to, pathname, icon, label }: NavLinkItemProps) {
  const active = isNavActive(pathname, to)
  return (
    <Link
      to={to}
      className={cn(navLinkBase, active ? navLinkActive : navLinkInactive)}
    >
      {icon}
      {label}
    </Link>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useAppointmentMessagesSocket()

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
      <NavigationProgress />
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to={profilePath} className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">TellMD</span>
          </Link>

          <nav className="flex items-center gap-1">
            {user?.role === "PATIENT" && (
              <>
                <NavLinkItem
                  to="/recommendations"
                  pathname={pathname}
                  icon={<Sparkles className="size-3.5" />}
                  label="AI Match"
                />
                <NavLinkItem
                  to="/doctors"
                  pathname={pathname}
                  icon={<Stethoscope className="size-3.5" />}
                  label="Find Doctors"
                />
                <NavLinkItem
                  to="/appointments"
                  pathname={pathname}
                  icon={<CalendarDays className="size-3.5" />}
                  label="Appointments"
                />
                <NavLinkItem
                  to="/medical-records"
                  pathname={pathname}
                  icon={<FileText className="size-3.5" />}
                  label="Medical Records"
                />
              </>
            )}
            {user?.role === "DOCTOR" && (
              <>
                <NavLinkItem
                  to="/doctor/schedule"
                  pathname={pathname}
                  icon={<CalendarClock className="size-3.5" />}
                  label="Schedule"
                />
                <NavLinkItem
                  to="/doctor/appointments"
                  pathname={pathname}
                  icon={<CalendarDays className="size-3.5" />}
                  label="Appointments"
                />
                <NavLinkItem
                  to="/doctor/medical-records"
                  pathname={pathname}
                  icon={<FileText className="size-3.5" />}
                  label="Medical Records"
                />
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
                  <Menu className="size-4 sm:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal sm:hidden">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem onClick={() => navigate(profilePath)}>
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>
                {user?.role === "PATIENT" && (
                  <>
                    <DropdownMenuItem
                      className="sm:hidden"
                      onClick={() => navigate("/recommendations")}
                    >
                      <Sparkles className="size-4" />
                      AI Match
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="sm:hidden"
                      onClick={() => navigate("/doctors")}
                    >
                      <Stethoscope className="size-4" />
                      Find Doctors
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="sm:hidden"
                      onClick={() => navigate("/appointments")}
                    >
                      <CalendarDays className="size-4" />
                      Appointments
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="sm:hidden"
                      onClick={() => navigate("/medical-records")}
                    >
                      <FileText className="size-4" />
                      Medical Records
                    </DropdownMenuItem>
                  </>
                )}
                {user?.role === "DOCTOR" && (
                  <>
                    <DropdownMenuItem
                      className="sm:hidden"
                      onClick={() => navigate("/doctor/schedule")}
                    >
                      <CalendarClock className="size-4" />
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="sm:hidden"
                      onClick={() => navigate("/doctor/appointments")}
                    >
                      <CalendarDays className="size-4" />
                      Appointments
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="sm:hidden"
                      onClick={() => navigate("/doctor/medical-records")}
                    >
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
