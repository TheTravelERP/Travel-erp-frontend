// src/features/crm/quotation/quotation.types.ts

export const SERVICE_TYPES = [
  "Package", "Hotel", "Flight", "Visa", "Transport", "Insurance", "Ziyarat",
  "Guide", "Activity", "Cruise", "Misc", "Manual Charge", "Discount",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

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
  discount_percent?: number;
  discount_amount?: number;
  remarks?: string;
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
  enquiry_uuid: string;
  pkg_uuid?: string | null;
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
  from_date?: string;
  to_date?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
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
