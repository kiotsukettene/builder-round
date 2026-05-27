import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import { uploadProfilePicture as uploadProfilePictureMiddleware } from "../../middleware/upload.middleware.js";
import * as doctorController from "./doctor.controller.js";

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

export default router;
