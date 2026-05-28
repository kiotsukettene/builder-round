import { createCipheriv } from "crypto";
import { env } from "../config/env.js";

const TOKEN_EXPIRY_SECONDS = 3600;

function rndNum(a: number, b: number): number {
  return Math.ceil(a + (b - a) * Math.random());
}

function makeNonce(): number {
  return rndNum(-2147483648, 2147483647);
}

function makeRandomIv(): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getAlgorithm(key: string): string {
  switch (key.length) {
    case 16:
      return "aes-128-cbc";
    case 24:
      return "aes-192-cbc";
    case 32:
      return "aes-256-cbc";
    default:
      throw new Error(`Invalid ZegoCloud server secret length: ${key.length}`);
  }
}

function aesEncrypt(plainText: string, key: string, iv: string): ArrayBuffer {
  const cipher = createCipheriv(getAlgorithm(key), key, iv);
  cipher.setAutoPadding(true);
  const encrypted = cipher.update(plainText);
  const final = cipher.final();
  return Uint8Array.from(Buffer.concat([encrypted, final])).buffer;
}

/**
 * Generates a ZegoCloud token-04 using the official AES-CBC algorithm.
 * Reference: https://github.com/ZEGOCLOUD/zego_server_assistant
 */
export function generateToken04(
  appId: number,
  userId: string,
  secret: string,
  effectiveTimeInSeconds: number,
  payload = "",
): string {
  if (!appId || typeof appId !== "number") {
    throw new Error("ZegoCloud app ID is invalid");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("ZegoCloud user ID is invalid");
  }

  if (!secret || typeof secret !== "string" || secret.length !== 32) {
    throw new Error("ZegoCloud server secret must be a 32-byte string");
  }

  const createTime = Math.floor(Date.now() / 1000);
  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: makeNonce(),
    ctime: createTime,
    expire: createTime + effectiveTimeInSeconds,
    payload,
  };

  const plainText = JSON.stringify(tokenInfo);
  const iv = makeRandomIv();
  const encryptBuf = aesEncrypt(plainText, secret, iv);

  const expireBytes = Buffer.alloc(8);
  expireBytes.writeBigInt64BE(BigInt(tokenInfo.expire), 0);

  const ivLenBytes = Buffer.alloc(2);
  ivLenBytes.writeUInt16BE(iv.length, 0);

  const encryptLenBytes = Buffer.alloc(2);
  encryptLenBytes.writeUInt16BE(encryptBuf.byteLength, 0);

  const binary = Buffer.concat([
    expireBytes,
    ivLenBytes,
    Buffer.from(iv, "utf8"),
    encryptLenBytes,
    Buffer.from(encryptBuf),
  ]);

  return "04" + binary.toString("base64");
}

export function makeRoomId(appointmentId: string): string {
  return `appointment_${appointmentId}`;
}

export function generateZegoToken(userId: string, roomId: string): string {
  const payload = JSON.stringify({
    room_id: roomId,
    privilege: {
      "1": 1,
      "2": 1,
    },
    stream_id_list: null,
  });

  return generateToken04(
    env.ZEGOCLOUD_APP_ID,
    userId,
    env.ZEGOCLOUD_SERVER_SECRET,
    TOKEN_EXPIRY_SECONDS,
    payload,
  );
}
