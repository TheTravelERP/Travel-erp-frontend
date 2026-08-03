// src/features/enquiry/enquiry.types.ts

import type { CustomerDetail } from "../customer/customer.types";
import type { PackageDetailResponse } from "../package/package.types";


/* ==========================================================
   FORM
========================================================== */

export interface EnquiryFormInput {
  cust_uuid?: string | null;
  /** Which side of the New/Existing toggle is active — decides what actually gets submitted. */
  customer_mode?: 'new' | 'existing';

  customer_name?: string;
  customer_mobile?: string;
  customer_alternate_mobile?: string;
  customer_email?: string;

  /** Analytical foundation — what this enquiry is fundamentally about. Package
   * is the only value where the package fields below are meaningful; for any
   * other business_type they stay null and the Package section never renders. */
  business_type: string;

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
  /** Read-only — powers the Follow-up module's Enquiry context card. */
  agent_name?: string | null;
  agent_uuid?: string | null;
  /** Read-only — server-resolved at creation, editable only via the
   * dedicated Assign Branch action, same convention as agent_uuid/agent_name. */
  branch_uuid?: string | null;
  branch_name?: string | null;
  followup_date?: string | null;
  /** Read-only — set by Mark Lost, cleared by Reopen. */
  lost_reason?: string | null;
  closed_at?: string | null;
  /** Read-only — powers the Quotation "Resolve Required Links" summary header. */
  created_at: string;
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

  business_type: string;
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
  is_active?: boolean;
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

/* ==========================================================
   LINK / CREATE CUSTOMER
========================================================== */

export interface EnquiryCustomerLinkResult {
  linked: boolean;
  /** True when a new Customer record was created; false when linked to an existing one. */
  created: boolean;
  customer: CustomerDetail;
}

/* ==========================================================
   LINK / CREATE PACKAGE
========================================================== */

export interface EnquiryPackageLinkResult {
  linked: boolean;
  /** True when a new Package record was created; false when linked to an existing one. */
  created: boolean;
  package: PackageDetailResponse;
}