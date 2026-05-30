import { z } from "zod";
import { locationFieldsSchema } from "../../lib/location.validation.js";

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

export const completeProfileSchema = profileFieldsSchema
  .pick({
    bio: true,
    fee: true,
    consultationDuration: true,
  })
  .partial({ consultationDuration: true })
  .merge(locationFieldsSchema);

const locationUpdateFields = z
  .object({
    address: z.string().min(1).max(500).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .superRefine((data, ctx) => {
    const provided = (["address", "latitude", "longitude"] as const).filter(
      (key) => data[key] !== undefined,
    );
    if (provided.length > 0 && provided.length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Address, latitude, and longitude must be updated together",
        path: ["address"],
      });
    }
  });

export const updateProfileSchema = profileFieldsSchema
  .partial()
  .merge(locationUpdateFields);

export const listDoctorsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  specialization: z.string().optional(),
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListDoctorsQueryInput = z.infer<typeof listDoctorsQuerySchema>;
