// src/features/settings/stateProvinceMaster/stateProvince.types.ts
//
// Phase 4B: business/UI concept renamed City -> State/Province (see
// city_routes.py's module docstring on the backend for the full
// reasoning). The API request/response field names below (country_code,
// city_code, name) intentionally still say "city" — they mirror the
// backend's unchanged CityMaster schema field names exactly. Only the
// interface names and UI-facing labels changed.

export interface StateProvinceFormInput {
  country_code: string;
  city_code: string;
  name: string;
  is_active?: boolean;
}

export interface StateProvinceDetail extends StateProvinceFormInput {
  uuid: string;
  version_no: number;
}

export interface StateProvinceListItem {
  uuid: string;
  country_code: string;
  city_code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface GetStateProvincesParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_deleted?: boolean;
  from_date?: string;
  to_date?: string;
  is_active?: string;
  country_code?: string;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface StateProvinceListApiResponse {
  data: StateProvinceListItem[];
  pagination: Pagination;
}

export interface StateProvinceBulkActionResult {
  message: string;
  count: number;
}
