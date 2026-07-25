// src/features/settings/role/role.types.ts

export interface RoleFormInput {
  role_code: string;
  role_name: string;
  description?: string;
  is_active?: boolean;
}

export interface RoleDetail extends RoleFormInput {
  uuid: string;
  is_system: boolean;
  version_no: number;
}

export interface RoleListItem {
  uuid: string;
  role_code: string;
  role_name: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface GetRolesParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_deleted?: boolean;
  is_system?: string;
  from_date?: string;
  to_date?: string;
  is_active?: string;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface RoleListApiResponse {
  data: RoleListItem[];
  pagination: Pagination;
}

export interface RoleBulkActionResult {
  message: string;
  count: number;
}

export type DataScope = "OWN" | "TEAM" | "ORG" | "GLOBAL";

export interface MenuPermissionNode {
  menu_id: number;
  key: string;
  title: string;
  parent_id: number | null;
  icon: string | null;
  sort_order: number;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
  data_scope: DataScope;
}

export interface RolePermissionsApiResponse {
  role_uuid: string;
  permissions: MenuPermissionNode[];
}

export type PermissionUpdateItem = Pick<
  MenuPermissionNode,
  | "menu_id"
  | "can_view"
  | "can_add"
  | "can_edit"
  | "can_delete"
  | "can_export"
  | "can_import"
  | "data_scope"
>;
