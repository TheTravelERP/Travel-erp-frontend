// src/features/departure/departure.api.ts
import api from "../../services/api";

import type {
  DepartureDetail,
  DepartureFormInput,
  DepartureListApiResponse,
  GetDeparturesParams,
  DepartureBulkActionResult,
  DepartureSummary,
  DepartureBranchBreakdownItem,
} from "./departure.types";
import type { BookingListApiResponse } from "../booking/booking.types";
import type { TravellerListResponse } from "../booking/traveller.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
}

export async function createDeparture(payload: DepartureFormInput) {
  const { data } = await api.post("/api/v1/departures", cleanPayload(payload));
  return data;
}

export async function getDepartures(
  params: GetDeparturesParams,
  signal?: AbortSignal,
): Promise<DepartureListApiResponse> {
  const { data } = await api.get<DepartureListApiResponse>("/api/v1/departures", {
    params: cleanParams(params),
    signal,
  });
  return data;
}

export async function getDepartureByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<DepartureDetail> {
  const { data } = await api.get<DepartureDetail>(`/api/v1/departures/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateDepartureByUuid(
  uuid: string,
  payload: DepartureFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/departures/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteDepartureByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/departures/${uuid}`);
  return data;
}

export async function restoreDepartureByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/departures/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteDepartures(uuids: string[]): Promise<DepartureBulkActionResult> {
  const { data } = await api.post<DepartureBulkActionResult>("/api/v1/departures/bulk-delete", {
    departure_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreDepartures(uuids: string[]): Promise<DepartureBulkActionResult> {
  const { data } = await api.post<DepartureBulkActionResult>("/api/v1/departures/bulk-restore", {
    departure_uuids: uuids,
  });
  return data;
}

import type { ImportResult } from "../../components/common/ImportResultDialog";

export async function importDeparturesFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ImportResult>("/api/v1/departures/import", formData);
  return data;
}

// ---------- workspace tabs ----------

export async function getDepartureSummary(uuid: string): Promise<DepartureSummary> {
  const { data } = await api.get<DepartureSummary>(`/api/v1/departures/${uuid}/summary`);
  return data;
}

export async function getDepartureBookings(
  uuid: string,
  params: { page?: number; page_size?: number; search?: string; status?: string; sort_by?: string; sort_order?: "asc" | "desc" } = {},
  signal?: AbortSignal,
): Promise<BookingListApiResponse> {
  const { data } = await api.get<BookingListApiResponse>(`/api/v1/departures/${uuid}/bookings`, {
    params: cleanParams(params),
    signal,
  });
  return data;
}

export async function getDepartureTravellers(
  uuid: string,
  params: { page?: number; page_size?: number; search?: string; sort_by?: string; sort_order?: "asc" | "desc" } = {},
  signal?: AbortSignal,
): Promise<TravellerListResponse> {
  const { data } = await api.get<TravellerListResponse>(`/api/v1/departures/${uuid}/travellers`, {
    params: cleanParams(params),
    signal,
  });
  return data;
}

export interface DepartureServicesApiResponse {
  data: {
    service_type: string;
    booking_count: number;
    traveller_count: number;
    status_counts: Record<string, number>;
  }[];
}

export async function getDepartureServices(uuid: string): Promise<DepartureServicesApiResponse> {
  const { data } = await api.get<DepartureServicesApiResponse>(`/api/v1/departures/${uuid}/services`);
  return data;
}

export interface DeparturePaymentsApiResponse {
  data: {
    booking_uuid: string;
    booking_no: string;
    customer_name?: string;
    status: string;
    net_amount: number;
  }[];
  total_net_amount: number;
}

export async function getDeparturePayments(uuid: string): Promise<DeparturePaymentsApiResponse> {
  const { data } = await api.get<DeparturePaymentsApiResponse>(`/api/v1/departures/${uuid}/payments`);
  return data;
}

export interface DepartureBranchBreakdownApiResponse {
  data: DepartureBranchBreakdownItem[];
}

export async function getDepartureBranchBreakdown(uuid: string): Promise<DepartureBranchBreakdownApiResponse> {
  const { data } = await api.get<DepartureBranchBreakdownApiResponse>(`/api/v1/departures/${uuid}/branches`);
  return data;
}
