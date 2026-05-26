import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as authService from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./auth.validation.js";

export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  },
);

export const refresh = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  },
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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
  },
);
