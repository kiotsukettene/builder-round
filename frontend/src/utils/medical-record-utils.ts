import type { MedicalRecordDetail, MedicalRecordListItem } from "@/types/consultation";

export type MedicalRecordFilter = "all" | "prescriptions";

export function formatConsultationDate(
  scheduledAt: string,
  style: "short" | "long" = "long",
): string {
  const date = new Date(scheduledAt);

  if (style === "short") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLastVisitDate(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function getDiagnosisPreview(
  record: MedicalRecordListItem,
  maxLength = 60,
): string {
  const diagnosis = record.consultationNote?.diagnosis?.trim();
  if (diagnosis) return truncateText(diagnosis, maxLength);

  const notes = record.consultationNote?.notes?.trim();
  if (notes) return truncateText(notes, maxLength);

  return "No diagnosis recorded";
}

export function getMedicationPreview(record: MedicalRecordListItem): string | null {
  if (record.prescriptions.length === 0) return null;
  return record.prescriptions.map((rx) => rx.medication).join(", ");
}

export function groupRecordsByMonth(
  records: MedicalRecordListItem[],
): [string, MedicalRecordListItem[]][] {
  const groups = new Map<string, MedicalRecordListItem[]>();

  for (const record of records) {
    const key = new Date(record.scheduledAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const existing = groups.get(key) ?? [];
    existing.push(record);
    groups.set(key, existing);
  }

  return Array.from(groups.entries());
}

export function filterMedicalRecords(
  records: MedicalRecordListItem[],
  filter: MedicalRecordFilter,
  searchQuery: string,
  role: "PATIENT" | "DOCTOR",
): MedicalRecordListItem[] {
  const query = searchQuery.trim().toLowerCase();

  return records.filter((record) => {
    if (filter === "prescriptions" && record.prescriptions.length === 0) {
      return false;
    }

    if (!query) return true;

    const diagnosis = getDiagnosisPreview(record, 500).toLowerCase();
    const medications = getMedicationPreview(record)?.toLowerCase() ?? "";

    if (role === "PATIENT" && record.doctor) {
      const doctorName =
        `${record.doctor.firstName} ${record.doctor.lastName}`.toLowerCase();
      const specialization = record.doctor.specialization.toLowerCase();
      return (
        doctorName.includes(query) ||
        specialization.includes(query) ||
        diagnosis.includes(query) ||
        medications.includes(query)
      );
    }

    if (role === "DOCTOR" && record.patient) {
      const patientName =
        `${record.patient.firstName} ${record.patient.lastName}`.toLowerCase();
      return (
        patientName.includes(query) ||
        diagnosis.includes(query) ||
        medications.includes(query)
      );
    }

    return diagnosis.includes(query) || medications.includes(query);
  });
}

export function computeMedicalRecordStats(
  records: MedicalRecordListItem[],
  totalVisits: number,
) {
  const prescriptionCount = records.reduce(
    (sum, record) => sum + record.prescriptions.length,
    0,
  );

  const lastVisit = records[0]?.scheduledAt ?? null;

  return {
    totalVisits,
    prescriptionCount,
    lastVisit,
  };
}

export function detailToListItem(
  detail: MedicalRecordDetail,
): MedicalRecordListItem {
  return {
    id: detail.id,
    scheduledAt: detail.scheduledAt,
    status: detail.status,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    doctor: detail.doctor,
    patient: detail.patient,
    consultationNote: detail.consultationNote,
    prescriptions: detail.prescriptions,
  };
}
