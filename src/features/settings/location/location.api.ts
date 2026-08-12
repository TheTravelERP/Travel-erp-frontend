// src/features/settings/location/location.api.ts
import api from "../../../services/api";

import type {
  LocationDetail,
  LocationFormInput,
  LocationListApiResponse,
  GetLocationsParams,
  LocationBulkActionResult,
} from "./location.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createLocation(payload: LocationFormInput) {
  const { data } = await api.post("/api/v1/locations", cleanPayload(payload));
  return data;
}

export async function getLocations(
  params: GetLocationsParams,
  signal?: AbortSignal,
): Promise<LocationListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<LocationListApiResponse>("/api/v1/locations", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getLocationByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<LocationDetail> {
  const { data } = await api.get<LocationDetail>(`/api/v1/locations/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateLocationByUuid(
  uuid: string,
  payload: LocationFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/locations/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteLocationByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/locations/${uuid}`);
  return data;
}

export async function restoreLocationByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/locations/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteLocations(uuids: string[]): Promise<LocationBulkActionResult> {
  const { data } = await api.post<LocationBulkActionResult>("/api/v1/locations/bulk-delete", {
    location_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreLocations(uuids: string[]): Promise<LocationBulkActionResult> {
  const { data } = await api.post<LocationBulkActionResult>("/api/v1/locations/bulk-restore", {
    location_uuids: uuids,
  });
  return data;
}
