// src/features/booking/bookingService.types.ts

export const BOOKING_SERVICE_TYPES = [
  "Package", "Hotel", "Flight", "Visa", "Transport", "Insurance", "Guide",
  "Activity", "Cruise", "Train", "Bus", "Transfer", "Miscellaneous",
  "Manual Charge", "Discount",
] as const;

export const BOOKING_SERVICE_STATUSES = [
  "Pending", "Confirmed", "Completed", "Cancelled",
] as const;

// Per-service-type structured fields, shown only for the matching
// service_type — the whole dynamic-fields mechanism, no separate modules.
export interface HotelServiceDetails {
  hotel_name?: string;
  room_type?: string;
}
export interface FlightServiceDetails {
  airline?: string;
  flight_number?: string;
  pnr?: string;
  ticket_number?: string;
  seat?: string;
  meal?: string;
}
export interface VisaServiceDetails {
  visa_number?: string;
  embassy?: string;
  visa_status?: string;
}
export interface TransportServiceDetails {
  vehicle?: string;
  driver?: string;
  pickup_location?: string;
  drop_location?: string;
}
export interface InsuranceServiceDetails {
  provider?: string;
  policy_number?: string;
}
export interface GuideServiceDetails {
  guide_name?: string;
  contact?: string;
  language?: string;
}
export interface ActivityServiceDetails {
  activity_name?: string;
}

export interface BookingServiceLineFormInput {
  service_type: string;
  vendor_uuid?: string | null;
  supplier_reference?: string;
  description?: string;
  travel_date?: string;
  start_date?: string;
  end_date?: string;
  quantity: number;
  unit?: string;
  cost_price: number;
  selling_price: number;
  discount_percent?: number;
  discount_amount?: number;
  status: string;
  confirmation_number?: string;
  voucher_number?: string;
  remarks?: string;
  type_details?: Record<string, any> | null;
}

export interface BookingServiceLineDetail extends BookingServiceLineFormInput {
  uuid: string;
  booking_uuid: string;
  line_no: number;
  provenance: string;
  taxable_amount: number;
  tax_percent: number;
  tax_amount: number;
  gross_amount: number;
  net_amount: number;
  markup_percent: number;
  margin_amount: number;
  currency_code?: string | null;
  vendor_name?: string | null;
  version_no: number;
}
