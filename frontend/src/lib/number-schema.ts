import { z } from "zod"

export function requiredPositiveNumber(label: string) {
  return z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: `${label} is required`,
    })
    .refine((val) => Number.isFinite(Number(val)), {
      message: `${label} must be a valid number`,
    })
    .refine((val) => Number(val) > 0, {
      message: `${label} must be positive`,
    })
    .transform((val) => Number(val))
}

export function optionalPositiveNumber(label: string) {
  return z
    .union([z.string(), z.number()])
    .refine(
      (val) => {
        if (val === "" || val === null || val === undefined) return true
        return Number.isFinite(Number(val))
      },
      { message: `${label} must be a valid number` }
    )
    .refine(
      (val) => {
        if (val === "" || val === null || val === undefined) return true
        return Number(val) > 0
      },
      { message: `${label} must be positive` }
    )
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return undefined
      return Number(val)
    })
    .optional()
}
