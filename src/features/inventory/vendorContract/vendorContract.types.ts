// src/features/inventory/vendorContract/vendorContract.types.ts

export interface VendorContractFormInput {
  vendor_uuid: string;
  contract_code: string;
  contract_name: string;
  contract_type?: string;
  reference_no?: string;
  valid_from?: string;
  valid_to?: string;
  currency_code?: string;
  payment_terms?: string;
  remarks?: string;
  status?: string;
  is_active?: boolean;
}

export interface VendorContractDetail extends VendorContractFormInput {
  uuid: string;
  vendor_name?: string;
  vendor_code?: string;
  version_no: number;
}

export interface VendorContractListItem {
  uuid: string;
  contract_code: string;
  contract_name: string;
  contract_type?: string;
  vendor_uuid?: string;
  vendor_name?: string;
  vendor_code?: string;
  valid_from?: string;
  valid_to?: string;
  status?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetVendorContractsParams {
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

export interface VendorContractListApiResponse {
  data: VendorContractListItem[];
  pagination: Pagination;
}

export interface VendorContractBulkActionResult {
  message: string;
  count: number;
}
