// src/features/inventory/transportCompany/transportCompany.types.ts

export interface TransportCompanyFormInput {
  company_name: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  gstin?: string;
  remarks?: string;
  is_active?: boolean;
}

export interface TransportCompanyDetail extends TransportCompanyFormInput {
  uuid: string;
  version_no: number;
}

export interface TransportCompanyListItem {
  uuid: string;
  company_name: string;
  contact_person?: string;
  mobile?: string;
  city?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetTransportCompaniesParams {
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

export interface TransportCompanyListApiResponse {
  data: TransportCompanyListItem[];
  pagination: Pagination;
}

export interface TransportCompanyBulkActionResult {
  message: string;
  count: number;
}
