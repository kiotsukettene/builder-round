import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../middleware/rate-limiter.js";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.get("/me", authenticate, authController.getProfile);

export default router;
