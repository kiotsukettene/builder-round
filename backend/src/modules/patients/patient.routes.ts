import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import { uploadProfilePicture as uploadProfilePictureMiddleware } from "../../middleware/upload.middleware.js";
import * as patientController from "./patient.controller.js";

const router = Router();

router.put(
  "/me",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  patientController.completeProfile,
);

router.patch(
  "/me",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  patientController.updateProfile,
);

router.post(
  "/me/profile-picture",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  uploadProfilePictureMiddleware,
  patientController.uploadProfilePicture,
);

export default router;
