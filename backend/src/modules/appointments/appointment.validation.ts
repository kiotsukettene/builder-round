import { z } from "zod";

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  scheduledAt: z
    .string()
    .datetime({
      offset: true,
      message: "scheduledAt must be a valid ISO 8601 datetime",
    }),
});

export const rescheduleAppointmentSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({
      offset: true,
      message: "scheduledAt must be a valid ISO 8601 datetime",
    }),
});

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z
    .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
    .optional(),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>;
export type ListAppointmentsQueryInput = z.infer<
  typeof listAppointmentsQuerySchema
>;
