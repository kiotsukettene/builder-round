import api from "@/lib/api";
import type { ApiResponse } from "@/types/auth";
import type {
  MedicalRecordDetail,
  MedicalRecordListItem,
  MedicalRecordListMeta,
  MedicalRecordListQuery,
} from "@/types/consultation";

export async function listMedicalRecords(
  query: MedicalRecordListQuery = {},
): Promise<{ data: MedicalRecordListItem[]; meta: MedicalRecordListMeta }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const queryString = params.toString();
  const url = queryString
    ? `/api/v1/medical-records?${queryString}`
    : "/api/v1/medical-records";

  const { data } = await api.get<
    ApiResponse<MedicalRecordListItem[]> & { meta: MedicalRecordListMeta }
  >(url);

  return { data: data.data, meta: data.meta };
}

export async function getMedicalRecordDetail(
  appointmentId: string,
): Promise<MedicalRecordDetail> {
  const { data } = await api.get<ApiResponse<MedicalRecordDetail>>(
    `/api/v1/medical-records/${appointmentId}`,
  );
  return data.data;
}
