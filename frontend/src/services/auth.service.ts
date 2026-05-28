import api from "@/lib/api"
import type {
  ApiResponse,
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "@/types/auth"

export async function register(payload: RegisterPayload): Promise<ApiResponse<{ user: AuthUser }>> {
  const { data } = await api.post<ApiResponse<{ user: AuthUser }>>("/api/v1/auth/register", payload)
  return data
}

export async function login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
  const { data } = await api.post<ApiResponse<LoginResponse>>("/api/v1/auth/login", payload)
  return data
}

export async function verifyEmail(token: string): Promise<ApiResponse<null>> {
  const { data } = await api.post<ApiResponse<null>>("/api/v1/auth/verify-email", { token })
  return data
}

export async function resendVerification(email: string): Promise<ApiResponse<null>> {
  const { data } = await api.post<ApiResponse<null>>("/api/v1/auth/resend-verification", { email })
  return data
}

export async function refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>("/api/v1/auth/refresh", {
    refreshToken,
  })
  return data
}

export async function logout(token: string): Promise<ApiResponse<null>> {
  const { data } = await api.post<ApiResponse<null>>("/api/v1/auth/logout", {
    refreshToken: token,
  })
  return data
}

export async function getMe(): Promise<ApiResponse<AuthUser>> {
  const { data } = await api.get<ApiResponse<AuthUser>>("/api/v1/auth/me")
  return data
}
