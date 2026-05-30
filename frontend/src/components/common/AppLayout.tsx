import { Link, useLocation, useNavigate } from "react-router-dom"
import { User, LogOut, Menu, Stethoscope, Sparkles, CalendarDays, CalendarClock, FileText, Bell } from "lucide-react"
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
import { usePushNotifications } from "@/hooks/use-push-notifications"
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

function AIMatchNavLink({ pathname }: { pathname: string }) {
  const active = isNavActive(pathname, "/recommendations")

  return (
    <Link
      to="/recommendations"
      className={cn(
        "group/ai-match hidden items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all sm:flex",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-primary/25 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10 hover:shadow-sm"
      )}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full transition-colors",
          active
            ? "bg-primary-foreground/15"
            : "bg-primary/10 group-hover/ai-match:bg-primary/15"
        )}
      >
        <Sparkles
          className={cn(
            "size-3 transition-transform group-hover/ai-match:scale-110",
            active ? "text-primary-foreground" : "text-primary"
          )}
        />
      </span>
      AI Match
    </Link>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useAppointmentMessagesSocket()
  usePushNotifications()

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
          <Link to={profilePath} className="flex shrink-0 items-center">
            <img
              src="/tellMd-logo.svg"
              alt="TellMD"
              className="h-7 w-auto sm:h-24"
            />
          </Link>

          <nav className="flex items-center gap-1">
            {user?.role === "PATIENT" && (
              <>
                <AIMatchNavLink pathname={pathname} />
                <div
                  aria-hidden
                  className="mx-0.5 hidden h-5 w-px shrink-0 bg-border sm:block"
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
                <DropdownMenuItem onClick={() => navigate("/notifications")}>
                  <Bell className="size-4" />
                  Notifications
                </DropdownMenuItem>
                {user?.role === "PATIENT" && (
                  <>
                    <DropdownMenuItem
                      className="sm:hidden gap-2.5 rounded-md border border-primary/20 bg-primary/5 py-2.5 font-semibold text-primary focus:bg-primary/10 focus:text-primary"
                      onClick={() => navigate("/recommendations")}
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="size-3.5" />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span>AI Match</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Find your ideal doctor
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
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
