import { asyncHandler } from "../../utils/async-handler.js";
import * as authService from "./auth.service.js";
import { registerSchema, loginSchema, refreshSchema, logoutSchema, verifyEmailSchema, resendVerificationSchema, } from "./auth.validation.js";
export const register = asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email to verify your account.",
        data: result,
    });
});
export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
    });
});
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = verifyEmailSchema.parse(req.body);
    await authService.verifyEmail(token);
    res.status(200).json({
        success: true,
        message: "Email verified successfully",
    });
});
export const resendVerification = asyncHandler(async (req, res) => {
    const data = resendVerificationSchema.parse(req.body);
    await authService.resendVerification(data);
    res.status(200).json({
        success: true,
        message: "If an account exists, a verification email has been sent",
    });
});
export const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
    });
});
export const logout = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return;
    }
    const { refreshToken } = logoutSchema.parse(req.body);
    await authService.logout(userId, refreshToken);
    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
});
export const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return;
    }
    const user = await authService.getProfile(userId);
    res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
    });
});
//# sourceMappingURL=auth.controller.js.map