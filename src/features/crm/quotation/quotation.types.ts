// src/features/crm/quotation/quotation.types.ts

import type { DiscountType } from "./pricing";

// Rule 33 pure-agent disbursement test (Tax & Pricing Architecture section 5,
// layer 3's tax_context.disbursement fields, layer 4's UI for them). Every
// condition must be explicitly true for the gate to pass — see
// disbursement_test_passes() on the backend.
export interface QuotationDisbursementConditions {
  pure_agent_for_payment?: boolean;
  third_party_contract_with_recipient?: boolean;
  recipient_liable_to_pay?: boolean;
  recipient_authorized_payment?: boolean;
  amount_shown_separately?: boolean;
  no_markup_recovered?: boolean;
  additional_to_own_service?: boolean;
}

// Tax-only line data with no other authoritative column (the tax_context
// rule, section 2) — a free-form bag the resolver reads specific keys from
// depending on the line's service_type/treatment, and which the backend
// also writes resolved_* metadata into after saving (see
// QuotationServiceLineDetail.tax_context below).
export interface QuotationLineTaxContext {
  basic_fare?: number;
  route_type?: "domestic" | "international";
  property_state?: string;
  commission_amount?: number;
  gross_exchange_amount?: number;
  rbi_reference_rate?: number;
  actual_rate?: number;
  currency_units?: number;
  reverse_charge_eligible?: boolean;
  disbursement?: QuotationDisbursementConditions;
  // Ad-Hoc / Quick Quotation Tax Source (Layer 3A/3B) — an explicit,
  // user-supplied classification candidate for a line with no master or
  // org-level configuration fact available. Only ever "standard_ad_valorem"
  // | "agent_deemed_value" (the same two values AirlineMaster.default_tax_
  // treatment already accepts) — never a shortcut around the resolver, and
  // never consulted at all while a master/config value already resolved
  // something (see classify_tax_treatment() on the backend).
  manual_tax_treatment?: string;
  // Written by the backend after resolution — read-only from the UI's side.
  resolved_treatment?: string;
  resolved_place_of_supply?: string;
  resolved_tax_code?: string;
  // "master" | "localization_profile" | "manual" | absent (the
  // unconditional-always-standard service types and reverse_charge, where
  // none of the three would be an honest label — see Layer 3A's report).
  resolved_treatment_source?: string;
  disbursement_test_result?: "passed" | "failed";
}

export interface QuotationServiceLineInput {
  uuid?: string;
  service_type: string;
  vendor_uuid?: string | null;
  // Master/Vendor/Inventory review: direct product-identity bridge, decoupled
  // from InventoryStock/sourcing — for a Flight line, this is how
  // classify_tax_treatment() reaches AirlineMaster.default_tax_treatment;
  // for a Hotel line, how resolve_place_of_supply() reaches HotelMaster
  // .state. See classify_tax_treatment()/resolve_place_of_supply() on the
  // backend. Never required to save a line.
  airline_uuid?: string | null;
  hotel_uuid?: string | null;
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
  tax_context?: QuotationLineTaxContext | null;
  // Flags this line as a Rule 33 pure-agent disbursement candidate — see
  // the Disbursement panel in QuotationForm.tsx. Opt-in, defaults false.
  disbursement_candidate?: boolean;
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

// One itemized component within a line's tax_breakdown — tax_name is
// free-text org-configured data (LocalizationProfileTaxComponent.tax_name),
// never translated/relabeled by the UI, unlike tax_type (a fixed central/
// state/integrated/other bucket).
export interface QuotationTaxBreakdownItem {
  tax_name: string;
  tax_percent: number;
  tax_amount: number;
  tax_type?: string | null;
}

export interface QuotationServiceLineDetail extends QuotationServiceLineInput {
  uuid: string;
  line_no: number;
  provenance: string;
  // 'MASTER_DRIVEN' | 'AD_HOC' — read-only, server-derived (Quotation Line
  // Foundation, Layer 1). Whether this line's identity is backed by a
  // product master (Airline/Hotel/Package) or was entered directly with no
  // master required.
  line_source: string;
  taxable_amount: number;
  tax_percent: number;
  tax_amount: number;
  tax_breakdown?: QuotationTaxBreakdownItem[] | null;
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
  // Per-component breakout of tax_amount above, summed from every line's
  // own calculate_tax() result (Tax & Pricing Architecture section 2).
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  other_tax_total: number;
  // A separate, non-GST statutory track (section 7) — a review-only
  // candidate value, never wired into any charge/collection flow.
  // Nullable: pre-Layer-3 quotations have tcs_applicable=null.
  tcs_applicable?: boolean | null;
  tcs_rate_percent?: number | null;
  tcs_amount?: number | null;
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
