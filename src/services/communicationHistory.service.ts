// src/services/communicationHistory.service.ts
import api from "./api";

export interface CommunicationHistoryItem {
  source: "outbound" | "in_app";
  uuid: string;
  channel: string;
  provider_name?: string | null;
  recipient?: string | null;
  status: string;
  template_name?: string | null;
  retry_count: number;
  message_preview?: string | null;
  provider_response?: unknown;
  event_code?: string | null;
  occurred_at: string;
}

export interface CommunicationHistoryResponse {
  data: CommunicationHistoryItem[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

export async function getCommunicationHistory(
  entityType: string,
  entityUuid: string,
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<CommunicationHistoryResponse> {
  const { data } = await api.get<CommunicationHistoryResponse>("/api/v1/communication-history", {
    params: { entity_type: entityType, entity_uuid: entityUuid, page, page_size: pageSize },
    signal,
  });
  return data;
}
