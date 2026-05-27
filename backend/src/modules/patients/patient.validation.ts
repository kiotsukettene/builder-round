import { z } from "zod";

const birthdaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must be in YYYY-MM-DD format")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime());
  }, "Invalid birthday date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    return date <= today;
  }, "Birthday cannot be in the future");

const profileFieldsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthday: birthdaySchema,
  weight: z.number().positive("Weight must be a positive number"),
  height: z.number().positive("Height must be a positive number"),
  phone: z.string().min(1, "Phone is required").max(20, "Phone is too long"),
  history: z
    .string()
    .min(1, "Medical history is required")
    .max(2000, "Medical history is too long"),
});

export const completeProfileSchema = profileFieldsSchema;

export const updateProfileSchema = profileFieldsSchema.partial();

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
