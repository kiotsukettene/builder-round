import { z } from "zod"

export const locationFieldsSchema = z.object({
  address: z.string().min(1, "Address is required").max(500, "Address is too long"),
  latitude: z.coerce
    .number({ error: "Latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce
    .number({ error: "Longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
})

export type LocationFields = z.infer<typeof locationFieldsSchema>

export const locationUpdateFieldsSchema = z
  .object({
    address: z.string().min(1).max(500).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .superRefine((data, ctx) => {
    const provided = (["address", "latitude", "longitude"] as const).filter(
      (key) => data[key] !== undefined,
    )
    if (provided.length > 0 && provided.length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Address, latitude, and longitude must be updated together",
        path: ["address"],
      })
    }
  })
