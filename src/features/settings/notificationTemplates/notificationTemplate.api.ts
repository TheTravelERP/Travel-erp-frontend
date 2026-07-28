// src/features/settings/notificationTemplates/notificationTemplate.api.ts
import api from "../../../services/api";

import type {
  NotificationTemplateDetail,
  NotificationTemplateFormInput,
  NotificationTemplateListApiResponse,
  GetNotificationTemplatesParams,
  NotificationTemplateBulkActionResult,
  TemplatePreviewResult,
  NotificationChannel,
} from "./notificationTemplate.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createNotificationTemplate(payload: NotificationTemplateFormInput) {
  const { data } = await api.post("/api/v1/notification-templates", cleanPayload(payload));
  return data;
}

export async function getNotificationTemplates(
  params: GetNotificationTemplatesParams,
  signal?: AbortSignal,
): Promise<NotificationTemplateListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<NotificationTemplateListApiResponse>("/api/v1/notification-templates", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getNotificationTemplateByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<NotificationTemplateDetail> {
  const { data } = await api.get<NotificationTemplateDetail>(`/api/v1/notification-templates/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateNotificationTemplateByUuid(
  uuid: string,
  payload: NotificationTemplateFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/notification-templates/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteNotificationTemplateByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/notification-templates/${uuid}`);
  return data;
}

export async function restoreNotificationTemplateByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/notification-templates/${uuid}/restore`, {});
  return data;
}

export async function duplicateNotificationTemplate(uuid: string): Promise<NotificationTemplateDetail> {
  const { data } = await api.post<NotificationTemplateDetail>(`/api/v1/notification-templates/${uuid}/duplicate`, {});
  return data;
}

export async function previewNotificationTemplate(payload: {
  channel: NotificationChannel;
  subject?: string;
  message_body: string;
}): Promise<TemplatePreviewResult> {
  const { data } = await api.post<TemplatePreviewResult>("/api/v1/notification-templates/preview", payload);
  return data;
}

export async function bulkDeleteNotificationTemplates(uuids: string[]): Promise<NotificationTemplateBulkActionResult> {
  const { data } = await api.post<NotificationTemplateBulkActionResult>("/api/v1/notification-templates/bulk-delete", {
    template_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreNotificationTemplates(uuids: string[]): Promise<NotificationTemplateBulkActionResult> {
  const { data } = await api.post<NotificationTemplateBulkActionResult>("/api/v1/notification-templates/bulk-restore", {
    template_uuids: uuids,
  });
  return data;
}
