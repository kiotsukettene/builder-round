import api from "@/lib/api";
import type {
  ConsultationNote,
  ConsultationNoteInput,
  JoinConsultationResponse,
  MedicalRecord,
  Prescription,
  PrescriptionInput,
} from "@/types/consultation";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function joinConsultation(
  appointmentId: string,
): Promise<JoinConsultationResponse> {
  const res = await api.post<ApiResponse<JoinConsultationResponse>>(
    `/api/v1/consultations/${appointmentId}/join`,
  );
  return res.data.data;
}

export async function endConsultation(appointmentId: string): Promise<void> {
  await api.patch(`/api/v1/consultations/${appointmentId}/end`);
}

export async function upsertConsultationNote(
  appointmentId: string,
  data: ConsultationNoteInput,
): Promise<ConsultationNote> {
  const res = await api.post<ApiResponse<ConsultationNote>>(
    `/api/v1/consultations/${appointmentId}/notes`,
    data,
  );
  return res.data.data;
}

export async function getConsultationNote(
  appointmentId: string,
): Promise<ConsultationNote | null> {
  const res = await api.get<ApiResponse<ConsultationNote | null>>(
    `/api/v1/consultations/${appointmentId}/notes`,
  );
  return res.data.data;
}

export async function addPrescription(
  appointmentId: string,
  data: PrescriptionInput,
): Promise<Prescription> {
  const res = await api.post<ApiResponse<Prescription>>(
    `/api/v1/consultations/${appointmentId}/prescriptions`,
    data,
  );
  return res.data.data;
}

export async function listPrescriptions(
  appointmentId: string,
): Promise<Prescription[]> {
  const res = await api.get<ApiResponse<Prescription[]>>(
    `/api/v1/consultations/${appointmentId}/prescriptions`,
  );
  return res.data.data;
}

export async function updatePrescription(
  appointmentId: string,
  prescriptionId: string,
  data: Partial<PrescriptionInput>,
): Promise<Prescription> {
  const res = await api.patch<ApiResponse<Prescription>>(
    `/api/v1/consultations/${appointmentId}/prescriptions/${prescriptionId}`,
    data,
  );
  return res.data.data;
}

export async function deletePrescription(
  appointmentId: string,
  prescriptionId: string,
): Promise<void> {
  await api.delete(
    `/api/v1/consultations/${appointmentId}/prescriptions/${prescriptionId}`,
  );
}

export async function getMedicalRecord(
  appointmentId: string,
): Promise<MedicalRecord> {
  const res = await api.get<ApiResponse<MedicalRecord>>(
    `/api/v1/consultations/${appointmentId}/medical-record`,
  );
  return res.data.data;
}
