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

export interface MedicalRecordDoctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  profilePicture: string | null;
}

export interface MedicalRecordPatient {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

export interface MedicalRecordListItem {
  id: string;
  scheduledAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  doctor?: MedicalRecordDoctor;
  patient?: MedicalRecordPatient;
  consultationNote: ConsultationNote | null;
  prescriptions: Prescription[];
}

export interface MedicalRecordDetail {
  id: string;
  scheduledAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  patient: MedicalRecordPatient;
  doctor: MedicalRecordDoctor;
  consultationNote: ConsultationNote | null;
  prescriptions: Prescription[];
}

export interface MedicalRecordListQuery {
  page?: number;
  limit?: number;
}

export interface MedicalRecordListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedMedicalRecords {
  data: MedicalRecordListItem[];
  meta: MedicalRecordListMeta;
}
