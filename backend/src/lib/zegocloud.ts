import crypto from "crypto";
import { env } from "../config/env.js";

const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Generates a ZegoCloud server-side Kit Token (token-04 algorithm).
 *
 * Binary format (base64-encoded, prefixed with "04"):
 *   4 bytes  — expire timestamp (big-endian uint32)
 *   32 bytes — HMAC-SHA256 of the JSON payload
 *   2 bytes  — payload byte length (big-endian uint16)
 *   N bytes  — UTF-8 JSON payload
 *
 * Reference: https://docs.zegocloud.com/article/9648
 */
export function generateZegoToken(userId: string, roomId: string): string {
  const appId = env.ZEGOCLOUD_APP_ID;
  const secret = env.ZEGOCLOUD_SERVER_SECRET;

  const now = Math.floor(Date.now() / 1000);
  const expire = now + TOKEN_EXPIRY_SECONDS;
  const nonce = crypto.randomInt(0, 2147483647);

  const payload = JSON.stringify({
    app_id: appId,
    user_id: userId,
    nonce,
    ctime: now,
    expire,
    payload: roomId,
  });

  const payloadBuffer = Buffer.from(payload, "utf8");

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payloadBuffer);
  const mac = hmac.digest();

  const expireBuffer = Buffer.alloc(4);
  expireBuffer.writeUInt32BE(expire, 0);

  const payloadLenBuffer = Buffer.alloc(2);
  payloadLenBuffer.writeUInt16BE(payloadBuffer.length, 0);

  const binaryData = Buffer.concat([
    expireBuffer,
    mac,
    payloadLenBuffer,
    payloadBuffer,
  ]);

  return "04" + binaryData.toString("base64");
}

export function makeRoomId(appointmentId: string): string {
  return `appointment_${appointmentId}`;
}
