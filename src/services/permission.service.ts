// src/services/permission.service.ts
import api from './api';

export type DataScope = 'OWN' | 'TEAM' | 'ORG' | 'GLOBAL';

export interface MenuPermissionNode {
  menu_id: number;
  key: string;
  title: string;
  parent_id: number | null;
  icon: string | null;
  sort_order: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
  can_print: boolean;
  can_approve: boolean;
  can_cancel: boolean;
  can_reopen: boolean;
  data_scope: DataScope;
}

export interface UserPermissionsResponse {
  user_uuid: string;
  permissions: MenuPermissionNode[];
}

export type PermissionUpdateItem = Pick<
  MenuPermissionNode,
  | 'menu_id'
  | 'can_view'
  | 'can_create'
  | 'can_edit'
  | 'can_delete'
  | 'can_export'
  | 'can_import'
  | 'can_print'
  | 'can_approve'
  | 'can_cancel'
  | 'can_reopen'
  | 'data_scope'
>;

export const fetchUserPermissions = async (
  userUuid: string,
  signal?: AbortSignal
): Promise<UserPermissionsResponse> => {
  const res = await api.get(`/api/v1/settings/permissions/${userUuid}`, { signal });
  return res.data;
};

export const updateUserPermissions = async (
  userUuid: string,
  permissions: PermissionUpdateItem[]
): Promise<UserPermissionsResponse> => {
  const res = await api.put(`/api/v1/settings/permissions/${userUuid}`, { permissions });
  return res.data;
};
