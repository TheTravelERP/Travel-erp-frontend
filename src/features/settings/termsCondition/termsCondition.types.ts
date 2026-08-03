// src/features/settings/termsCondition/termsCondition.types.ts

export interface TermsConditionFormInput {
  code?: string;
  title: string;
  document_type_uuid: string;
  terms_text: string;
  is_default?: boolean;
  remarks?: string;
  is_active?: boolean;
}

export interface TermsConditionDetail extends TermsConditionFormInput {
  uuid: string;
  document_type_name?: string;
  document_type_code?: string;
  version_no: number;
  created_at: string;
}

export interface TermsConditionListItem {
  uuid: string;
  code?: string;
  title: string;
  document_type_uuid?: string;
  document_type_name?: string;
  document_type_code?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface GetTermsConditionsParams {
  page?: number;
  page_size?: number;
  search?: string;
  document_type_uuid?: string;
  is_default?: boolean;
  is_active?: boolean;
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

export interface TermsConditionListApiResponse {
  data: TermsConditionListItem[];
  pagination: Pagination;
}

export interface TermsConditionBulkActionResult {
  message: string;
  count: number;
}
