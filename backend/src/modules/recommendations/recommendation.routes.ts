import { Router } from "express";
import {
  authenticate,
  authorize,
  requireCompleteProfile,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import * as recommendationController from "./recommendation.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  requireCompleteProfile,
  recommendationController.getDefaultRecommendation,
);

router.post(
  "/",
  authenticate,
  authorize("PATIENT"),
  requireVerifiedEmail,
  recommendationController.getCustomRecommendation,
);

export default router;
