// src/features/inventory/airline/airline.types.ts

export interface AirlineFormInput {
  airline_code: string;
  icao_code?: string;
  airline_name: string;
  country?: string;
  website?: string;
  logo?: string;
  phone?: string;
  email?: string;
  remarks?: string;
  is_active?: boolean;
}

export interface AirlineDetail extends AirlineFormInput {
  uuid: string;
  version_no: number;
}

export interface AirlineListItem {
  uuid: string;
  airline_code: string;
  airline_name: string;
  icao_code?: string;
  country?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetAirlinesParams {
  page?: number;
  page_size?: number;
  search?: string;
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

export interface AirlineListApiResponse {
  data: AirlineListItem[];
  pagination: Pagination;
}

export interface AirlineBulkActionResult {
  message: string;
  count: number;
}
