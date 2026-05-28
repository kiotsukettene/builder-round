import { useQuery } from "@tanstack/react-query";
import * as medicalRecordService from "@/services/medical-record.service";
import type { MedicalRecordListQuery } from "@/types/consultation";

export function useMedicalRecords(query: MedicalRecordListQuery = {}) {
  const { page = 1, limit = 10 } = query;

  return useQuery({
    queryKey: ["medical-records", page, limit],
    queryFn: () => medicalRecordService.listMedicalRecords({ page, limit }),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
}
