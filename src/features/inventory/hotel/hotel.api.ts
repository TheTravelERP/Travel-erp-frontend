// src/features/inventory/hotel/hotel.api.ts
import api from "../../../services/api";

import type {
  HotelDetail,
  HotelFormInput,
  HotelListApiResponse,
  GetHotelsParams,
  HotelBulkActionResult,
} from "./hotel.types";

// Empty-string optional fields (untouched inputs) are not valid values for
// FastAPI's Optional[...] fields — strip them before sending.
function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createHotel(payload: HotelFormInput) {
  const { data } = await api.post("/api/v1/hotels", cleanPayload(payload));
  return data;
}

export async function getHotels(
  params: GetHotelsParams,
  signal?: AbortSignal,
): Promise<HotelListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<HotelListApiResponse>("/api/v1/hotels", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getHotelByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<HotelDetail> {
  const { data } = await api.get<HotelDetail>(`/api/v1/hotels/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateHotelByUuid(
  uuid: string,
  payload: HotelFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/hotels/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteHotelByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/hotels/${uuid}`);
  return data;
}

export async function restoreHotelByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/hotels/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteHotels(uuids: string[]): Promise<HotelBulkActionResult> {
  const { data } = await api.post<HotelBulkActionResult>("/api/v1/hotels/bulk-delete", {
    hotel_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreHotels(uuids: string[]): Promise<HotelBulkActionResult> {
  const { data } = await api.post<HotelBulkActionResult>("/api/v1/hotels/bulk-restore", {
    hotel_uuids: uuids,
  });
  return data;
}
