import type { PublicDoctor } from "@/types/recommendation"

export type { PublicDoctor }

export interface DoctorAvailability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface PublicDoctorWithAvailability extends PublicDoctor {
  availabilities: DoctorAvailability[]
}

export interface DoctorListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface DoctorListFilters {
  search?: string
  specialization?: string
  page?: number
  limit?: number
}

export interface DoctorSlot {
  startTime: string
  endTime: string
  available: boolean
}

export interface DoctorSlotsResponse {
  date: string
  consultationDuration: number
  consultationFee: number | null
  slots: DoctorSlot[]
}
