// src/services/note.service.ts
import api from './api';

export interface Note {
  uuid: string;
  entity_type: string;
  entity_id: number;
  note_text: string;
  is_pinned: boolean;
  version_no: number;
  created_by?: number | null;
  created_by_name?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export async function listNotes(entityType: string, entityUuid: string, signal?: AbortSignal): Promise<Note[]> {
  const { data } = await api.get<{ data: Note[] }>('/api/v1/notes', {
    params: { entity_type: entityType, entity_uuid: entityUuid },
    signal,
  });
  return data.data;
}

export async function createNote(
  entityType: string, entityUuid: string, note_text: string, is_pinned: boolean,
): Promise<Note> {
  const { data } = await api.post<Note>(
    '/api/v1/notes',
    { note_text, is_pinned },
    { params: { entity_type: entityType, entity_uuid: entityUuid } },
  );
  return data;
}

export async function updateNote(
  noteUuid: string, entityType: string, note_text: string, is_pinned: boolean, version_no: number,
): Promise<Note> {
  const { data } = await api.put<Note>(
    `/api/v1/notes/${noteUuid}`,
    { note_text, is_pinned, version_no },
    { params: { entity_type: entityType } },
  );
  return data;
}

export async function deleteNote(noteUuid: string, entityType: string): Promise<void> {
  await api.delete(`/api/v1/notes/${noteUuid}`, { params: { entity_type: entityType } });
}
