import multer from "multer";
import type { Request } from "express";
import { AppError } from "../errors/app-error.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback,
  ) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new AppError(
          "Invalid file type. Only JPEG, PNG, and WebP images are allowed",
          400,
        ),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadProfilePicture = upload.single("profilePicture");
