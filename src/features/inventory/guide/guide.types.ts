// src/features/inventory/guide/guide.types.ts

export interface GuideFormInput {
  guide_name: string;
  mobile?: string;
  email?: string;
  languages?: string;
  license_no?: string;
  experience_years?: number;
  remarks?: string;
  is_active?: boolean;
}

export interface GuideDetail extends GuideFormInput {
  uuid: string;
  version_no: number;
}

export interface GuideListItem {
  uuid: string;
  guide_name: string;
  mobile?: string;
  languages?: string;
  experience_years?: number;
  is_active: boolean;
  created_at: string;
}

export interface GetGuidesParams {
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

export interface GuideListApiResponse {
  data: GuideListItem[];
  pagination: Pagination;
}

export interface GuideBulkActionResult {
  message: string;
  count: number;
}
