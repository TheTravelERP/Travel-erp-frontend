// src/features/package/packageService/packageService.api.ts
import api from "../../../services/api";

import type {
  PackageServiceDetail,
  PackageServiceFormInput,
  PackageServiceListApiResponse,
  GetPackageServicesParams,
  PackageServiceBulkActionResult,
} from "./packageService.types";

// Empty-string optional fields (untouched date/number inputs) are not valid
// values — FastAPI's Optional[...] rejects "" outright, so strip empty
// strings before sending rather than let every optional field risk a 422.
function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

/* ==========================================================
   CREATE
========================================================== */

export async function createPackageService(payload: PackageServiceFormInput) {
  const { data } = await api.post("/api/v1/package-services", cleanPayload(payload));
  return data;
}

/* ==========================================================
   LIST
========================================================== */

export async function getPackageServices(
  params: GetPackageServicesParams,
  signal?: AbortSignal,
): Promise<PackageServiceListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<PackageServiceListApiResponse>("/api/v1/package-services", {
    params: cleanParams,
    signal,
  });

  return data;
}

/* ==========================================================
   DETAIL
========================================================== */

export async function getPackageServiceByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<PackageServiceDetail> {
  const { data } = await api.get<PackageServiceDetail>(`/api/v1/package-services/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

/* ==========================================================
   UPDATE
========================================================== */

export async function updatePackageServiceByUuid(
  uuid: string,
  payload: PackageServiceFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/package-services/${uuid}`, cleanPayload(payload));
  return data;
}

/* ==========================================================
   DELETE / RESTORE
========================================================== */

export async function deletePackageServiceByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/package-services/${uuid}`);
  return data;
}

export async function restorePackageServiceByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/package-services/${uuid}/restore`, {});
  return data;
}

/* ==========================================================
   BULK
========================================================== */

export async function bulkDeletePackageServices(
  uuids: string[],
): Promise<PackageServiceBulkActionResult> {
  const { data } = await api.post<PackageServiceBulkActionResult>(
    "/api/v1/package-services/bulk-delete",
    { package_service_uuids: uuids },
  );
  return data;
}

export async function bulkRestorePackageServices(
  uuids: string[],
): Promise<PackageServiceBulkActionResult> {
  const { data } = await api.post<PackageServiceBulkActionResult>(
    "/api/v1/package-services/bulk-restore",
    { package_service_uuids: uuids },
  );
  return data;
}
