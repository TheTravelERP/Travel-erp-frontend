// src/features/inventory/vendor/vendor.types.ts

export interface VendorFormInput {
  vendor_code: string;
  vendor_name: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  country_code?: string;
  state_province_code?: string;
  pincode?: string;
  payment_terms?: string;
  remarks?: string;
  status?: string;
  is_active?: boolean;
}

export interface VendorDetail extends VendorFormInput {
  uuid: string;
  country_name?: string;
  state_province_name?: string;
  version_no: number;
}

export interface VendorListItem {
  uuid: string;
  vendor_code: string;
  vendor_name: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  city?: string;
  status?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetVendorsParams {
  page?: number;
  page_size?: number;
  search?: string;
  country_code?: string;
  status?: string;
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

export interface VendorListApiResponse {
  data: VendorListItem[];
  pagination: Pagination;
}

export interface VendorBulkActionResult {
  message: string;
  count: number;
}
