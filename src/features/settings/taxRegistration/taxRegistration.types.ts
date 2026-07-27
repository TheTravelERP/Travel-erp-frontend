// src/features/settings/taxRegistration/taxRegistration.types.ts

export interface TaxRegistrationFormInput {
  label: string;
  registration_number: string;
  country?: string;
  localization_profile_uuid?: string;
  is_active?: boolean;
}

export interface TaxRegistrationDetail extends TaxRegistrationFormInput {
  uuid: string;
  version_no: number;
}

export interface TaxRegistrationListItem {
  uuid: string;
  label: string;
  registration_number: string;
  country?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetTaxRegistrationsParams {
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

export interface TaxRegistrationListApiResponse {
  data: TaxRegistrationListItem[];
  pagination: Pagination;
}

export interface TaxRegistrationBulkActionResult {
  message: string;
  count: number;
}
