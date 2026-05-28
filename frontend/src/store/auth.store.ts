import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser, DoctorProfile, PatientProfile } from "@/types/auth"

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null

  isAuthenticated: boolean
  isEmailVerified: boolean
  isProfileComplete: boolean
  hasHydrated: boolean

  login: (user: AuthUser, accessToken: string, refreshToken: string) => void
  logout: () => void
  setUser: (user: AuthUser | null) => void
  setAccessToken: (token: string) => void
  updateProfile: (profile: PatientProfile | DoctorProfile) => void
  setHasHydrated: (value: boolean) => void
}

function getAuthenticatedHomePath(
  user: AuthUser | null,
  isEmailVerified: boolean,
  isProfileComplete: boolean
): string {
  if (!user) return "/login"
  if (!isEmailVerified) return "/verify-email-pending"
  if (!isProfileComplete) {
    return user.role === "DOCTOR" ? "/doctor/complete-profile" : "/complete-profile"
  }
  return user.role === "DOCTOR" ? "/doctor/profile" : "/profile"
}

function deriveIsProfileComplete(user: AuthUser | null): boolean {
  if (!user) return false
  if (user.role === "PATIENT") return user.patient?.isProfileComplete ?? false
  if (user.role === "DOCTOR") return user.doctor?.isProfileComplete ?? false
  return false
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isEmailVerified: false,
      isProfileComplete: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: (user, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isEmailVerified: user.emailVerified,
          isProfileComplete: deriveIsProfileComplete(user),
        })
      },

      logout: () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isEmailVerified: false,
          isProfileComplete: false,
        })
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isEmailVerified: user?.emailVerified ?? false,
          isProfileComplete: deriveIsProfileComplete(user),
        })
      },

      setAccessToken: (token) => {
        localStorage.setItem("accessToken", token)
        set({ accessToken: token })
      },

      updateProfile: (profile) => {
        const { user } = get()
        if (!user) return

        if (user.role === "PATIENT") {
          const updatedUser: AuthUser = {
            ...user,
            patient: profile as PatientProfile,
          }
          set({
            user: updatedUser,
            isProfileComplete: deriveIsProfileComplete(updatedUser),
          })
        } else if (user.role === "DOCTOR") {
          const updatedUser: AuthUser = {
            ...user,
            doctor: profile as DoctorProfile,
          }
          set({
            user: updatedUser,
            isProfileComplete: deriveIsProfileComplete(updatedUser),
          })
        }
      },
    }),
    {
      name: "tellmd-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isEmailVerified: state.isEmailVerified,
        isProfileComplete: state.isProfileComplete,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export { getAuthenticatedHomePath }
