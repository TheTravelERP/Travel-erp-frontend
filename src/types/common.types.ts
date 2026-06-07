// src/types/common.types.ts
export interface EntityDropdownItem {
  label: string;
  value: any;
  [key: string]: any;
}

export interface EntityDropdownResponse {
  items: EntityDropdownItem[];
  total: number;
  page: number;
  page_size: number;
}