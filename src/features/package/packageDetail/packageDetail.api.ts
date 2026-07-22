// src/features/package/packageDetail/packageDetail.api.ts
import api from "../../../services/api";

import type {
  PackageDetailDetail,
  PackageDetailFormInput,
  PackageDetailListApiResponse,
  GetPackageDetailsParams,
  PackageDetailBulkActionResult,
} from "./packageDetail.types";

/* ==========================================================
   CREATE
========================================================== */

export async function createPackageDetail(payload: PackageDetailFormInput) {
  const { data } = await api.post("/api/v1/package-details", payload);
  return data;
}

/* ==========================================================
   LIST
========================================================== */

export async function getPackageDetails(
  params: GetPackageDetailsParams,
  signal?: AbortSignal,
): Promise<PackageDetailListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<PackageDetailListApiResponse>("/api/v1/package-details", {
    params: cleanParams,
    signal,
  });

  return data;
}

/* ==========================================================
   DETAIL
========================================================== */

export async function getPackageDetailByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<PackageDetailDetail> {
  const { data } = await api.get<PackageDetailDetail>(`/api/v1/package-details/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

/* ==========================================================
   UPDATE
========================================================== */

export async function updatePackageDetailByUuid(
  uuid: string,
  payload: PackageDetailFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/package-details/${uuid}`, payload);
  return data;
}

/* ==========================================================
   DELETE / RESTORE
========================================================== */

export async function deletePackageDetailByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/package-details/${uuid}`);
  return data;
}

export async function restorePackageDetailByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/package-details/${uuid}/restore`, {});
  return data;
}

/* ==========================================================
   BULK
========================================================== */

export async function bulkDeletePackageDetails(
  uuids: string[],
): Promise<PackageDetailBulkActionResult> {
  const { data } = await api.post<PackageDetailBulkActionResult>(
    "/api/v1/package-details/bulk-delete",
    { package_detail_uuids: uuids },
  );
  return data;
}

export async function bulkRestorePackageDetails(
  uuids: string[],
): Promise<PackageDetailBulkActionResult> {
  const { data } = await api.post<PackageDetailBulkActionResult>(
    "/api/v1/package-details/bulk-restore",
    { package_detail_uuids: uuids },
  );
  return data;
}
