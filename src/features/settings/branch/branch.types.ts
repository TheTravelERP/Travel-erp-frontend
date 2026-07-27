// src/features/settings/branch/branch.types.ts

export interface BranchFormInput {
  branch_code: string;
  branch_name: string;
  legal_name?: string;
  // Optional — omit to inherit the org's own Localization Profile.
  localization_profile_uuid?: string;
  tax_registration_uuid?: string;
  contact_person_name?: string;
  manager_uuid?: string;
  office_phone?: string;
  emergency_phone?: string;
  whatsapp_number?: string;
  email?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  working_from?: string;
  working_to?: string;
  remarks?: string;
  is_active?: boolean;
}

export interface BranchDetail extends BranchFormInput {
  uuid: string;
  is_head_office: boolean;
  version_no: number;
  // Response-only, derived from the linked profile.
  currency_code?: string;
  timezone?: string;
  // Response-only, derived from the linked manager.
  manager_name?: string;
  manager_email?: string;
}

export interface BranchListItem {
  uuid: string;
  branch_code: string;
  branch_name: string;
  is_head_office: boolean;
  currency_code?: string;
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
