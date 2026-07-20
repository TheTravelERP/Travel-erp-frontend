// src/features/customer/customer.types.ts

/* ==========================================================
   FORM
========================================================== */

export interface CustomerFormInput {
  name: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  dob?: string;
  nationality?: string;

  passport_no?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  passport_issue_country?: string;

  email?: string;
  mobile: string;

  gstin?: string;
  billing_address?: string;
}

/* ==========================================================
   DETAIL (single customer, as returned by GET /customers/:uuid)
========================================================== */

export interface CustomerDetail extends CustomerFormInput {
  uuid: string;
  version_no: number;
  created_at: string;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface CustomerListItem {
  uuid: string;
  name: string;
  mobile: string;
  email?: string;
  nationality?: string;
  passport_no?: string;
  passport_expiry_date?: string;
  created_at: string;
}

/* ==========================================================
   LIST FILTERS
========================================================== */

export interface GetCustomersParams {
  page?: number;
  page_size?: number;

  search?: string;

  nationality?: string;
  gender?: string;

  is_deleted?: boolean;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/* ==========================================================
   PAGINATION
========================================================== */

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

/* ==========================================================
   API RESPONSE
========================================================== */

export interface CustomerListApiResponse {
  data: CustomerListItem[];
  pagination: Pagination;
}
