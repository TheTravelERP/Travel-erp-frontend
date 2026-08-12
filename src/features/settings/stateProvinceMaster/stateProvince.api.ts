// src/features/settings/stateProvinceMaster/stateProvince.api.ts
//
// Phase 4B: renamed City -> State/Province. Still calls the unchanged
// /api/v1/cities backend endpoints (internal-only API, zero external
// clients — see city_routes.py's module docstring for why the URL/field
// names stayed as "city" while every user-facing label changed).
import api from "../../../services/api";

import type {
  StateProvinceDetail,
  StateProvinceFormInput,
  StateProvinceListApiResponse,
  GetStateProvincesParams,
  StateProvinceBulkActionResult,
} from "./stateProvince.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createStateProvince(payload: StateProvinceFormInput): Promise<StateProvinceDetail> {
  const { data } = await api.post("/api/v1/cities", cleanPayload(payload));
  return data;
}

export async function getStateProvinces(
  params: GetStateProvincesParams,
  signal?: AbortSignal,
): Promise<StateProvinceListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<StateProvinceListApiResponse>("/api/v1/cities", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getStateProvinceByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<StateProvinceDetail> {
  const { data } = await api.get<StateProvinceDetail>(`/api/v1/cities/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateStateProvinceByUuid(
  uuid: string,
  payload: StateProvinceFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/cities/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteStateProvinceByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/cities/${uuid}`);
  return data;
}

export async function restoreStateProvinceByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/cities/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteStateProvinces(uuids: string[]): Promise<StateProvinceBulkActionResult> {
  const { data } = await api.post<StateProvinceBulkActionResult>("/api/v1/cities/bulk-delete", {
    city_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreStateProvinces(uuids: string[]): Promise<StateProvinceBulkActionResult> {
  const { data } = await api.post<StateProvinceBulkActionResult>("/api/v1/cities/bulk-restore", {
    city_uuids: uuids,
  });
  return data;
}

/* ==========================================================
   IMPORT
========================================================== */

import type { ImportResult } from "../../../components/common/ImportResultDialog";

export async function importStateProvincesFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ImportResult>("/api/v1/cities/import", formData);

  return data;
}
