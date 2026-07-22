// src/features/inventory/ziyarat/ziyarat.types.ts

export interface ZiyaratFormInput {
  name: string;
  city?: string;
  duration_hours?: number;
  description?: string;
  places_covered?: string;
  default_cost?: number;
  pickup_location?: string;
  drop_location?: string;
  remarks?: string;
  is_active?: boolean;
}

export interface ZiyaratDetail extends ZiyaratFormInput {
  uuid: string;
  version_no: number;
}

export interface ZiyaratListItem {
  uuid: string;
  name: string;
  city?: string;
  duration_hours?: number;
  default_cost?: number;
  is_active: boolean;
  created_at: string;
}

export interface GetZiyaratsParams {
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

export interface ZiyaratListApiResponse {
  data: ZiyaratListItem[];
  pagination: Pagination;
}

export interface ZiyaratBulkActionResult {
  message: string;
  count: number;
}
