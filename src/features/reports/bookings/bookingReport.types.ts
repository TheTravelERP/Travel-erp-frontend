// src/features/reports/bookings/bookingReport.types.ts

export interface BookingReportRow {
  uuid: string;
  booking_no: string;
  status: string;
  business_type: string;
  // The primary traveler — every booking has exactly one Customer; no
  // separate is_primary flag exists on Traveller, and none is needed here.
  customer_name?: string | null;
  package_name?: string | null;
  departure_code?: string | null;
  booking_date: string;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  currency_code: string;
  net_amount: number;
  // Actual Traveller rows captured so far — not the planned pax_adult/
  // pax_child/pax_infant counts, which can differ from what's actually on file.
  traveller_count: number;
}

export interface BookingReportParams {
  page?: number;
  page_size?: number;
  search?: string;
  departure_uuid?: string;
  package_uuid?: string;
  status?: string;
  business_type?: string;
  from_date?: string;
  to_date?: string;
  travel_from_date?: string;
  travel_to_date?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface BookingReportApiResponse {
  data: BookingReportRow[];
  pagination: Pagination;
}
