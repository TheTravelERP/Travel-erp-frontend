// src/features/inventory/airline/airline.api.ts
import api from "../../../services/api";

import type {
  AirlineDetail,
  AirlineFormInput,
  AirlineListApiResponse,
  GetAirlinesParams,
  AirlineBulkActionResult,
} from "./airline.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createAirline(payload: AirlineFormInput) {
  const { data } = await api.post("/api/v1/airlines", cleanPayload(payload));
  return data;
}

export async function getAirlines(
  params: GetAirlinesParams,
  signal?: AbortSignal,
): Promise<AirlineListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<AirlineListApiResponse>("/api/v1/airlines", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getAirlineByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<AirlineDetail> {
  const { data } = await api.get<AirlineDetail>(`/api/v1/airlines/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateAirlineByUuid(
  uuid: string,
  payload: AirlineFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/airlines/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteAirlineByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/airlines/${uuid}`);
  return data;
}

export async function restoreAirlineByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/airlines/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteAirlines(uuids: string[]): Promise<AirlineBulkActionResult> {
  const { data } = await api.post<AirlineBulkActionResult>("/api/v1/airlines/bulk-delete", {
    airline_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreAirlines(uuids: string[]): Promise<AirlineBulkActionResult> {
  const { data } = await api.post<AirlineBulkActionResult>("/api/v1/airlines/bulk-restore", {
    airline_uuids: uuids,
  });
  return data;
}
