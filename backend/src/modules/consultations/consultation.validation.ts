import { z } from "zod";

export const consultationNoteSchema = z.object({
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
});

export const prescriptionSchema = z.object({
  medication: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

export const updatePrescriptionSchema = prescriptionSchema.partial();

export type ConsultationNoteInput = z.infer<typeof consultationNoteSchema>;
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;
