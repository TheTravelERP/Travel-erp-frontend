// src/features/departure/departure.types.ts

export const DEPARTURE_STATUSES = [
  "Draft", "Open", "Closed", "Departed", "Completed", "Cancelled",
] as const;
export type DepartureStatus = (typeof DEPARTURE_STATUSES)[number];

export interface DepartureFormInput {
  pkg_uuid: string;
  sales_executive_uuid?: string;
  departure_name: string;
  departure_date: string;
  return_date?: string;
  status?: string;
  total_seats?: number;
  minimum_pax?: number;
  maximum_pax?: number;
  waitlist_seats?: number;
  remarks?: string;
  internal_notes?: string;
  is_active?: boolean;
  // Optional visibility restriction — which branches may sell this
  // departure. Empty/undefined = unrestricted (every branch can sell it).
  allowed_branch_uuids?: string[];
}

export interface DepartureDetail extends DepartureFormInput {
  uuid: string;
  departure_code: string;
  pkg_name?: string;
  pkg_code?: string;
  sales_executive_name?: string;
  duration_days?: number | null;
  confirmed_pax?: number;
  available_seats?: number;
  total_bookings?: number;
  version_no: number;
  created_at: string;
}

export interface DepartureListItem {
  uuid: string;
  departure_code: string;
  departure_name: string;
  pkg_uuid?: string;
  pkg_name?: string;
  pkg_code?: string;
  departure_date: string;
  return_date?: string;
  duration_days?: number | null;
  status: string;
  total_seats: number;
  is_active: boolean;
  created_at: string;
}

export interface GetDeparturesParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  pkg_uuid?: string;
  from_date?: string;
  to_date?: string;
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

export interface DepartureListApiResponse {
  data: DepartureListItem[];
  pagination: Pagination;
}

export interface DepartureBulkActionResult {
  message: string;
  count: number;
}

export interface DepartureSummary {
  uuid: string;
  departure_code: string;
  departure_name: string;
  pkg_name?: string;
  pkg_code?: string;
  departure_date: string;
  return_date?: string;
  duration_days?: number | null;
  status: string;
  total_seats: number;
  minimum_pax?: number;
  maximum_pax?: number;
  waitlist_seats: number;
  confirmed_pax: number;
  available_seats: number;
  completion_percent: number;
  total_bookings: number;
  total_travellers: number;
  pax_adult: number;
  pax_child: number;
  pax_infant: number;
  booking_status_counts: Record<string, number>;
  revenue: number;
}

export interface DepartureServiceSummaryItem {
  service_type: string;
  booking_count: number;
  traveller_count: number;
  status_counts: Record<string, number>;
}

export interface DeparturePaymentItem {
  booking_uuid: string;
  booking_no: string;
  customer_name?: string;
  status: string;
  net_amount: number;
}

export interface DepartureBranchBreakdownItem {
  branch_uuid: string;
  branch_code: string;
  branch_name: string;
  total_bookings: number;
  total_travellers: number;
  pax_adult: number;
  pax_child: number;
  pax_infant: number;
  revenue: number;
}
