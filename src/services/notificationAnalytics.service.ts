// src/services/notificationAnalytics.service.ts
import api from "./api";

export interface ProviderPerformanceItem {
  provider_name: string;
  sent: number;
  failed: number;
  success_rate: number;
}

export interface TopEventItem {
  event_code: string;
  count: number;
}

export interface TopTemplateItem {
  template_name: string;
  count: number;
}

export interface NotificationAnalytics {
  notifications_created: number;
  sent: number;
  failed: number;
  cancelled: number;
  retry_count: number;
  delivery_rate: number;
  failure_rate: number;
  avg_delivery_seconds: number | null;
  channel_breakdown: Record<string, Record<string, number>>;
  provider_performance: ProviderPerformanceItem[];
  top_events: TopEventItem[];
  top_templates: TopTemplateItem[];
}

export interface GetAnalyticsParams {
  from_date?: string;
  to_date?: string;
  module_group?: string;
  channel?: string;
}

export async function getNotificationAnalytics(
  params: GetAnalyticsParams,
  signal?: AbortSignal,
): Promise<NotificationAnalytics> {
  const cleanParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  const { data } = await api.get<NotificationAnalytics>("/api/v1/notification-analytics", {
    params: cleanParams,
    signal,
  });
  return data;
}

export interface ProviderHealthItem {
  uuid: string;
  provider_name: string;
  provider_type: string;
  provider_category: string;
  is_active: boolean;
  last_success?: string | null;
  last_failure?: string | null;
  success_rate?: number | null;
  failure_rate?: number | null;
  avg_response_seconds?: number | null;
  status: "HEALTHY" | "WARNING" | "OFFLINE";
}

export async function getProviderHealth(signal?: AbortSignal): Promise<ProviderHealthItem[]> {
  const { data } = await api.get<ProviderHealthItem[]>("/api/v1/provider-health", { signal });
  return data;
}
