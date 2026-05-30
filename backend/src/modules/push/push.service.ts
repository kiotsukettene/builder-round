import { AppError } from "../../errors/app-error.js";
import {
  generateBeamsToken,
  isBeamsEnabled,
} from "../../lib/pusher-beams.js";

export function getBeamsAuthToken(userId: string): { token: string } {
  if (!isBeamsEnabled()) {
    throw new AppError("Push notifications are not configured", 503);
  }

  return generateBeamsToken(userId);
}
