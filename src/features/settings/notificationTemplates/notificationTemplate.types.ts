// src/features/settings/notificationTemplates/notificationTemplate.types.ts

export type NotificationChannel = "EMAIL" | "WHATSAPP" | "SMS";
export type NotificationModule = "CRM" | "Booking" | "Finance" | "System";

export interface NotificationTemplateFormInput {
  template_name: string;
  template_code: string;
  module?: NotificationModule | "";
  channel: NotificationChannel;
  subject?: string;
  message_body: string;
  description?: string;
  is_active?: boolean;
}

export interface NotificationTemplateDetail extends NotificationTemplateFormInput {
  uuid: string;
  version_no: number;
}

export interface NotificationTemplateListItem {
  uuid: string;
  template_name: string;
  template_code: string;
  module?: NotificationModule;
  channel: NotificationChannel;
  is_active: boolean;
  created_at: string;
}

export interface GetNotificationTemplatesParams {
  page?: number;
  page_size?: number;
  search?: string;
  channel?: NotificationChannel | "";
  module?: string;
  from_date?: string;
  to_date?: string;
  is_deleted?: boolean;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface NotificationTemplateListApiResponse {
  data: NotificationTemplateListItem[];
  pagination: Pagination;
}

export interface NotificationTemplateBulkActionResult {
  message: string;
  count: number;
}

export interface TemplatePreviewResult {
  subject?: string;
  message_body: string;
}
