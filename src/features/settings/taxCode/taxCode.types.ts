// src/features/settings/taxCode/taxCode.types.ts

export interface TaxCodeFormInput {
  code: string;
  name: string;
  rate: string;
  tax_type?: string;
  is_active?: boolean;
}

export interface TaxCodeDetail extends TaxCodeFormInput {
  uuid: string;
  version_no: number;
}

export interface TaxCodeListItem {
  uuid: string;
  code: string;
  name: string;
  rate: string;
  tax_type?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetTaxCodesParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: string;
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

export interface TaxCodeListApiResponse {
  data: TaxCodeListItem[];
  pagination: Pagination;
}

export interface TaxCodeBulkActionResult {
  message: string;
  count: number;
}
