// src/features/package/package.api.ts
import api from "../../services/api";

import type {
  PackageDetailResponse,
  PackageFormInput,
  PackageListApiResponse,
  GetPackagesParams,
  PackageBulkActionResult,
} from "./package.types";

// Empty-string date fields (e.g. an untouched date input) are not valid dates —
// FastAPI's Optional[date] rejects "" outright, so strip empty strings before
// sending rather than let every optional field risk a 422.
function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

/* ==========================================================
   CREATE
========================================================== */

export async function createPackage(payload: PackageFormInput) {
  const { data } = await api.post("/api/v1/packages", cleanPayload(payload));
  return data;
}

/* ==========================================================
   LIST
========================================================== */

export async function getPackages(
  params: GetPackagesParams,
  signal?: AbortSignal,
): Promise<PackageListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<PackageListApiResponse>("/api/v1/packages", {
    params: cleanParams,
    signal,
  });

  return data;
}

/* ==========================================================
   DETAIL
========================================================== */

export async function getPackageByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<PackageDetailResponse> {
  const { data } = await api.get<PackageDetailResponse>(`/api/v1/packages/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

/* ==========================================================
   UPDATE
========================================================== */

export async function updatePackageByUuid(
  uuid: string,
  payload: PackageFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/packages/${uuid}`, cleanPayload(payload));
  return data;
}

/* ==========================================================
   DELETE / RESTORE
========================================================== */

export async function deletePackageByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/packages/${uuid}`);
  return data;
}

export async function restorePackageByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/packages/${uuid}/restore`, {});
  return data;
}

/* ==========================================================
   BULK
========================================================== */

export async function bulkDeletePackages(uuids: string[]): Promise<PackageBulkActionResult> {
  const { data } = await api.post<PackageBulkActionResult>("/api/v1/packages/bulk-delete", {
    package_uuids: uuids,
  });
  return data;
}

export async function bulkRestorePackages(uuids: string[]): Promise<PackageBulkActionResult> {
  const { data } = await api.post<PackageBulkActionResult>("/api/v1/packages/bulk-restore", {
    package_uuids: uuids,
  });
  return data;
}
