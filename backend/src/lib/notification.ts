import prisma from "./prisma.js";
import { getIO } from "./socket.js";
import { publishNotificationToUser } from "./pusher-beams.js";
import type { NotificationType } from "../generated/prisma/client.js";

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
}

export async function sendNotification(
  params: SendNotificationParams,
): Promise<void> {
  const { userId, type, title, message, relatedId } = params;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      relatedId: relatedId ?? null,
    },
  });

  try {
    const io = getIO();
    io.to(`user:${userId}`).emit("notification:new", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedId: notification.relatedId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });
  } catch {
    // Socket.IO not available (e.g., tests); notification was still persisted
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user) {
      await publishNotificationToUser(userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedId: notification.relatedId,
        createdAt: notification.createdAt,
        role: user.role,
      });
    }
  } catch {
    // Beams not configured or publish failed; in-app notification still delivered
  }
}
