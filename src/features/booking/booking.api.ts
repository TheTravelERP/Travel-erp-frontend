// src/features/booking/booking.api.ts
import api from "../../services/api";
import type {
  BookingBulkActionResult,
  BookingDetail,
  BookingFormInput,
  BookingListApiResponse,
  GetBookingsParams,
} from "./booking.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createBooking(payload: BookingFormInput) {
  const { data } = await api.post("/api/v1/bookings", cleanPayload(payload));
  return data;
}

export async function getBookingsList(
  params: GetBookingsParams,
  signal?: AbortSignal,
): Promise<BookingListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
  const { data } = await api.get<BookingListApiResponse>("/api/v1/bookings", { params: cleanParams, signal });
  return data;
}

export async function getBookingByUuid(uuid: string): Promise<BookingDetail> {
  const { data } = await api.get<BookingDetail>(`/api/v1/bookings/${uuid}`);
  return data;
}

export async function updateBookingByUuid(uuid: string, payload: BookingFormInput & { version_no: number }) {
  const { data } = await api.put(`/api/v1/bookings/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteBookingByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/bookings/${uuid}`);
  return data;
}

export async function restoreBookingByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/bookings/${uuid}/restore`);
  return data;
}

export async function bulkDeleteBookings(booking_uuids: string[]): Promise<BookingBulkActionResult> {
  const { data } = await api.post("/api/v1/bookings/bulk-delete", { booking_uuids });
  return data;
}

export async function bulkRestoreBookings(booking_uuids: string[]): Promise<BookingBulkActionResult> {
  const { data } = await api.post("/api/v1/bookings/bulk-restore", { booking_uuids });
  return data;
}

export async function confirmBooking(uuid: string): Promise<BookingDetail> {
  const { data } = await api.post(`/api/v1/bookings/${uuid}/confirm`);
  return data;
}

export async function cancelBooking(uuid: string, cancel_reason?: string): Promise<BookingDetail> {
  const { data } = await api.post(`/api/v1/bookings/${uuid}/cancel`, { cancel_reason });
  return data;
}

export interface BookingTimelineItem {
  uuid: string;
  event_type: string;
  event_description?: string | null;
  actor_name?: string | null;
  event_at: string;
}

export async function getBookingTimeline(uuid: string): Promise<BookingTimelineItem[]> {
  const { data } = await api.get<{ data: BookingTimelineItem[] }>(`/api/v1/bookings/${uuid}/timeline`);
  return data.data;
}

function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
}

export function bookingPdfDownloadUrl(uuid: string): string {
  return `${apiBaseUrl()}/api/v1/bookings/${uuid}/pdf`;
}

export function bookingConfirmationPdfDownloadUrl(uuid: string): string {
  return `${apiBaseUrl()}/api/v1/bookings/${uuid}/confirmation-pdf`;
}

export function bookingServiceVoucherPdfDownloadUrl(bookingUuid: string, lineUuid: string): string {
  return `${apiBaseUrl()}/api/v1/bookings/${bookingUuid}/services/${lineUuid}/voucher-pdf`;
}
