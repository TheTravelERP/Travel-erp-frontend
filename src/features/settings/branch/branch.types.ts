// src/features/settings/branch/branch.types.ts

export interface BranchFormInput {
  branch_code: string;
  branch_name: string;
  legal_name?: string;
  currency_code: string;
  phone?: string;
  email?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  timezone?: string;
  remarks?: string;
  is_active?: boolean;
}

export interface BranchDetail extends BranchFormInput {
  uuid: string;
  is_head_office: boolean;
  version_no: number;
}

export interface BranchListItem {
  uuid: string;
  branch_code: string;
  branch_name: string;
  is_head_office: boolean;
  currency_code: string;
  city?: string;
  country?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetBranchesParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_deleted?: boolean;
  is_active?: boolean;
  is_head_office?: boolean;
  country?: string;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface BranchListApiResponse {
  data: BranchListItem[];
  pagination: Pagination;
}

export interface BranchBulkActionResult {
  message: string;
  count: number;
}
