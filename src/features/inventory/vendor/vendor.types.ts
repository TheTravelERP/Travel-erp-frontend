// src/features/inventory/vendor/vendor.types.ts

export interface VendorFormInput {
  vendor_code: string;
  vendor_name: string;
  vendor_type?: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  payment_terms?: string;
  remarks?: string;
  status?: string;
  is_active?: boolean;
}

export interface VendorDetail extends VendorFormInput {
  uuid: string;
  version_no: number;
}

export interface VendorListItem {
  uuid: string;
  vendor_code: string;
  vendor_name: string;
  vendor_type?: string;
  contact_person?: string;
  mobile?: string;
  city?: string;
  status?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetVendorsParams {
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

export interface VendorListApiResponse {
  data: VendorListItem[];
  pagination: Pagination;
}

export interface VendorBulkActionResult {
  message: string;
  count: number;
}
