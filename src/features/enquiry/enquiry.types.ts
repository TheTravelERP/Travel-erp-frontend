// src/features/enquiry/enquiry.types.ts


/* ==========================================================
   FORM
========================================================== */

export interface EnquiryFormInput {
  cust_id?: number | null;

  customer_name?: string;
  customer_mobile?: string;
  customer_email?: string;

  pkg_id?: number |null;
  package_name?: string;

  pax_count: number;

  lead_source: string;
  enquiry_priority: string;
  conversion_status: string;

  description?: string;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface EnquiryListItem {
  id: number;

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