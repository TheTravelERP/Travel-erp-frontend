// src/features/inventory/ziyarat/ziyarat.api.ts
import api from "../../../services/api";

import type {
  ZiyaratDetail,
  ZiyaratFormInput,
  ZiyaratListApiResponse,
  GetZiyaratsParams,
  ZiyaratBulkActionResult,
} from "./ziyarat.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createZiyarat(payload: ZiyaratFormInput) {
  const { data } = await api.post("/api/v1/ziyarats", cleanPayload(payload));
  return data;
}

export async function getZiyarats(
  params: GetZiyaratsParams,
  signal?: AbortSignal,
): Promise<ZiyaratListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<ZiyaratListApiResponse>("/api/v1/ziyarats", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getZiyaratByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<ZiyaratDetail> {
  const { data } = await api.get<ZiyaratDetail>(`/api/v1/ziyarats/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateZiyaratByUuid(
  uuid: string,
  payload: ZiyaratFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/ziyarats/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteZiyaratByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/ziyarats/${uuid}`);
  return data;
}

export async function restoreZiyaratByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/ziyarats/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteZiyarats(uuids: string[]): Promise<ZiyaratBulkActionResult> {
  const { data } = await api.post<ZiyaratBulkActionResult>("/api/v1/ziyarats/bulk-delete", {
    ziyarat_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreZiyarats(uuids: string[]): Promise<ZiyaratBulkActionResult> {
  const { data } = await api.post<ZiyaratBulkActionResult>("/api/v1/ziyarats/bulk-restore", {
    ziyarat_uuids: uuids,
  });
  return data;
}
