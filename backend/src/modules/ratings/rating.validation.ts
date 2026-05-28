import { z } from "zod";

export const submitReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z
    .string()
    .max(1000, "Comment is too long (max 1000 characters)")
    .optional(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
