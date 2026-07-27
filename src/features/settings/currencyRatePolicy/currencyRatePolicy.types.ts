// src/features/settings/currencyRatePolicy/currencyRatePolicy.types.ts

export interface CurrencyRatePolicyFormInput {
  from_currency_code: string;
  to_currency_code: string;
  rate_source: string;
  markup_percent?: number | string;
  manual_rate?: number | string;
  effective_from: string;
  effective_to?: string;
  is_active?: boolean;
}

export interface CurrencyRatePolicyDetail extends CurrencyRatePolicyFormInput {
  uuid: string;
  version_no: number;
}

export interface CurrencyRatePolicyListItem {
  uuid: string;
  from_currency_code: string;
  to_currency_code: string;
  rate_source: string;
  markup_percent?: number | string;
  manual_rate?: number | string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetCurrencyRatePoliciesParams {
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

export interface CurrencyRatePolicyListApiResponse {
  data: CurrencyRatePolicyListItem[];
  pagination: Pagination;
}

export interface CurrencyRatePolicyBulkActionResult {
  message: string;
  count: number;
}
