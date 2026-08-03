// src/features/booking/traveller.api.ts
import api from "../../services/api";
import type { ImportResult } from "../../components/common/ImportResultDialog";
import type {
  TravellerBulkActionResult,
  TravellerDetail,
  TravellerFormInput,
  TravellerListParams,
  TravellerListResponse,
} from "./traveller.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function getTravellers(
  bookingUuid: string, params: TravellerListParams = {}, signal?: AbortSignal,
): Promise<TravellerListResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
  const { data } = await api.get<TravellerListResponse>(
    `/api/v1/bookings/${bookingUuid}/travellers`, { params: cleanParams, signal },
  );
  return data;
}

export async function getDeletedTravellers(
  bookingUuid: string, params: TravellerListParams = {}, signal?: AbortSignal,
): Promise<TravellerListResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
  const { data } = await api.get<TravellerListResponse>(
    `/api/v1/bookings/${bookingUuid}/travellers/trash`, { params: cleanParams, signal },
  );
  return data;
}

export async function createTraveller(bookingUuid: string, payload: TravellerFormInput) {
  const { data } = await api.post(`/api/v1/bookings/${bookingUuid}/travellers`, cleanPayload(payload));
  return data;
}

export async function createTravellerFromCustomer(bookingUuid: string) {
  const { data } = await api.post(`/api/v1/bookings/${bookingUuid}/travellers/from-customer`);
  return data;
}

export async function updateTraveller(
  bookingUuid: string, travellerUuid: string, payload: TravellerFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/bookings/${bookingUuid}/travellers/${travellerUuid}`, cleanPayload(payload));
  return data;
}

export async function deleteTraveller(bookingUuid: string, travellerUuid: string) {
  const { data } = await api.delete(`/api/v1/bookings/${bookingUuid}/travellers/${travellerUuid}`);
  return data;
}

export async function restoreTraveller(bookingUuid: string, travellerUuid: string) {
  const { data } = await api.put(`/api/v1/bookings/${bookingUuid}/travellers/${travellerUuid}/restore`);
  return data;
}

export async function bulkDeleteTravellers(bookingUuid: string, travellerUuids: string[]): Promise<TravellerBulkActionResult> {
  const { data } = await api.post(`/api/v1/bookings/${bookingUuid}/travellers/bulk-delete`, { traveller_uuids: travellerUuids });
  return data;
}

export async function bulkRestoreTravellers(bookingUuid: string, travellerUuids: string[]): Promise<TravellerBulkActionResult> {
  const { data } = await api.post(`/api/v1/bookings/${bookingUuid}/travellers/bulk-restore`, { traveller_uuids: travellerUuids });
  return data;
}

export async function importTravellersFromCsv(bookingUuid: string, file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ImportResult>(
    `/api/v1/bookings/${bookingUuid}/travellers/import`, formData, { withCredentials: true },
  );
  return data;
}

export function exportTravellersUrl(
  bookingUuid: string, format: "csv" | "excel" | "pdf", filters: TravellerListParams = {},
) {
  const params = new URLSearchParams();
  params.set("format", format);
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== "" && v !== undefined && v !== null) params.set(k, String(v));
  });
  return `${import.meta.env.VITE_API_BASE_URL}/api/v1/bookings/${bookingUuid}/travellers/export?${params}`;
}

export type { TravellerDetail };
