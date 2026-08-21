// src/features/settings/serviceType/serviceType.types.ts

export interface ServiceTypeFormInput {
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface ServiceTypeDetail extends ServiceTypeFormInput {
  uuid: string;
  is_system: boolean;
  version_no: number;
}

export interface ServiceTypeListItem {
  uuid: string;
  code: string;
  name: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

export interface GetServiceTypesParams {
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

export interface ServiceTypeListApiResponse {
  data: ServiceTypeListItem[];
  pagination: Pagination;
}

export interface ServiceTypeBulkActionResult {
  message: string;
  count: number;
}
