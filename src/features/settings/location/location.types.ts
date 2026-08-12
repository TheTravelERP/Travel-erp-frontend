// src/features/settings/location/location.types.ts

export interface LocationFormInput {
  code: string;
  name: string;
  country_code: string;
  city_code?: string;
  remarks?: string;
  is_active?: boolean;
}

export interface LocationDetail extends LocationFormInput {
  uuid: string;
  country_name?: string;
  city_name?: string;
  version_no: number;
}

export interface LocationListItem {
  uuid: string;
  code: string;
  name: string;
  country_code?: string;
  country_name?: string;
  city_code?: string;
  city_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetLocationsParams {
  page?: number;
  page_size?: number;
  search?: string;
  country_code?: string;
  from_date?: string;
  to_date?: string;
  is_deleted?: boolean;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface LocationListApiResponse {
  data: LocationListItem[];
  pagination: Pagination;
}

export interface LocationBulkActionResult {
  message: string;
  count: number;
}
