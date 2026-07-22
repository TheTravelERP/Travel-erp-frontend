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

export async function getUserById(userUuid: string, isDeleted = false): Promise<UserDetail> {
  const { data } = await api.get<UserDetail>(`/api/v1/settings/users/${userUuid}`, {
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
  userUuid: string,
  payload: UserUpdateInput & { version_no: number },
): Promise<UserDetail> {
  const { data } = await api.put<UserDetail>(`/api/v1/settings/users/${userUuid}`, payload);
  return data;
}

/* ==========================================================
   DELETE / RESTORE
========================================================== */

export async function deleteUser(userUuid: string) {
  const { data } = await api.delete(`/api/v1/settings/users/${userUuid}`);
  return data;
}

export async function restoreUser(userUuid: string) {
  const { data } = await api.put(`/api/v1/settings/users/${userUuid}/restore`, {});
  return data;
}

/* ==========================================================
   BULK
========================================================== */

export async function bulkDeleteUsers(userUuids: string[]): Promise<UserBulkActionResult> {
  const { data } = await api.post<UserBulkActionResult>('/api/v1/settings/users/bulk-delete', {
    user_uuids: userUuids,
  });
  return data;
}

export async function bulkRestoreUsers(userUuids: string[]): Promise<UserBulkActionResult> {
  const { data } = await api.post<UserBulkActionResult>('/api/v1/settings/users/bulk-restore', {
    user_uuids: userUuids,
  });
  return data;
}

