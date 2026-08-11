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
  // Tax & Pricing Architecture — a candidate input to classify_tax_
  // treatment() for Flight lines routed through this airline (via
  // InventoryStock.airline_id), never a shortcut around it. Optional —
  // unset resolves any such line to undetermined until configured.
  default_tax_treatment?: string | null;
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
  country?: string;
  from_date?: string;
  to_date?: string;
  is_active?: boolean;
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
