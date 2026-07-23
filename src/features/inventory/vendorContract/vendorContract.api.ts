// src/features/inventory/vendorContract/vendorContract.api.ts
import api from "../../../services/api";

import type {
  VendorContractDetail,
  VendorContractFormInput,
  VendorContractListApiResponse,
  GetVendorContractsParams,
  VendorContractBulkActionResult,
} from "./vendorContract.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createVendorContract(payload: VendorContractFormInput) {
  const { data } = await api.post("/api/v1/vendor-contracts", cleanPayload(payload));
  return data;
}

export async function getVendorContracts(
  params: GetVendorContractsParams,
  signal?: AbortSignal,
): Promise<VendorContractListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<VendorContractListApiResponse>("/api/v1/vendor-contracts", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getVendorContractByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<VendorContractDetail> {
  const { data } = await api.get<VendorContractDetail>(`/api/v1/vendor-contracts/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateVendorContractByUuid(
  uuid: string,
  payload: VendorContractFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/vendor-contracts/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteVendorContractByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/vendor-contracts/${uuid}`);
  return data;
}

export async function restoreVendorContractByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/vendor-contracts/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteVendorContracts(uuids: string[]): Promise<VendorContractBulkActionResult> {
  const { data } = await api.post<VendorContractBulkActionResult>("/api/v1/vendor-contracts/bulk-delete", {
    vendor_contract_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreVendorContracts(uuids: string[]): Promise<VendorContractBulkActionResult> {
  const { data } = await api.post<VendorContractBulkActionResult>("/api/v1/vendor-contracts/bulk-restore", {
    vendor_contract_uuids: uuids,
  });
  return data;
}
