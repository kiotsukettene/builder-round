import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as notificationService from "./notification.service.js";
import { listNotificationsQuerySchema } from "./notification.validation.js";

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  return userId;
}

function getNotificationId(req: Request): string {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new AppError("Notification ID is required", 400);
  }

  return id;
}

export const getNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = getUserId(req);
    const query = listNotificationsQuerySchema.parse(req.query);
    const result = await notificationService.getNotifications(userId, query);

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = getUserId(req);
    const result = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      message: "Unread count retrieved successfully",
      data: result,
    });
  },
);

export const markAsRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = getUserId(req);
    await notificationService.markAsRead(userId, getNotificationId(req));

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  },
);

export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = getUserId(req);
    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  },
);
