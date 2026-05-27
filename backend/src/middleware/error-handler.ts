import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { z } from "zod";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err instanceof z.ZodError) {
    const message = err.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  console.error("Unexpected error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
