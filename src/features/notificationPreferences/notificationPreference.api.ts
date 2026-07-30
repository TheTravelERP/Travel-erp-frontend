// src/features/notificationPreferences/notificationPreference.api.ts
import api from "../../services/api";
import type { NotificationPreference } from "./notificationPreference.types";

export async function getMyNotificationPreferences(): Promise<NotificationPreference> {
  const { data } = await api.get<NotificationPreference>("/api/v1/notification-preferences/me");
  return data;
}

export async function updateMyNotificationPreferences(
  payload: NotificationPreference,
): Promise<NotificationPreference> {
  const { data } = await api.put<NotificationPreference>("/api/v1/notification-preferences/me", payload);
  return data;
}
