import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
  requireCompleteProfile,
} from "../../middleware/auth.middleware.js";
import * as appointmentController from "./appointment.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  requireCompleteProfile,
  appointmentController.bookAppointment,
);

router.get(
  "/",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  appointmentController.getMyAppointments,
);

router.get(
  "/:id",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  appointmentController.getAppointmentById,
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  appointmentController.cancelAppointment,
);

router.patch(
  "/:id/reschedule",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  requireCompleteProfile,
  appointmentController.rescheduleAppointment,
);

export default router;
