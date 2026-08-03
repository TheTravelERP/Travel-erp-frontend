// src/features/booking/bookingService.api.ts
import api from "../../services/api";
import type { BookingServiceLineDetail, BookingServiceLineFormInput } from "./bookingService.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function getBookingServiceLines(bookingUuid: string): Promise<BookingServiceLineDetail[]> {
  const { data } = await api.get<{ data: BookingServiceLineDetail[] }>(`/api/v1/bookings/${bookingUuid}/services`);
  return data.data;
}

export async function createBookingServiceLine(bookingUuid: string, payload: BookingServiceLineFormInput) {
  const { data } = await api.post(`/api/v1/bookings/${bookingUuid}/services`, cleanPayload(payload));
  return data;
}

export async function updateBookingServiceLine(
  bookingUuid: string, lineUuid: string, payload: BookingServiceLineFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/bookings/${bookingUuid}/services/${lineUuid}`, cleanPayload(payload));
  return data;
}

export async function deleteBookingServiceLine(bookingUuid: string, lineUuid: string) {
  const { data } = await api.delete(`/api/v1/bookings/${bookingUuid}/services/${lineUuid}`);
  return data;
}
