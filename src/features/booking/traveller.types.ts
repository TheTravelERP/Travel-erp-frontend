// src/features/booking/traveller.types.ts

export const TRAVELLER_TYPES = ["Adult", "Child", "Infant"] as const;
export type TravellerType = (typeof TRAVELLER_TYPES)[number];

export const TRAVELLER_STATUSES = ["Active", "Cancelled", "No Show"] as const;
export type TravellerStatus = (typeof TRAVELLER_STATUSES)[number];

export const ROOM_TYPE_PREFERENCES = ["Single", "Twin", "Triple", "Quad"] as const;
export type RoomTypePreference = (typeof ROOM_TYPE_PREFERENCES)[number];

export interface TravellerFormInput {
  customer_uuid?: string | null;
  traveller_type: string;
  title?: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  nationality?: string;
  passport_no?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  passport_issue_country?: string;
  passport_place_of_issue?: string;
  meal_preference?: string;
  seat_preference?: string;
  frequent_flyer_number?: string;
  wheelchair: boolean;
  medical_notes?: string;
  room_type_preference?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  remarks?: string;
  status?: string;
}

export interface TravellerDetail extends TravellerFormInput {
  uuid: string;
  booking_uuid: string;
  booking_no?: string | null;
  full_name: string;
  age?: number | null;
  visa_status?: string | null;
  status: string;
  version_no: number;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface TravellerListResponse {
  data: TravellerDetail[];
  pagination: PaginationMeta;
}

export interface TravellerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  traveller_type?: string;
  nationality?: string;
  status?: string;
  visa_status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface TravellerBulkActionResult {
  message: string;
  count: number;
}
