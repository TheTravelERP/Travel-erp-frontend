// src/features/settings/localizationProfile/localizationProfile.types.ts

export interface TaxComponentInput {
  uuid?: string;
  tax_name: string;
  tax_percent: number | string;
  tax_type?: string;
  sequence?: number;
  is_active?: boolean;
}

export interface LocalizationProfileFormInput {
  profile_name: string;
  country_code: string;
  default_currency_code: string;
  timezone: string;
  financial_year_start_month: number;
  date_format: string;
  time_format: string;
  number_format: string;
  registration_label: string;
  tax_calculation_method: string;
  round_off_method: string;
  default_decimal_places: number;
  is_active?: boolean;
  tax_components: TaxComponentInput[];

  // Tax & Pricing Architecture layer 3's org/branch-level elections — all
  // optional. classify_tax_treatment() reads these directly; unset means
  // any Rent-a-cab/Forex/Insurance line resolves to undetermined (blocked
  // at quotation save time, never here) until explicitly configured.
  supply_model?: string | null;
  rent_a_cab_rate_election?: string | null;
  forex_valuation_method?: string | null;
  insurance_commercial_role?: string | null;
}

export interface LocalizationProfileDetail extends LocalizationProfileFormInput {
  uuid: string;
  version_no: number;
}

export interface LocalizationProfileListItem {
  uuid: string;
  profile_name: string;
  country_code: string;
  default_currency_code: string;
  timezone: string;
  financial_year_start_month: number;
  registration_label: string;
  is_active: boolean;
  created_at: string;
}

export interface GetLocalizationProfilesParams {
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

export interface LocalizationProfileListApiResponse {
  data: LocalizationProfileListItem[];
  pagination: Pagination;
}

export interface LocalizationProfileBulkActionResult {
  message: string;
  count: number;
}
