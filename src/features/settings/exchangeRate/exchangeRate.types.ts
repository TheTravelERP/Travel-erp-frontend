// src/features/settings/exchangeRate/exchangeRate.types.ts

export interface ExchangeRateFormInput {
  from_currency_code: string;
  to_currency_code: string;
  rate: number | string;
  effective_from: string;
  effective_to?: string;
  is_active?: boolean;
}

export interface ExchangeRateDetail extends ExchangeRateFormInput {
  uuid: string;
  version_no: number;
}

export interface ExchangeRateListItem {
  uuid: string;
  from_currency_code: string;
  to_currency_code: string;
  rate: number | string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetExchangeRatesParams {
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

export interface ExchangeRateListApiResponse {
  data: ExchangeRateListItem[];
  pagination: Pagination;
}

export interface ExchangeRateBulkActionResult {
  message: string;
  count: number;
}
