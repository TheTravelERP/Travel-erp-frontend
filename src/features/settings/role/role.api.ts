// src/features/settings/role/role.api.ts
import api from "../../../services/api";

import type {
  RoleDetail,
  RoleFormInput,
  RoleListApiResponse,
  GetRolesParams,
  RoleBulkActionResult,
  RolePermissionsApiResponse,
  PermissionUpdateItem,
} from "./role.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createRole(payload: RoleFormInput) {
  const { data } = await api.post("/api/v1/roles", cleanPayload(payload));
  return data;
}

export async function getRoles(
  params: GetRolesParams,
  signal?: AbortSignal,
): Promise<RoleListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<RoleListApiResponse>("/api/v1/roles", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getRoleByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<RoleDetail> {
  const { data } = await api.get<RoleDetail>(`/api/v1/roles/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateRoleByUuid(
  uuid: string,
  payload: RoleFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/roles/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteRoleByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/roles/${uuid}`);
  return data;
}

export async function restoreRoleByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/roles/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteRoles(uuids: string[]): Promise<RoleBulkActionResult> {
  const { data } = await api.post<RoleBulkActionResult>("/api/v1/roles/bulk-delete", {
    role_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreRoles(uuids: string[]): Promise<RoleBulkActionResult> {
  const { data } = await api.post<RoleBulkActionResult>("/api/v1/roles/bulk-restore", {
    role_uuids: uuids,
  });
  return data;
}

/* ==========================================================
   IMPORT
========================================================== */

import type { ImportResult } from "../../../components/common/ImportResultDialog";

export async function importRolesFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ImportResult>("/api/v1/roles/import", formData);

  return data;
}

export async function fetchRolePermissions(
  roleUuid: string,
  signal?: AbortSignal,
): Promise<RolePermissionsApiResponse> {
  const { data } = await api.get(`/api/v1/roles/${roleUuid}/permissions`, { signal });
  return data;
}

export async function updateRolePermissions(
  roleUuid: string,
  permissions: PermissionUpdateItem[],
): Promise<RolePermissionsApiResponse> {
  const { data } = await api.put(`/api/v1/roles/${roleUuid}/permissions`, { permissions });
  return data;
}
