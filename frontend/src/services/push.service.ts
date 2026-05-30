import api from "@/lib/api"
import type { ApiResponse } from "@/types/auth"

interface BeamsAuthData {
  token: string
}

export async function getBeamsAuthToken(beamsUserId: string): Promise<string> {
  const params = new URLSearchParams({ user_id: beamsUserId })
  const response = await api.get<ApiResponse<BeamsAuthData>>(
    `/api/v1/push/beams-auth?${params.toString()}`
  )
  const body = response.data

  const token =
    body.data?.token ??
    (body as unknown as { token?: string }).token

  if (!token || typeof token !== "string") {
    throw new Error("Failed to retrieve push notification token")
  }

  return token
}
