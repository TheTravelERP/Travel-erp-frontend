// src/features/notifications/notification.types.ts

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH";

export interface NotificationListItem {
  uuid: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  event_code?: string;
  related_entity_type?: string;
  related_entity_uuid?: string;
  is_read: boolean;
  read_at?: string;
  is_archived: boolean;
  created_at: string;
}

export interface GetNotificationsParams {
  page?: number;
  page_size?: number;
  is_read?: boolean;
  is_archived?: boolean;
  priority?: NotificationPriority | "";
  search?: string;
  event_code?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface NotificationGroupItem {
  event_code?: string | null;
  date: string;
  count: number;
  sample_title?: string | null;
  has_unread: boolean;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface NotificationListApiResponse {
  data: NotificationListItem[];
  pagination: Pagination;
}
