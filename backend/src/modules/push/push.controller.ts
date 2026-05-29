import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as pushService from "./push.service.js";

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

export const getBeamsAuth = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = getUserId(req);
    const requestedUserId = req.query.user_id;

    if (
      typeof requestedUserId === "string" &&
      requestedUserId.length > 0 &&
      requestedUserId !== userId
    ) {
      throw new AppError("User ID does not match authenticated session", 403);
    }

    const result = pushService.getBeamsAuthToken(userId);

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      success: true,
      message: "Beams auth token generated successfully",
      data: result,
    });
  },
);
