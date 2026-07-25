// src/features/settings/users/userPermissionOverride.types.ts

export type DataScope = "OWN" | "TEAM" | "ORG" | "GLOBAL";
export type OverrideType = "ALLOW" | "DENY";

export interface UserPermissionOverrideItem {
  uuid: string;
  menu_id: number;
  menu_key: string;
  menu_title: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
  data_scope: DataScope;
  override_type: OverrideType;
  remarks?: string | null;
  created_at: string;
}

export interface UserPermissionOverrideFormInput {
  menu_id: number | null;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
  data_scope: DataScope;
  override_type: OverrideType;
  remarks?: string;
}
