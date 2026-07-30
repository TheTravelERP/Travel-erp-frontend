// src/features/notifications/notification.api.ts
import api from "../../services/api";

import type {
  GetNotificationsParams,
  NotificationGroupItem,
  NotificationListApiResponse,
} from "./notification.types";

export async function getNotifications(
  params: GetNotificationsParams,
  signal?: AbortSignal,
): Promise<NotificationListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<NotificationListApiResponse>("/api/v1/notifications", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getUnreadCount(signal?: AbortSignal): Promise<number> {
  const { data } = await api.get<{ unread_count: number }>("/api/v1/notifications/unread-count", { signal });
  return data.unread_count;
}

export async function markNotificationRead(uuid: string): Promise<void> {
  await api.post(`/api/v1/notifications/${uuid}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/api/v1/notifications/mark-all-read");
}

export async function archiveNotification(uuid: string): Promise<void> {
  await api.post(`/api/v1/notifications/${uuid}/archive`);
}

export async function getNotificationGroups(
  isArchived = false,
  signal?: AbortSignal,
): Promise<NotificationGroupItem[]> {
  const { data } = await api.get<NotificationGroupItem[]>("/api/v1/notifications/grouped", {
    params: { is_archived: isArchived },
    signal,
  });
  return data;
}
