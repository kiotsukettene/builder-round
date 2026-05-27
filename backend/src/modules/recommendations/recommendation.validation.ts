import { z } from "zod";

export const customSymptomsSchema = z.object({
  symptoms: z
    .string()
    .min(10, "Please describe your symptoms in at least 10 characters")
    .max(1000, "Symptoms description is too long (max 1000 characters)"),
});

export type CustomSymptomsInput = z.infer<typeof customSymptomsSchema>;
