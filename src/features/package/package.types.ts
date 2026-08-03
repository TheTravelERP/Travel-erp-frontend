// src/features/package/package.types.ts

export type PackageStatus = "Draft" | "Published" | "Closed" | "Cancelled" | "Completed";

/* ==========================================================
   FORM
========================================================== */

export interface PackageFormInput {
  package_type_uuid?: string | null;
  package_detail_uuid?: string | null;

  code: string;
  name: string;
  short_name?: string;

  status?: PackageStatus;

  departure_city?: string;
  arrival_city?: string;
  country?: string;

  departure_date?: string;
  return_date?: string;
  booking_start_date?: string;
  booking_end_date?: string;

  duration_days?: number;
  duration_nights?: number;

  minimum_pax?: number;
  maximum_pax?: number;

  total_seats?: number;
  booked_seats?: number;
  blocked_seats?: number;
  waitlist_seats?: number;

  currency_code: string;
  exchange_rate?: number;

  featured?: boolean;
  is_active?: boolean;

  // Optional visibility restriction — which branches may sell this
  // package. Empty/undefined = unrestricted (every branch can sell it).
  allowed_branch_uuids?: string[];
}

/* ==========================================================
   DETAIL (single package, as returned by GET /packages/:uuid)
========================================================== */

export interface PackageDetailResponse extends PackageFormInput {
  uuid: string;
  available_seats: number;
  version_no: number;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface PackageListItem {
  uuid: string;
  code: string;
  name: string;
  status: PackageStatus;
  departure_city?: string;
  departure_date?: string;
  total_seats: number;
  booked_seats: number;
  is_active: boolean;
  created_at: string;
}

/* ==========================================================
   LIST FILTERS / PAGINATION
========================================================== */

export interface GetPackagesParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  package_type_uuid?: string;
  from_date?: string;
  to_date?: string;
  is_active?: boolean;
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

export interface PackageListApiResponse {
  data: PackageListItem[];
  pagination: Pagination;
}

export interface PackageBulkActionResult {
  message: string;
  count: number;
}
