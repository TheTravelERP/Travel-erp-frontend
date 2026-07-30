// src/services/globalSearch.service.ts
import api from "./api";

export interface SearchResultItem {
  uuid: string;
  title?: string;
  subtitle?: string;
}

export interface GlobalSearchResponse {
  customers: SearchResultItem[];
  enquiries: SearchResultItem[];
  notifications: SearchResultItem[];
  notification_logs: SearchResultItem[];
}

export async function globalSearch(query: string, signal?: AbortSignal): Promise<GlobalSearchResponse> {
  const { data } = await api.get<GlobalSearchResponse>("/api/v1/search", {
    params: { q: query },
    signal,
  });
  return data;
}
