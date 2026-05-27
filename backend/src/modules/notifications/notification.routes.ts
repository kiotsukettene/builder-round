import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import * as notificationController from "./notification.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  notificationController.getNotifications,
);

router.get(
  "/unread-count",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  notificationController.getUnreadCount,
);

router.patch(
  "/read-all",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  notificationController.markAllAsRead,
);

router.patch(
  "/:id/read",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  notificationController.markAsRead,
);

export default router;
