import { useQuery } from "@tanstack/react-query";
import { isQueryContentLoading } from "@/lib/query-utils";
import { listPatientMedicalRecords } from "@/services/appointment.service";
import type { MedicalRecordListQuery } from "@/types/consultation";

export function usePatientMedicalRecords(
  appointmentId: string,
  query: MedicalRecordListQuery & { enabled?: boolean } = {},
) {
  const { page = 1, limit = 5, enabled = true } = query;

  const result = useQuery({
    queryKey: ["patient-medical-records", appointmentId, page, limit],
    queryFn: () => listPatientMedicalRecords(appointmentId, { page, limit }),
    enabled: enabled && Boolean(appointmentId),
    staleTime: 1000 * 60,
  });

  return {
    ...result,
    isContentLoading: isQueryContentLoading(result),
  };
}
