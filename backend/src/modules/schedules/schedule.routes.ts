import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import * as scheduleController from "./schedule.controller.js";

const router = Router();

router.get(
  "/availability",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  scheduleController.getAvailability,
);

router.put(
  "/availability",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  scheduleController.setAvailability,
);

router.get(
  "/blocked-dates",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  scheduleController.getBlockedDates,
);

router.post(
  "/blocked-dates",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  scheduleController.blockDate,
);

router.delete(
  "/blocked-dates/:id",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  scheduleController.removeBlockedDate,
);

export default router;
