// src/features/inventory/vendor/vendor.api.ts
import api from "../../../services/api";

import type {
  VendorDetail,
  VendorFormInput,
  VendorListApiResponse,
  GetVendorsParams,
  VendorBulkActionResult,
} from "./vendor.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createVendor(payload: VendorFormInput) {
  const { data } = await api.post("/api/v1/vendors", cleanPayload(payload));
  return data;
}

export async function getVendors(
  params: GetVendorsParams,
  signal?: AbortSignal,
): Promise<VendorListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<VendorListApiResponse>("/api/v1/vendors", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getVendorByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<VendorDetail> {
  const { data } = await api.get<VendorDetail>(`/api/v1/vendors/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateVendorByUuid(
  uuid: string,
  payload: VendorFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/vendors/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteVendorByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/vendors/${uuid}`);
  return data;
}

export async function restoreVendorByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/vendors/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteVendors(uuids: string[]): Promise<VendorBulkActionResult> {
  const { data } = await api.post<VendorBulkActionResult>("/api/v1/vendors/bulk-delete", {
    vendor_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreVendors(uuids: string[]): Promise<VendorBulkActionResult> {
  const { data } = await api.post<VendorBulkActionResult>("/api/v1/vendors/bulk-restore", {
    vendor_uuids: uuids,
  });
  return data;
}
