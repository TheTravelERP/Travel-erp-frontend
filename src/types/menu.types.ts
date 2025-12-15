export type MenuPermission = {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_import: boolean;
  can_print: boolean;
  data_scope: 'OWN' | 'TEAM' | 'ORG' | 'GLOBAL';
};

export type MenuItem = {
  id: string;                 // menu.key (crm_enquiries)
  title: string;
  path?: string;
  icon?: string;
  permissions: MenuPermission;
  children?: MenuItem[];
};
