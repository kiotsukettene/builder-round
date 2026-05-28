export interface AvailabilitySlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface AvailabilityResponse {
  consultationDuration: number
  slots: AvailabilitySlot[]
}

export interface SetAvailabilitySlot {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface SetAvailabilityPayload {
  consultationDuration?: number
  slots: SetAvailabilitySlot[]
}

export interface BlockedDate {
  id: string
  date: string
  reason: string | null
  createdAt: string
}

export interface BlockDatePayload {
  date: string
  reason?: string
}
