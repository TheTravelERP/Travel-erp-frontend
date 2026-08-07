// src/features/crm/quotation/quotation.types.ts

import type { DiscountType } from "./pricing";

export interface QuotationServiceLineInput {
  uuid?: string;
  service_type: string;
  vendor_uuid?: string | null;
  description?: string;
  day_no?: number | null;
  travel_date_from?: string;
  travel_date_to?: string;
  quantity: number;
  unit?: string;
  cost_price: number;
  selling_price: number;
  // Wire fields the backend actually consumes (discount_percent wins
  // whenever >0, discount_amount is the fallback) — derived from
  // discount_type/discount_value below at submit time, never edited
  // directly. See submitCleaned in QuotationForm.tsx.
  discount_percent?: number;
  discount_amount?: number;
  // UI-only pricing-engine fields (see pricing.ts) — stripped before
  // submit, mapped onto discount_percent/discount_amount instead.
  discount_type?: DiscountType;
  discount_value?: number;
  remarks?: string;
}

// Flat Package Pricing fallback — only sent when business_type is "Package"
// and the selected package has zero PackageService rows (see
// QuotationOccupancyGroups.tsx / resolve_package_pricing on the backend).
// LOCKED: each row is exactly one pricing rule — Occupancy Type + Passenger
// Type + Quantity — resolved 1:1 against PackagePricing.
export interface QuotationOccupancyGroupInput {
  occupancy_type: string;
  passenger_type: string;
  quantity: number;
  // Row-level commercial override of the resolved per-unit Package Price —
  // always the raw, undiscounted price; Package Pricing master data itself
  // is never modified by editing this, and discount below is never baked
  // into it. Defaults to the resolved price when absent.
  selling_price?: number;
  // Wire fields the backend actually stores (discount_percent wins
  // whenever >0, discount_amount is the fallback — same _compute_line_
  // amounts rule as service_lines) — derived from discount_type/
  // discount_value below at submit time, never edited directly. See
  // submitCleaned in QuotationForm.tsx.
  discount_percent?: number;
  discount_amount?: number;
  // Pricing-engine fields the row's inputs actually bind to.
  discount_type?: DiscountType;
  discount_value?: number;
}

export interface QuotationServiceLineDetail extends QuotationServiceLineInput {
  uuid: string;
  line_no: number;
  provenance: string;
  taxable_amount: number;
  tax_percent: number;
  tax_amount: number;
  gross_amount: number;
  net_amount: number;
  margin_amount: number;
  currency_code?: string | null;
  vendor_name?: string | null;
}

export interface QuotationFormInput {
  // Optional — when omitted, the backend auto-creates a minimal Enquiry
  // from cust_uuid + business_type + pax fields below (Direct Quotation).
  // When provided, cust_uuid is ignored (the backend resolves the customer
  // via the already-linked Enquiry instead).
  enquiry_uuid?: string;
  cust_uuid?: string | null;

  // Pre-filled from the enquiry's business_type when an enquiry is picked,
  // editable; required directly from the user otherwise.
  business_type: string;

  pkg_uuid?: string | null;
  // Header-level commercial value, independent of the Occupancy section —
  // never derived/updated from occupancy_groups. See quotation.schema.ts.
  pkg_count: number;
  quotation_date?: string;
  valid_until?: string;
  travel_date_from?: string;
  travel_date_to?: string;
  pax_adult: number;
  pax_child: number;
  pax_infant: number;
  currency_code: string;
  discount_percent?: number;
  discount_amount?: number;
  terms_conditions?: string;
  internal_notes?: string;
  customer_notes?: string;
  service_lines: QuotationServiceLineInput[];
  occupancy_groups?: QuotationOccupancyGroupInput[];
}

// Frozen at quotation-creation time from the source Package (see
// build_package_snapshot on the backend) — deliberately never re-read from
// the live Package/PackagePricing rows, so it stays accurate even after the
// source package is edited or deactivated (see snapshot independence).
export interface QuotationPackageSnapshot {
  pkg_code?: string | null;
  pkg_name?: string | null;
  departure_city?: string | null;
  arrival_city?: string | null;
  country?: string | null;
  departure_date?: string | null;
  return_date?: string | null;
  duration_days?: number | null;
  duration_nights?: number | null;
  currency_code?: string | null;
}

export interface QuotationDetail extends QuotationFormInput {
  uuid: string;
  quotation_no: string;
  revision_no: number;
  quotation_group_uuid?: string | null;
  is_current_version: boolean;
  status: string;
  branch_uuid?: string | null;
  enquiry_no?: string | null;
  cust_uuid?: string | null;
  customer_name?: string | null;
  agent_name?: string | null;
  package_snapshot?: QuotationPackageSnapshot | null;
  exchange_rate_used: number;
  gross_amount: number;
  taxable_amount: number;
  tax_amount: number;
  net_amount: number;
  total_cost_amount: number;
  total_margin_amount: number;
  margin_percent: number;
  markup_percent: number;
  round_off_amount: number;
  is_locked: boolean;
  booking_id?: number | null;
  version_no: number;
  service_lines: QuotationServiceLineDetail[];
  created_at: string;
}

export interface QuotationListItem {
  uuid: string;
  quotation_no: string;
  revision_no: number;
  quotation_group_uuid?: string | null;
  is_current_version: boolean;
  status: string;
  business_type: string;
  enquiry_uuid?: string | null;
  enquiry_no?: string | null;
  cust_uuid?: string | null;
  customer_name?: string | null;
  agent_name?: string | null;
  quotation_date: string;
  valid_until?: string | null;
  currency_code: string;
  net_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface QuotationVersionSummary {
  uuid: string;
  revision_no: number;
  status: string;
  is_current_version: boolean;
  net_amount: number;
  created_at: string;
}

export interface GetQuotationsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  enquiry_uuid?: string;
  cust_uuid?: string;
  from_date?: string;
  to_date?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface QuotationBulkActionResult {
  message: string;
  count: number;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface QuotationListApiResponse {
  data: QuotationListItem[];
  pagination: Pagination;
}
