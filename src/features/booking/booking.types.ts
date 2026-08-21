// src/features/booking/booking.types.ts

export const BOOKING_STATUSES = [
  "Draft", "Confirmed", "Partially Confirmed", "Travel Started",
  "Completed", "Cancelled", "Closed",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface BookingFormInput {
  enquiry_uuid?: string | null;
  // Only used when enquiry_uuid is unset — resolved directly to a real
  // Customer via BookingCustomerPanel's search-or-create-new UI (same
  // pattern as Quotation's QuotationCustomerPanel), never deferred/inline.
  cust_uuid: string | null;
  // Pre-filled from the linked Enquiry's business_type when enquiry_uuid is
  // set, editable. Required directly from the user for a fully Direct
  // Booking (no enquiry_uuid at all) — same mandatory-with-default rule as
  // Enquiry/Quotation.
  business_type: string;
  pkg_uuid?: string | null;
  // Header-level commercial value, inherited from the source Quotation at
  // conversion (or entered directly for a Direct Booking) — independent of
  // anything else.
  pkg_count: number;
  departure_uuid?: string | null;
  agent_uuid?: string | null;
  booking_date?: string;
  travel_start_date?: string;
  travel_end_date?: string;
  pax_adult: number;
  pax_child: number;
  pax_infant: number;
  currency_code: string;
  reference?: string;
  internal_notes?: string;
  customer_notes?: string;
}

export interface BookingDetail extends BookingFormInput {
  uuid: string;
  booking_no: string;
  status: BookingStatus;
  branch_uuid?: string | null;
  departure_uuid?: string | null;
  package_snapshot?: { pkg_code?: string; pkg_name?: string; is_domestic?: boolean; [key: string]: any } | null;
  enquiry_no?: string | null;
  lead_source?: string | null;
  quotation_uuid?: string | null;
  quotation_no?: string | null;
  cust_uuid: string;
  customer_name?: string | null;
  agent_name?: string | null;
  exchange_rate_used: number;
  base_currency_code?: string | null;
  gross_amount: number;
  discount_amount: number;
  taxable_amount: number;
  tax_amount: number;
  net_amount: number;
  total_cost_amount: number;
  total_margin_amount: number;
  margin_percent: number;
  markup_percent: number;
  round_off_amount: number;
  cancel_reason?: string | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  converted_at?: string | null;
  version_no: number;
  created_at: string;
}

export interface BookingListItem {
  uuid: string;
  booking_no: string;
  status: BookingStatus;
  business_type: string;
  enquiry_uuid?: string | null;
  enquiry_no?: string | null;
  quotation_uuid?: string | null;
  quotation_no?: string | null;
  cust_uuid?: string | null;
  customer_name?: string | null;
  agent_name?: string | null;
  booking_date: string;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  currency_code: string;
  net_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface GetBookingsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  business_type?: string;
  enquiry_uuid?: string;
  cust_uuid?: string;
  departure_uuid?: string;
  from_date?: string;
  travel_from_date?: string;
  travel_to_date?: string;
  to_date?: string;
  is_active?: boolean;
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

export interface BookingListApiResponse {
  data: BookingListItem[];
  pagination: Pagination;
}

export interface BookingBulkActionResult {
  message: string;
  count: number;
}
