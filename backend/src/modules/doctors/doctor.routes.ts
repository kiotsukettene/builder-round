import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import { uploadProfilePicture as uploadProfilePictureMiddleware } from "../../middleware/upload.middleware.js";
import * as doctorController from "./doctor.controller.js";
import * as ratingController from "../ratings/rating.controller.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  doctorController.getProfile,
);

router.put(
  "/me",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  doctorController.completeProfile,
);

router.patch(
  "/me",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  doctorController.updateProfile,
);

router.post(
  "/me/profile-picture",
  authenticate,
  authorize("DOCTOR"),
  requireVerifiedEmail,
  uploadProfilePictureMiddleware,
  doctorController.uploadProfilePicture,
);

router.get(
  "/",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  doctorController.listDoctors,
);

router.get(
  "/:id/slots",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  doctorController.getAvailableSlots,
);

router.get(
  "/:id/reviews",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  ratingController.listDoctorReviews,
);

router.get(
  "/:id",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  doctorController.getDoctorById,
);

export default router;
