// src/features/settings/documentNumberSeries/documentNumberSeries.types.ts

export type ResetPolicy = "Never" | "Daily" | "Weekly" | "Monthly" | "Yearly" | "Financial Year";

export interface DocumentNumberSeriesFormInput {
  branch_uuid: string;
  document_type_uuid: string;
  series_name: string;
  prefix?: string;
  suffix?: string;
  separator?: string;
  number_length?: number;
  starting_number?: number;
  reset_policy?: ResetPolicy;
  is_default?: boolean;
  effective_from?: string;
  effective_to?: string;
  is_active?: boolean;
}

export interface DocumentNumberSeriesDetail extends DocumentNumberSeriesFormInput {
  uuid: string;
  branch_code: string;
  document_type_code: string;
  next_number: number;
  is_locked: boolean;
  has_generated: boolean;
  last_generated_at?: string;
  created_at: string;
}

export interface DocumentNumberSeriesListItem {
  uuid: string;
  series_name: string;
  branch_code: string;
  document_type_code: string;
  prefix: string;
  suffix?: string;
  is_default: boolean;
  is_locked: boolean;
  effective_from?: string;
  effective_to?: string;
  last_generated_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetDocumentNumberSeriesParams {
  page?: number;
  page_size?: number;
  branch_uuid?: string;
  document_type_uuid?: string;
  is_active?: boolean;
  search?: string;
  from_date?: string;
  to_date?: string;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface DocumentNumberSeriesListApiResponse {
  data: DocumentNumberSeriesListItem[];
  pagination: Pagination;
}

export interface CloneDocumentNumberSeriesInput {
  series_name: string;
  effective_from?: string;
  effective_to?: string;
  is_default?: boolean;
  starting_number?: number;
}
