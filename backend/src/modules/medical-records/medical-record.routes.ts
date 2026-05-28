import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import * as medicalRecordController from "./medical-record.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  medicalRecordController.listMedicalRecords,
);

router.get(
  "/:appointmentId",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  medicalRecordController.getMedicalRecordDetail,
);

export default router;
