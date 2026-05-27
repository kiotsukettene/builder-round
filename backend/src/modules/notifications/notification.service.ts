import * as notificationRepository from "./notification.repository.js";
import type { ListNotificationsQueryInput } from "./notification.validation.js";

export async function getNotifications(
  userId: string,
  query: ListNotificationsQueryInput,
) {
  const { page, limit } = query;
  const { notifications, total } =
    await notificationRepository.findNotificationsByUserId(userId, query);

  return {
    data: notifications,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function markAsRead(userId: string, notificationId: string) {
  await notificationRepository.markNotificationAsRead(notificationId, userId);
}

export async function markAllAsRead(userId: string) {
  await notificationRepository.markAllNotificationsAsRead(userId);
}

export async function getUnreadCount(userId: string) {
  const count = await notificationRepository.countUnreadNotifications(userId);
  return { count };
}
