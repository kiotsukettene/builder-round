import { z } from "zod";

export const sendAppointmentMessageSchema = z.object({
  body: z.string().trim().min(1, "Message cannot be empty").max(1000),
});

export type SendAppointmentMessageInput = z.infer<
  typeof sendAppointmentMessageSchema
>;
