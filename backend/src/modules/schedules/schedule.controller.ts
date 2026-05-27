import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as scheduleService from "./schedule.service.js";
import { setAvailabilitySchema, blockDateSchema } from "./schedule.validation.js";

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

export const getAvailability = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await scheduleService.getAvailability(getUserId(req));

    res.status(200).json({
      success: true,
      message: "Availability retrieved successfully",
      data: result,
    });
  },
);

export const setAvailability = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = setAvailabilitySchema.parse(req.body);
    const result = await scheduleService.setAvailability(getUserId(req), data);

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: result,
    });
  },
);

export const blockDate = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = blockDateSchema.parse(req.body);
    const result = await scheduleService.blockDate(getUserId(req), data);

    res.status(201).json({
      success: true,
      message: "Date blocked successfully",
      data: result,
    });
  },
);

export const getBlockedDates = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await scheduleService.getBlockedDates(getUserId(req));

    res.status(200).json({
      success: true,
      message: "Blocked dates retrieved successfully",
      data: result,
    });
  },
);

export const removeBlockedDate = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params["id"];
    if (!id || Array.isArray(id)) {
      throw new AppError("Blocked date ID is required", 400);
    }

    await scheduleService.removeBlockedDate(getUserId(req), id);

    res.status(200).json({
      success: true,
      message: "Blocked date removed successfully",
    });
  },
);
