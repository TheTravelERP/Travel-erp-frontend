import { useMenu } from '../context/MenuContext';

const EMPTY_PERMISSIONS = {
  can_view: false,
  can_create: false,
  can_edit: false,
  can_delete: false,
  can_export: false,
  can_import: false,
  can_print: false,
  data_scope: 'NONE',
};

export function usePermission(menuId: string) {
  const { findMenu } = useMenu();

  const menu = findMenu(menuId);

  return menu?.permissions
    ? { ...EMPTY_PERMISSIONS, ...menu.permissions }
    : EMPTY_PERMISSIONS;
}
