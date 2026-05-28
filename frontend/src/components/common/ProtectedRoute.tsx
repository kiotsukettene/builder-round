import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { getAuthenticatedHomePath, useAuthStore } from "@/store/auth.store"
import type { Role } from "@/types/auth"

interface ProtectedRouteProps {
  requiredRole?: Role
  requireVerified?: boolean
  requireCompleteProfile?: boolean
  redirectIfAuthenticated?: boolean
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
    </div>
  )
}

export function ProtectedRoute({
  requiredRole,
  requireVerified = false,
  requireCompleteProfile = false,
  redirectIfAuthenticated = false,
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isEmailVerified, isProfileComplete, hasHydrated, user, setHasHydrated } =
    useAuthStore()

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })

    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }

    return unsub
  }, [setHasHydrated])

  if (!hasHydrated) {
    return <AuthLoading />
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    const target = getAuthenticatedHomePath(user, isEmailVerified, isProfileComplete)
    if (location.pathname !== target) {
      return <Navigate to={target} replace />
    }
    return <Outlet />
  }

  if (!isAuthenticated) {
    if (redirectIfAuthenticated) {
      return <Outlet />
    }
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireVerified && !isEmailVerified) {
    if (location.pathname === "/verify-email-pending") {
      return <Outlet />
    }
    return <Navigate to="/verify-email-pending" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    const target = user?.role === "DOCTOR" ? "/doctor/profile" : "/profile"
    if (location.pathname !== target) {
      return <Navigate to={target} replace />
    }
    return <Outlet />
  }

  if (requireCompleteProfile && !isProfileComplete) {
    const target = user?.role === "DOCTOR" ? "/doctor/complete-profile" : "/complete-profile"
    if (location.pathname !== target) {
      return <Navigate to={target} replace />
    }
    return <Outlet />
  }

  return <Outlet />
}
