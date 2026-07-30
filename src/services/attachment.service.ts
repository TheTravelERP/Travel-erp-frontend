// src/services/attachment.service.ts
import api from './api';

export interface Attachment {
  uuid: string;
  entity_type: string;
  entity_id: number;
  category?: string | null;
  file_url: string;
  original_filename?: string | null;
  content_type?: string | null;
  file_size?: number | null;
  remarks?: string | null;
  created_at: string;
}

export async function uploadAttachment(
  entityType: string,
  entityUuid: string,
  menuKey: string,
  category: string,
  file: File,
): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<Attachment>(
    `/api/v1/attachments?entity_type=${entityType}&entity_uuid=${entityUuid}&menu_key=${menuKey}&category=${category}`,
    formData,
  );
  return data;
}

export async function listAttachments(
  entityType: string,
  entityUuid: string,
  menuKey: string,
  signal?: AbortSignal,
): Promise<Attachment[]> {
  const { data } = await api.get<{ data: Attachment[] }>('/api/v1/attachments', {
    params: { entity_type: entityType, entity_uuid: entityUuid, menu_key: menuKey },
    signal,
  });
  return data.data;
}

export async function deleteAttachment(attachmentUuid: string, menuKey: string): Promise<void> {
  await api.delete(`/api/v1/attachments/${attachmentUuid}`, { params: { menu_key: menuKey } });
}
