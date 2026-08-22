// src/features/reports/bookings/bookingReport.api.ts
import api from "../../../services/api";
import type { BookingReportApiResponse, BookingReportParams } from "./bookingReport.types";

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
}

export async function getBookingReport(
  params: BookingReportParams,
  signal?: AbortSignal,
): Promise<BookingReportApiResponse> {
  const { data } = await api.get<BookingReportApiResponse>("/api/v1/reports/bookings", {
    params: cleanParams(params),
    signal,
  });
  return data;
}
