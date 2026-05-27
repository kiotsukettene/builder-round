import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as recommendationService from "./recommendation.service.js";
import { customSymptomsSchema } from "./recommendation.validation.js";

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

export const getDefaultRecommendation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await recommendationService.getDefaultRecommendation(
      getUserId(req),
    );

    res.status(200).json({
      success: true,
      message: "AI recommendation generated successfully",
      data: result,
    });
  },
);

export const getCustomRecommendation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { symptoms } = customSymptomsSchema.parse(req.body);
    const result =
      await recommendationService.getCustomRecommendation(symptoms);

    res.status(200).json({
      success: true,
      message: "AI recommendation generated successfully",
      data: result,
    });
  },
);
