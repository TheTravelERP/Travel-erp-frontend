// src/features/package/packagePricing/packagePricing.api.ts
import api from "../../../services/api";

import type {
  PackagePricingDetail,
  PackagePricingFormInput,
  PackagePricingListApiResponse,
  GetPackagePricingsParams,
  PackagePricingBulkActionResult,
} from "./packagePricing.types";

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

export async function createPackagePricing(payload: PackagePricingFormInput) {
  const { data } = await api.post("/api/v1/package-pricings", cleanPayload(payload));
  return data;
}

/* ==========================================================
   LIST
========================================================== */

export async function getPackagePricings(
  params: GetPackagePricingsParams,
  signal?: AbortSignal,
): Promise<PackagePricingListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<PackagePricingListApiResponse>("/api/v1/package-pricings", {
    params: cleanParams,
    signal,
  });

  return data;
}

/* ==========================================================
   DETAIL
========================================================== */

export async function getPackagePricingByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<PackagePricingDetail> {
  const { data } = await api.get<PackagePricingDetail>(`/api/v1/package-pricings/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

/* ==========================================================
   UPDATE
========================================================== */

export async function updatePackagePricingByUuid(
  uuid: string,
  payload: PackagePricingFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/package-pricings/${uuid}`, cleanPayload(payload));
  return data;
}

/* ==========================================================
   DELETE / RESTORE
========================================================== */

export async function deletePackagePricingByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/package-pricings/${uuid}`);
  return data;
}

export async function restorePackagePricingByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/package-pricings/${uuid}/restore`, {});
  return data;
}

/* ==========================================================
   BULK
========================================================== */

export async function bulkDeletePackagePricings(
  uuids: string[],
): Promise<PackagePricingBulkActionResult> {
  const { data } = await api.post<PackagePricingBulkActionResult>(
    "/api/v1/package-pricings/bulk-delete",
    { package_pricing_uuids: uuids },
  );
  return data;
}

export async function bulkRestorePackagePricings(
  uuids: string[],
): Promise<PackagePricingBulkActionResult> {
  const { data } = await api.post<PackagePricingBulkActionResult>(
    "/api/v1/package-pricings/bulk-restore",
    { package_pricing_uuids: uuids },
  );
  return data;
}
