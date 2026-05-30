import { z } from "zod";

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  scheduledAt: z
    .string()
    .datetime({
      offset: true,
      message: "scheduledAt must be a valid ISO 8601 datetime",
    }),
  notes: z.string().trim().max(1000).optional(),
});

export const cancelAppointmentSchema = z.object({
  cancellationReason: z
    .string()
    .trim()
    .min(1, "Cancellation reason is required")
    .max(500),
});

export const rescheduleAppointmentSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({
      offset: true,
      message: "scheduledAt must be a valid ISO 8601 datetime",
    }),
});

export const listAppointmentsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    status: z
      .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "MISSED"])
      .optional(),
    upcoming: z.coerce.boolean().optional(),
  })
  .refine((data) => !(data.status && data.upcoming), {
    message: "Cannot use status and upcoming filters together",
  });

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>;
export type ListAppointmentsQueryInput = z.infer<
  typeof listAppointmentsQuerySchema
>;
