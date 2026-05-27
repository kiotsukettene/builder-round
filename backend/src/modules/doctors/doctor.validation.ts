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
});

export const completeProfileSchema = profileFieldsSchema.pick({
  bio: true,
  fee: true,
});

export const updateProfileSchema = profileFieldsSchema.partial();

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
