export type Role = "PATIENT" | "DOCTOR"

export interface PatientProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  birthday: string | null
  weight: number | null
  height: number | null
  phone: string | null
  history: string | null
  profilePicture: string | null
  profileCompletedAt: string | null
  isProfileComplete: boolean
}

export interface DoctorProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  specialization: string
  bio: string | null
  fee: number | null
  consultationDuration: number
  profilePicture: string | null
  profileCompletedAt: string | null
  isProfileComplete: boolean
}

export interface AuthUser {
  id: string
  email: string
  role: Role
  emailVerified: boolean
  createdAt: string
  patient: PatientProfile | null
  doctor: DoctorProfile | null
}

export interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
  specialization?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface CompletePatientProfilePayload {
  firstName: string
  lastName: string
  birthday: string
  weight: number
  height: number
  phone: string
  history: string
}

export interface UpdatePatientProfilePayload {
  firstName?: string
  lastName?: string
  birthday?: string
  weight?: number
  height?: number
  phone?: string
  history?: string
}

export interface CompleteDoctorProfilePayload {
  bio: string
  fee: number
  consultationDuration?: number
}

export interface UpdateDoctorProfilePayload {
  firstName?: string
  lastName?: string
  specialization?: string
  bio?: string
  fee?: number
  consultationDuration?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}
