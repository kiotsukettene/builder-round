export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "MISSED"

export interface AppointmentPatient {
  id: string
  userId: string
  firstName: string
  lastName: string
  profilePicture: string | null
  birthday: string | null
  weight: number | null
  height: number | null
  phone: string | null
  history: string | null
}

export interface AppointmentDoctor {
  id: string
  userId: string
  firstName: string
  lastName: string
  specialization: string
  fee: number | null
  profilePicture: string | null
  consultationDuration: number
}

export interface Appointment {
  id: string
  scheduledAt: string
  status: AppointmentStatus
  meetingUrl: string | null
  notes: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  patient: AppointmentPatient
  doctor: AppointmentDoctor
}

export interface BookAppointmentPayload {
  doctorId: string
  scheduledAt: string
  notes?: string
}

export interface CancelAppointmentPayload {
  cancellationReason: string
}

export interface RescheduleAppointmentPayload {
  scheduledAt: string
}

export interface AppointmentListQuery {
  page?: number
  limit?: number
  status?: AppointmentStatus
}

export interface AppointmentListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedAppointments {
  appointments: Appointment[]
  meta: AppointmentListMeta
}
