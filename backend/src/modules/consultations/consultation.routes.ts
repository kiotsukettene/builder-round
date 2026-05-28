import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import * as consultationController from "./consultation.controller.js";

const router = Router();

// ── Session ──

router.post(
  "/:appointmentId/join",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  consultationController.joinConsultation,
);

router.patch(
  "/:appointmentId/end",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  consultationController.endConsultation,
);

// ── Notes ──

router.post(
  "/:appointmentId/notes",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  consultationController.upsertConsultationNote,
);

router.get(
  "/:appointmentId/notes",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  consultationController.getConsultationNote,
);

// ── Prescriptions ──

router.post(
  "/:appointmentId/prescriptions",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  consultationController.addPrescription,
);

router.get(
  "/:appointmentId/prescriptions",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  consultationController.listPrescriptions,
);

router.patch(
  "/:appointmentId/prescriptions/:prescriptionId",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  consultationController.updatePrescription,
);

router.delete(
  "/:appointmentId/prescriptions/:prescriptionId",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  consultationController.deletePrescription,
);

// ── Medical Record ──

router.get(
  "/:appointmentId/medical-record",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  consultationController.getMedicalRecord,
);

export default router;
