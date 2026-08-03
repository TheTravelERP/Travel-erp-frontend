// src/features/booking/bookingReminder.api.ts
import api from "../../services/api";
import type { BookingReminderDetail, BookingReminderFormInput } from "./bookingReminder.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function getBookingReminders(bookingUuid: string): Promise<BookingReminderDetail[]> {
  const { data } = await api.get<{ data: BookingReminderDetail[] }>(`/api/v1/bookings/${bookingUuid}/reminders`);
  return data.data;
}

export async function createBookingReminder(bookingUuid: string, payload: BookingReminderFormInput) {
  const { data } = await api.post(`/api/v1/bookings/${bookingUuid}/reminders`, cleanPayload(payload));
  return data;
}
