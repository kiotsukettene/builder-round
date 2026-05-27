import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authLimiter, resendVerificationLimiter, } from "../../middleware/rate-limiter.js";
const router = Router();
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/verify-email", authLimiter, authController.verifyEmail);
router.post("/resend-verification", resendVerificationLimiter, authController.resendVerification);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authLimiter, authenticate, authController.logout);
router.get("/me", authenticate, authController.getProfile);
export default router;
//# sourceMappingURL=auth.routes.js.map