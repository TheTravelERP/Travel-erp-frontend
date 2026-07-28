// src/features/reports/notificationLogs/notificationLog.api.ts
import api from "../../../services/api";

import type {
  NotificationLogDetail,
  NotificationLogListApiResponse,
  GetNotificationLogsParams,
} from "./notificationLog.types";

export async function getNotificationLogs(
  params: GetNotificationLogsParams,
  signal?: AbortSignal,
): Promise<NotificationLogListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<NotificationLogListApiResponse>("/api/v1/notification-logs", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getNotificationLogProviders(signal?: AbortSignal): Promise<string[]> {
  const { data } = await api.get<string[]>("/api/v1/notification-logs/providers", { signal });
  return data;
}

export async function getNotificationLogDetail(uuid: string): Promise<NotificationLogDetail> {
  const { data } = await api.get<NotificationLogDetail>(`/api/v1/notification-logs/${uuid}`);
  return data;
}
