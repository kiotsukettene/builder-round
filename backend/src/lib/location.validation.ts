import { z } from "zod";

export const locationFieldsSchema = z.object({
  address: z.string().min(1, "Address is required").max(500, "Address is too long"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export type LocationFields = z.infer<typeof locationFieldsSchema>;
