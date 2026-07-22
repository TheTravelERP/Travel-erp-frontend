// src/features/package/packageType/packageType.api.ts
import api from "../../../services/api";

import type {
  PackageTypeDetail,
  PackageTypeFormInput,
  PackageTypeListApiResponse,
  GetPackageTypesParams,
  PackageTypeBulkActionResult,
} from "./packageType.types";

/* ==========================================================
   CREATE
========================================================== */

export async function createPackageType(payload: PackageTypeFormInput) {
  const { data } = await api.post("/api/v1/package-types", payload);
  return data;
}

/* ==========================================================
   LIST
========================================================== */

export async function getPackageTypes(
  params: GetPackageTypesParams,
  signal?: AbortSignal,
): Promise<PackageTypeListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<PackageTypeListApiResponse>("/api/v1/package-types", {
    params: cleanParams,
    signal,
  });

  return data;
}

/* ==========================================================
   DETAIL
========================================================== */

export async function getPackageTypeByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<PackageTypeDetail> {
  const { data } = await api.get<PackageTypeDetail>(`/api/v1/package-types/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

/* ==========================================================
   UPDATE
========================================================== */

export async function updatePackageTypeByUuid(
  uuid: string,
  payload: PackageTypeFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/package-types/${uuid}`, payload);
  return data;
}

/* ==========================================================
   DELETE / RESTORE
========================================================== */

export async function deletePackageTypeByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/package-types/${uuid}`);
  return data;
}

export async function restorePackageTypeByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/package-types/${uuid}/restore`, {});
  return data;
}

/* ==========================================================
   BULK
========================================================== */

export async function bulkDeletePackageTypes(
  uuids: string[],
): Promise<PackageTypeBulkActionResult> {
  const { data } = await api.post<PackageTypeBulkActionResult>(
    "/api/v1/package-types/bulk-delete",
    { package_type_uuids: uuids },
  );
  return data;
}

export async function bulkRestorePackageTypes(
  uuids: string[],
): Promise<PackageTypeBulkActionResult> {
  const { data } = await api.post<PackageTypeBulkActionResult>(
    "/api/v1/package-types/bulk-restore",
    { package_type_uuids: uuids },
  );
  return data;
}
