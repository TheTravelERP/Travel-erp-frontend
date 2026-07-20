// src/features/settings/users/users.api.ts
import api from '../../../services/api';
import type {
  UserDetail,
  UserListApiResponse,
  UserCreateInput,
  UserUpdateInput,
  GetUsersParams,
  UserBulkActionResult,
  UserListItem,
} from './users.types';

/* ==========================================================
   LIST
========================================================== */

export async function getUsers(
  params: GetUsersParams,
  signal?: AbortSignal,
): Promise<UserListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  );

  const { data } = await api.get<UserListApiResponse>('/api/v1/settings/users', {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getUsersLookup(signal?: AbortSignal): Promise<UserListItem[]> {
  const { data } = await api.get<UserListItem[]>('/api/v1/settings/users/lookup', { signal });
  return data;
}

/* ==========================================================
   DETAIL
========================================================== */

export async function getUserById(userId: number, isDeleted = false): Promise<UserDetail> {
  const { data } = await api.get<UserDetail>(`/api/v1/settings/users/${userId}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

/* ==========================================================
   CREATE / UPDATE
========================================================== */

export async function createUser(payload: UserCreateInput): Promise<UserDetail> {
  const { data } = await api.post<UserDetail>('/api/v1/settings/users', payload);
  return data;
}

export async function updateUser(
  userId: number,
  payload: UserUpdateInput & { version_no: number },
): Promise<UserDetail> {
  const { data } = await api.put<UserDetail>(`/api/v1/settings/users/${userId}`, payload);
  return data;
}

/* ==========================================================
   DELETE / RESTORE
========================================================== */

export async function deleteUser(userId: number) {
  const { data } = await api.delete(`/api/v1/settings/users/${userId}`);
  return data;
}

export async function restoreUser(userId: number) {
  const { data } = await api.put(`/api/v1/settings/users/${userId}/restore`, {});
  return data;
}

/* ==========================================================
   BULK
========================================================== */

export async function bulkDeleteUsers(userIds: number[]): Promise<UserBulkActionResult> {
  const { data } = await api.post<UserBulkActionResult>('/api/v1/settings/users/bulk-delete', {
    user_ids: userIds,
  });
  return data;
}

export async function bulkRestoreUsers(userIds: number[]): Promise<UserBulkActionResult> {
  const { data } = await api.post<UserBulkActionResult>('/api/v1/settings/users/bulk-restore', {
    user_ids: userIds,
  });
  return data;
}

/* ==========================================================
   FILE UPLOAD
========================================================== */

export async function uploadUserFile(
  file: File,
  category: 'picture' | 'identification',
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<{ url: string }>(
    `/api/v1/settings/users/upload?category=${category}`,
    formData,
  );

  return data;
}

/** Uploaded file URLs are backend-relative paths (e.g. "/uploads/1/picture/x.jpg") — resolve against the API origin, not the frontend's. */
export function resolveUploadUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${base}${path}`;
}
