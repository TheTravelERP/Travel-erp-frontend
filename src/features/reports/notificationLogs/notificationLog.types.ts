// src/features/reports/notificationLogs/notificationLog.types.ts

export type NotificationChannel = "EMAIL" | "WHATSAPP" | "SMS";
export type NotificationLogStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED" | "CANCELLED" | "RETRY";

export interface NotificationLogListItem {
  uuid: string;
  event_code: string;
  module_group?: string;
  channel: NotificationChannel;
  recipient_address: string;
  provider_name?: string;
  status: NotificationLogStatus;
  sent_time?: string;
  delivered_time?: string;
  retry_count: number;
  error_message?: string;
  created_at: string;
}

export interface NotificationLogDetail extends NotificationLogListItem {
  provider_response?: unknown;
}

export interface GetNotificationLogsParams {
  page?: number;
  page_size?: number;
  search?: string;
  module_group?: string;
  channel?: NotificationChannel | "";
  provider_name?: string;
  status?: NotificationLogStatus | "";
  recipient?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface NotificationLogListApiResponse {
  data: NotificationLogListItem[];
  pagination: Pagination;
}
