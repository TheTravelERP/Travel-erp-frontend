// src/features/package/packageType/packageType.types.ts

/* ==========================================================
   FORM
========================================================== */

export interface PackageTypeFormInput {
  code: string;
  name: string;
  category: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

/* ==========================================================
   DETAIL (single package type, as returned by GET /package-types/:uuid)
========================================================== */

export interface PackageTypeDetail extends PackageTypeFormInput {
  uuid: string;
  version_no: number;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface PackageTypeListItem {
  uuid: string;
  code: string;
  name: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

/* ==========================================================
   LIST FILTERS / PAGINATION
========================================================== */

export interface GetPackageTypesParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
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

export interface PackageTypeListApiResponse {
  data: PackageTypeListItem[];
  pagination: Pagination;
}

export interface PackageTypeBulkActionResult {
  message: string;
  count: number;
}
