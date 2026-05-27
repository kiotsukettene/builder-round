import { z } from "zod";

const profileFieldsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  specialization: z.string().min(1, "Specialization is required"),
  bio: z
    .string()
    .min(1, "Biography is required")
    .max(2000, "Biography is too long"),
  fee: z.number().positive("Consultation fee must be a positive number"),
  consultationDuration: z
    .number()
    .int()
    .min(10, "Consultation duration must be at least 10 minutes")
    .max(240, "Consultation duration cannot exceed 240 minutes"),
});

export const completeProfileSchema = profileFieldsSchema.pick({
  bio: true,
  fee: true,
  consultationDuration: true,
}).partial({ consultationDuration: true });

export const updateProfileSchema = profileFieldsSchema.partial();

export const listDoctorsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  specialization: z.string().optional(),
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListDoctorsQueryInput = z.infer<typeof listDoctorsQuerySchema>;
