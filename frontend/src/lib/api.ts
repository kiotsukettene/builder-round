import axios, { type AxiosError } from "axios"

const AUTH_NO_REFRESH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/verify-email",
  "/api/v1/auth/resend-verification",
] as const

function isAuthNoRefreshRequest(url?: string): boolean {
  if (!url) return false
  return AUTH_NO_REFRESH_PATHS.some((path) => url.includes(path))
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isAuthNoRefreshRequest(originalRequest.url)) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers!["Authorization"] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const storedRefreshToken = localStorage.getItem("refreshToken")
      if (!storedRefreshToken) {
        processQueue(error, null)
        isRefreshing = false
        window.location.href = "/login"
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? ""}/api/v1/auth/refresh`,
          { refreshToken: storedRefreshToken }
        )
        const newAccessToken = data.data.accessToken
        localStorage.setItem("accessToken", newAccessToken)

        const { useAuthStore } = await import("@/store/auth.store")
        useAuthStore.getState().setAccessToken(newAccessToken)

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`
        originalRequest.headers!["Authorization"] = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
