import type { MenuItem } from '../types/menu.types';

export function can(menu?: MenuItem, action?: keyof MenuItem['permissions']) {
  if (!menu || !action) return false;
  return menu.permissions[action] === true;
}

export function dataScope(menu?: MenuItem) {
  return menu?.permissions?.data_scope ?? 'OWN';
}
