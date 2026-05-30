import { Router } from "express";
import {
  authenticate,
  authorize,
  requireVerifiedEmail,
} from "../../middleware/auth.middleware.js";
import * as pushController from "./push.controller.js";

const router = Router();

router.get(
  "/beams-auth",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  requireVerifiedEmail,
  pushController.getBeamsAuth,
);

export default router;
