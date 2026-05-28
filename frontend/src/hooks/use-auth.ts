import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import * as authService from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import type { LoginPayload, RegisterPayload } from "@/types/auth"

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await authService.getMe()
      setUser(res.data)
      return res.data
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogin() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (res) => {
      login(res.data.user, res.data.accessToken, res.data.refreshToken)
      const user = res.data.user

      if (user.role === "PATIENT") {
        if (!user.patient?.isProfileComplete) {
          navigate("/complete-profile")
        } else {
          navigate("/profile")
        }
      } else if (user.role === "DOCTOR") {
        if (!user.doctor?.isProfileComplete) {
          navigate("/doctor/complete-profile")
        } else {
          navigate("/doctor/profile")
        }
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Login failed. Please try again."
      toast.error(message)
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (_res, variables) => {
      navigate("/verify-email-pending", { state: { email: variables.email } })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Registration failed. Please try again."
      toast.error(message)
    },
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: () => {
      toast.success("Verification email sent. Please check your inbox.")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to resend verification email."
      toast.error(message)
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    },
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate("/login")
    },
  })
}
