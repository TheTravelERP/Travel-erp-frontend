// src/features/package/packageDetail/packageDetail.types.ts

/* ==========================================================
   FORM
========================================================== */

export interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
}

export interface PackageDetailFormInput {
  title: string;
  overview?: string;
  itinerary?: ItineraryDay[];
  inclusions?: string;
  exclusions?: string;
  terms_conditions?: string;
  payment_policy?: string;
  cancellation_policy?: string;
  important_notes?: string;
  brochure_path?: string;
  is_active?: boolean;
}

/* ==========================================================
   DETAIL (single package detail, as returned by GET /package-details/:uuid)
========================================================== */

export interface PackageDetailDetail extends PackageDetailFormInput {
  uuid: string;
  version_no: number;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface PackageDetailListItem {
  uuid: string;
  title: string;
  is_active: boolean;
  created_at: string;
}

/* ==========================================================
   LIST FILTERS / PAGINATION
========================================================== */

export interface GetPackageDetailsParams {
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

export interface PackageDetailListApiResponse {
  data: PackageDetailListItem[];
  pagination: Pagination;
}

export interface PackageDetailBulkActionResult {
  message: string;
  count: number;
}
