import PushNotifications from "@pusher/push-notifications-server";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { NotificationType, Role } from "../generated/prisma/client.js";

const BEAMS_TOKEN_TTL_SECONDS = 24 * 60 * 60;

let beamsClient: PushNotifications | null = null;

export function isBeamsEnabled(): boolean {
  return Boolean(
    env.PUSHER_BEAMS_INSTANCE_ID && env.PUSHER_BEAMS_SECRET_KEY,
  );
}

function getBeamsClient(): PushNotifications {
  if (!isBeamsEnabled()) {
    throw new Error("Pusher Beams is not configured");
  }

  if (!beamsClient) {
    beamsClient = new PushNotifications({
      instanceId: env.PUSHER_BEAMS_INSTANCE_ID!,
      secretKey: env.PUSHER_BEAMS_SECRET_KEY!,
    });
  }

  return beamsClient;
}

export function generateBeamsToken(userId: string): { token: string } {
  const instanceId = env.PUSHER_BEAMS_INSTANCE_ID!;
  const secretKey = env.PUSHER_BEAMS_SECRET_KEY!;
  const skewSeconds = env.PUSHER_BEAMS_TOKEN_SKEW_SECONDS;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const issuedAt = nowSeconds - skewSeconds;
  const expiresAt = issuedAt + BEAMS_TOKEN_TTL_SECONDS;
  const issuer = `https://${instanceId}.pushnotifications.pusher.com`;

  // Build all time-sensitive claims explicitly (seconds, not ms) to avoid
  // "Token used before issued" when this server's clock is ahead of Pusher's.
  const token = jwt.sign(
    {
      iss: issuer,
      sub: userId,
      iat: issuedAt,
      exp: expiresAt,
    },
    secretKey,
    {
      algorithm: "HS256",
      allowInsecureKeySizes: true,
    },
  );

  return { token };
}

export interface PushNotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId: string | null;
  createdAt: Date;
  role: Role;
}

function getAppointmentsDeepLink(role: Role): string {
  const path = role === "DOCTOR" ? "/doctor/appointments" : "/appointments";
  return `${env.FRONTEND_URL}${path}`;
}

export async function publishNotificationToUser(
  userId: string,
  payload: PushNotificationPayload,
): Promise<void> {
  if (!isBeamsEnabled()) {
    return;
  }

  const client = getBeamsClient();

  await client.publishToUsers([userId], {
    web: {
      notification: {
        title: payload.title,
        body: payload.message,
        deep_link: getAppointmentsDeepLink(payload.role),
        hide_notification_if_site_has_focus: true,
      },
      data: {
        id: payload.id,
        type: payload.type,
        relatedId: payload.relatedId ?? "",
        createdAt: payload.createdAt.toISOString(),
      },
    },
  });
}
