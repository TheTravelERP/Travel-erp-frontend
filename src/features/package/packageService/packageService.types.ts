// src/features/package/packageService/packageService.types.ts

/* ==========================================================
   FORM
========================================================== */

export interface PackageServiceFormInput {
  package_uuid: string;
  day_no?: number;
  service_order?: number;
  service_type: string;

  inventory_id?: number;
  hotel_id?: number;
  airline_id?: number;
  vendor_id?: number;

  description?: string;

  start_datetime?: string;
  end_datetime?: string;

  cost_price?: number;
  selling_price?: number;

  remarks?: string;
  is_active?: boolean;
}

/* ==========================================================
   DETAIL (single package service, as returned by GET /package-services/:uuid)
========================================================== */

export interface PackageServiceDetail extends PackageServiceFormInput {
  uuid: string;
  version_no: number;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface PackageServiceListItem {
  uuid: string;
  package_uuid: string;
  package_code?: string;
  package_name?: string;
  day_no: number;
  service_order: number;
  service_type: string;
  description?: string;
  start_datetime?: string;
  end_datetime?: string;
  cost_price: number;
  selling_price?: number;
  is_active: boolean;
  created_at: string;
}

/* ==========================================================
   LIST FILTERS / PAGINATION
========================================================== */

export interface GetPackageServicesParams {
  page?: number;
  page_size?: number;
  search?: string;
  package_uuid?: string;
  service_type?: string;
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

export interface PackageServiceListApiResponse {
  data: PackageServiceListItem[];
  pagination: Pagination;
}

export interface PackageServiceBulkActionResult {
  message: string;
  count: number;
}
