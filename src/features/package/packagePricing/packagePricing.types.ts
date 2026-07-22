// src/features/package/packagePricing/packagePricing.types.ts

/* ==========================================================
   FORM
========================================================== */

export interface PackagePricingFormInput {
  package_uuid: string;
  occupancy_type: string;
  passenger_type: string;
  price_category?: string;
  currency_code: string;
  price: number;
  effective_from: string;
  effective_to?: string;
  is_default?: boolean;
  is_active?: boolean;
}

/* ==========================================================
   DETAIL (single package pricing, as returned by GET /package-pricings/:uuid)
========================================================== */

export interface PackagePricingDetail extends PackagePricingFormInput {
  uuid: string;
  version_no: number;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface PackagePricingListItem {
  uuid: string;
  package_uuid: string;
  package_code?: string;
  package_name?: string;
  occupancy_type: string;
  passenger_type: string;
  price_category: string;
  currency_code: string;
  price: number;
  effective_from: string;
  effective_to?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

/* ==========================================================
   LIST FILTERS / PAGINATION
========================================================== */

export interface GetPackagePricingsParams {
  page?: number;
  page_size?: number;
  search?: string;
  package_uuid?: string;
  price_category?: string;
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

export interface PackagePricingListApiResponse {
  data: PackagePricingListItem[];
  pagination: Pagination;
}

export interface PackagePricingBulkActionResult {
  message: string;
  count: number;
}
