// src/features/reports/travelers/travelerReport.types.ts

export const PASSPORT_STATUSES = ["Valid", "Expiring Soon", "Expired", "Missing", "Unknown"] as const;
export type PassportStatus = (typeof PASSPORT_STATUSES)[number];

export interface TravelerReportRow {
  uuid: string;
  booking_uuid: string;
  booking_no?: string | null;
  traveller_type: string;
  full_name: string;
  age?: number | null;
  nationality?: string | null;
  passport_no?: string | null;
  // Computed server-side (Traveller.passport_status) — never stored.
  passport_status?: string | null;
  visa_status?: string | null;
  status: string;
}

export interface TravelerReportParams {
  page?: number;
  page_size?: number;
  search?: string;
  departure_uuid?: string;
  traveller_type?: string;
  nationality?: string;
  visa_status?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface TravelerReportApiResponse {
  data: TravelerReportRow[];
  pagination: Pagination;
}
