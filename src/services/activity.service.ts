// src/services/activity.service.ts
import api from './api';

export interface ActivityItem {
  uuid: string;
  entity_type: string;
  entity_id?: number | null;
  entity_uuid?: string | null;
  action: string;
  actor_user_id?: number | null;
  actor_name?: string | null;
  actor_email?: string | null;
  changed_columns?: string[] | null;
  created_at: string;
}

export interface ActivityListResponse {
  data: ActivityItem[];
  pagination: { page: number; page_size: number; total: number; total_pages: number };
}

export async function getActivity(
  entityType: string, entityUuid: string, page = 1, page_size = 20, signal?: AbortSignal,
): Promise<ActivityListResponse> {
  const { data } = await api.get<ActivityListResponse>('/api/v1/activity', {
    params: { entity_type: entityType, entity_uuid: entityUuid, page, page_size },
    signal,
  });
  return data;
}
