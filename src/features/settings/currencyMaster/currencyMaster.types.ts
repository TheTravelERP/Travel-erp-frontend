// src/features/settings/currencyMaster/currencyMaster.types.ts

export interface CurrencyMasterFormInput {
  code: string;
  name: string;
  symbol?: string;
  decimal_places?: number;
  is_active?: boolean;
}

export interface CurrencyMasterDetail extends CurrencyMasterFormInput {
  uuid: string;
  version_no: number;
}

export interface CurrencyMasterListItem {
  uuid: string;
  code: string;
  name: string;
  symbol?: string;
  decimal_places: number;
  is_active: boolean;
  created_at: string;
}

export interface GetCurrencyMastersParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_deleted?: boolean;
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

export interface CurrencyMasterListApiResponse {
  data: CurrencyMasterListItem[];
  pagination: Pagination;
}

export interface CurrencyMasterBulkActionResult {
  message: string;
  count: number;
}
