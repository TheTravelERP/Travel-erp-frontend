// src/features/inventory/insuranceProvider/insuranceProvider.types.ts

export interface InsuranceProviderFormInput {
  provider_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  remarks?: string;
  is_active?: boolean;
}

export interface InsuranceProviderDetail extends InsuranceProviderFormInput {
  uuid: string;
  version_no: number;
}

export interface InsuranceProviderListItem {
  uuid: string;
  provider_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetInsuranceProvidersParams {
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

export interface InsuranceProviderListApiResponse {
  data: InsuranceProviderListItem[];
  pagination: Pagination;
}

export interface InsuranceProviderBulkActionResult {
  message: string;
  count: number;
}
