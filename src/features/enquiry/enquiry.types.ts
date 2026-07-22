// src/features/enquiry/enquiry.types.ts


/* ==========================================================
   FORM
========================================================== */

export interface EnquiryFormInput {
  cust_uuid?: string | null;
  /** Which side of the New/Existing toggle is active — decides what actually gets submitted. */
  customer_mode?: 'new' | 'existing';

  customer_name?: string;
  customer_mobile?: string;
  customer_email?: string;

  pkg_uuid?: string | null;
  /** Which side of the Custom/Inventory toggle is active — decides what actually gets submitted. */
  package_mode?: 'custom' | 'existing';
  package_name?: string;

  pax_count: number;

  lead_source: string;
  enquiry_priority: string;
  conversion_status: string;

  description?: string;
}

/* ==========================================================
   DETAIL (single enquiry, as returned by GET /enquiries/:uuid)
========================================================== */

export interface EnquiryDetail extends EnquiryFormInput {
  uuid: string;
  enquiry_no: string;
  version_no: number;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface EnquiryListItem {
  uuid: string;

  enquiry_no: string;

  customer_name?: string;
  customer_mobile?: string;
  customer_email?: string;

  package_name?: string;

  pax_count: number;

  lead_source: string;
  enquiry_priority: string;
  conversion_status: string;

  created_at: string;
}

/* ==========================================================
   LIST FILTERS
========================================================== */

export interface GetEnquiriesParams {
  page?: number;
  page_size?: number;

  search?: string;

  enquiry_priority?: string;
  conversion_status?: string;

  lead_source?: string;

  from_date?: string;
  to_date?: string;
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

export interface EnquiryListApiResponse {
  data: EnquiryListItem[];
  pagination: Pagination;
}