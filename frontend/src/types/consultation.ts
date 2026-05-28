export interface JoinConsultationResponse {
  roomId: string;
  token: string;
  appId: number;
}

export interface ConsultationNote {
  id: string;
  appointmentId: string;
  diagnosis: string | null;
  notes: string | null;
  recommendations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  createdAt: string;
}

export interface MedicalRecord {
  note: ConsultationNote | null;
  prescriptions: Prescription[];
}

export interface ConsultationNoteInput {
  diagnosis?: string;
  notes?: string;
  recommendations?: string;
}

export interface PrescriptionInput {
  medication: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}
