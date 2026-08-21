// src/features/inventory/vendor/vendor.types.ts

export interface VendorContactInput {
  uuid?: string;
  contact_type: string;
  contact_name: string;
  phone?: string;
  email?: string;
}

export interface VendorFormInput {
  vendor_code: string;
  vendor_name: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;

  physical_address?: string;
  physical_city?: string;
  physical_country_code?: string;
  physical_state_province_code?: string;
  physical_pincode?: string;

  mailing_address?: string;
  mailing_city?: string;
  mailing_country_code?: string;
  mailing_state_province_code?: string;
  mailing_pincode?: string;

  default_currency_code?: string;

  payment_terms?: string;
  bank_name?: string;
  bank_branch?: string;
  account_holder_name?: string;
  account_number?: string;
  account_type?: string;
  ifsc_code?: string;
  swift_code?: string;
  remarks?: string;
  status?: string;
  is_active?: boolean;

  contacts: VendorContactInput[];
}

export interface VendorDetail extends VendorFormInput {
  uuid: string;
  physical_country_name?: string;
  physical_state_province_name?: string;
  mailing_country_name?: string;
  mailing_state_province_name?: string;
  default_currency_name?: string;
  version_no: number;
}

export interface VendorListItem {
  uuid: string;
  vendor_code: string;
  vendor_name: string;
  contact_person?: string;
  mobile?: string;
  email?: string;
  physical_city?: string;
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
