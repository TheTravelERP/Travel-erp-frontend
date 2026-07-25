// src/features/settings/users/userPermissionOverride.api.ts
import api from "../../../services/api";
import type { UserPermissionOverrideFormInput, UserPermissionOverrideItem } from "./userPermissionOverride.types";

interface ListResponse {
  data: UserPermissionOverrideItem[];
}

export async function listUserPermissionOverrides(
  userUuid: string,
  signal?: AbortSignal,
): Promise<UserPermissionOverrideItem[]> {
  const { data } = await api.get<ListResponse>(
    `/api/v1/settings/users/${userUuid}/permission-overrides`,
    { signal },
  );
  return data.data;
}

export async function upsertUserPermissionOverride(
  userUuid: string,
  payload: UserPermissionOverrideFormInput,
): Promise<UserPermissionOverrideItem[]> {
  const { data } = await api.post<ListResponse>(
    `/api/v1/settings/users/${userUuid}/permission-overrides`,
    payload,
  );
  return data.data;
}

export async function deleteUserPermissionOverride(
  userUuid: string,
  overrideUuid: string,
): Promise<UserPermissionOverrideItem[]> {
  const { data } = await api.delete<ListResponse>(
    `/api/v1/settings/users/${userUuid}/permission-overrides/${overrideUuid}`,
  );
  return data.data;
}
