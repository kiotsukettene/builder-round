import { z } from "zod";
import { getTodayDateStr } from "../../utils/schedule-datetime.js";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const availabilitySlotSchema = z
  .object({
    dayOfWeek: z
      .number()
      .int()
      .min(0, "dayOfWeek must be 0 (Sun) to 6 (Sat)")
      .max(6, "dayOfWeek must be 0 (Sun) to 6 (Sat)"),
    startTime: z.string().regex(timeRegex, "startTime must be in HH:MM format"),
    endTime: z.string().regex(timeRegex, "endTime must be in HH:MM format"),
  })
  .refine((slot) => slot.startTime < slot.endTime, {
    message: "startTime must be before endTime",
  });

export const setAvailabilitySchema = z.object({
  consultationDuration: z
    .number()
    .int()
    .min(10, "Consultation duration must be at least 10 minutes")
    .max(240, "Consultation duration cannot exceed 240 minutes")
    .optional(),
  slots: z
    .array(availabilitySlotSchema)
    .max(20, "Cannot define more than 20 availability windows"),
});

export const blockDateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format")
    .refine((d) => d >= getTodayDateStr(), "Blocked date must be today or in the future"),
  reason: z.string().max(500).optional(),
});

export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
export type BlockDateInput = z.infer<typeof blockDateSchema>;
