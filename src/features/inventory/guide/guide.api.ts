// src/features/inventory/guide/guide.api.ts
import api from "../../../services/api";

import type {
  GuideDetail,
  GuideFormInput,
  GuideListApiResponse,
  GetGuidesParams,
  GuideBulkActionResult,
} from "./guide.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createGuide(payload: GuideFormInput) {
  const { data } = await api.post("/api/v1/guides", cleanPayload(payload));
  return data;
}

export async function getGuides(
  params: GetGuidesParams,
  signal?: AbortSignal,
): Promise<GuideListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<GuideListApiResponse>("/api/v1/guides", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getGuideByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<GuideDetail> {
  const { data } = await api.get<GuideDetail>(`/api/v1/guides/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateGuideByUuid(
  uuid: string,
  payload: GuideFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/guides/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteGuideByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/guides/${uuid}`);
  return data;
}

export async function restoreGuideByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/guides/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteGuides(uuids: string[]): Promise<GuideBulkActionResult> {
  const { data } = await api.post<GuideBulkActionResult>("/api/v1/guides/bulk-delete", {
    guide_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreGuides(uuids: string[]): Promise<GuideBulkActionResult> {
  const { data } = await api.post<GuideBulkActionResult>("/api/v1/guides/bulk-restore", {
    guide_uuids: uuids,
  });
  return data;
}
