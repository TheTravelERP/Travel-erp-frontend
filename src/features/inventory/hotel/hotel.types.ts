// src/features/inventory/hotel/hotel.types.ts

/* ==========================================================
   FORM
========================================================== */

export interface HotelFormInput {
  hotel_code: string;
  hotel_name: string;
  hotel_group?: string;
  star_rating?: number;

  city?: string;
  state?: string;
  country?: string;
  address?: string;

  latitude?: number;
  longitude?: number;
  google_map?: string;
  distance_from_haram?: number;

  phone?: string;
  email?: string;
  website?: string;

  check_in_time?: string;
  check_out_time?: string;

  contact_person?: string;
  remarks?: string;
  is_active?: boolean;
}

/* ==========================================================
   DETAIL (single hotel, as returned by GET /hotels/:uuid)
========================================================== */

export interface HotelDetail extends HotelFormInput {
  uuid: string;
  version_no: number;
}

/* ==========================================================
   LIST ITEM
========================================================== */

export interface HotelListItem {
  uuid: string;
  hotel_code: string;
  hotel_name: string;
  hotel_group?: string;
  star_rating?: number;
  city?: string;
  country?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

/* ==========================================================
   LIST FILTERS / PAGINATION
========================================================== */

export interface GetHotelsParams {
  page?: number;
  page_size?: number;
  search?: string;
  city?: string;
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

export interface HotelListApiResponse {
  data: HotelListItem[];
  pagination: Pagination;
}

export interface HotelBulkActionResult {
  message: string;
  count: number;
}
