import { z } from "zod";

export const listMedicalRecordsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListMedicalRecordsQueryInput = z.infer<
  typeof listMedicalRecordsQuerySchema
>;
