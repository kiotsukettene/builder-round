import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as ratingService from "./rating.service.js";
import { submitReviewSchema } from "./rating.validation.js";

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (!value || Array.isArray(value)) {
    throw new AppError(`${name} is required`, 400);
  }
  return value;
}

export const submitReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = submitReviewSchema.parse(req.body);
    const review = await ratingService.submitReview(
      getUserId(req),
      getParam(req, "appointmentId"),
      data,
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  },
);

export const listDoctorReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await ratingService.listDoctorReviews(getParam(req, "id"));

    res.status(200).json({
      success: true,
      message: "Doctor reviews retrieved successfully",
      data: result,
    });
  },
);
